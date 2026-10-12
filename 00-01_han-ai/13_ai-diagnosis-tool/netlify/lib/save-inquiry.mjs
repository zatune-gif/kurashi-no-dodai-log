// 問い合わせを Google Sheets に追記し、オーナー通知と申込者への自動返信メールを送る。
// 外部から誰でも叩ける＝メール送信の踏み台にされ得るため、入力検証・宛先1件限定・送信回数制限を入れている。
import { ok, fail, logEvent } from './http.mjs';
import {
  createRateLimiter, preflight, invalidInput, rateLimited, ValidationError,
  str, strArray, intInRange, oneOf, email, STAGES,
} from './guard.mjs';

const FN = 'save-inquiry';
const OWNER_EMAIL = 'zatuneya@gmail.com';
const SHEET_NAME = '問い合わせ一覧';
const MAX_BODY_BYTES = 32 * 1024;
const TYPES = ['資料請求（診断なし）', '詳細診断・相談', '詳細診断・見積'];

// ---------- 入力検証 ----------
function validate(b) {
  const recs = b.recommendations;
  if (recs !== undefined && recs !== null && !Array.isArray(recs)) {
    throw new ValidationError('recommendations', 'must_be_array');
  }
  if (recs && recs.length > 5) throw new ValidationError('recommendations', 'too_many_items(max=5)');
  return {
    type: oneOf(b.type, 'type', TYPES),
    companyName: str(b.companyName, 'companyName', { max: 100, required: true }),
    contactName: str(b.contactName, 'contactName', { max: 100, required: true }),
    email: email(b.email, 'email'),
    industry: str(b.industry, 'industry', { max: 100 }),
    scale: str(b.scale, 'scale', { max: 100 }),
    score: intInRange(b.score, 'score', { min: 0, max: 100, required: false }),
    stage: oneOf(b.stage, 'stage', STAGES, { required: false }),
    strengths: strArray(b.strengths, 'strengths', { maxItems: 20, maxLen: 200 }),
    issues: strArray(b.issues, 'issues', { maxItems: 20, maxLen: 200 }),
    recommendations: (recs || []).map((r, i) => ({
      service: str(r?.service, `recommendations[${i}].service`, { max: 100 }),
      price: str(r?.price, `recommendations[${i}].price`, { max: 100 }),
    })),
  };
}

// ---------- エラーの原因別分類（誰が直すか／対処が違うものは別コード）----------
export function classifySheetError(err) {
  const status = Number(err?.response?.status ?? (typeof err?.code === 'number' ? err.code : NaN));
  const raw = typeof err?.code === 'string' ? err.code : '';
  const msg = String(err?.message || '');
  const detail = [Number.isFinite(status) ? `status=${status}` : null, raw ? `code=${raw}` : null]
    .filter(Boolean).join(' ');
  if (err?.name === 'SheetConfigError') return { code: 'SHEET_CONFIG_MISSING', detail: err.message };
  if (/invalid_grant|invalid_client|unauthorized_client/i.test(msg) || status === 401) return { code: 'SHEET_AUTH', detail };
  if (status === 403 && /has not been used|disabled/i.test(msg)) return { code: 'SHEET_API_DISABLED', detail };
  if (status === 403) return { code: 'SHEET_FORBIDDEN', detail };
  if (status === 404) return { code: 'SHEET_NOT_FOUND', detail };
  if (status === 400 && /unable to parse range|range/i.test(msg)) return { code: 'SHEET_TAB_NOT_FOUND', detail };
  if (status === 400) return { code: 'SHEET_BAD_REQUEST', detail };
  if (status === 429) return { code: 'SHEET_QUOTA', detail };
  if (status >= 500) return { code: 'SHEET_UPSTREAM', detail };
  if (/^(ENOTFOUND|ECONNRESET|ECONNREFUSED|ETIMEDOUT|EAI_AGAIN|ESOCKETTIMEDOUT)$/.test(raw)) return { code: 'SHEET_NETWORK', detail };
  return { code: 'SHEET_UNKNOWN', detail: detail || err?.name || '' };
}

export function classifyMailError(err, target) {
  const raw = typeof err?.code === 'string' ? err.code : '';
  const rc = err?.responseCode;
  const detail = [raw ? `code=${raw}` : null, rc ? `smtp=${rc}` : null].filter(Boolean).join(' ');
  const p = target === 'owner_mail' ? 'OWNER_MAIL' : 'USER_MAIL';
  if (err?.name === 'MailConfigError') return { code: 'MAIL_CONFIG_MISSING', detail: err.message };
  if (raw === 'EAUTH' || raw === 'ENOAUTH') return { code: 'MAIL_AUTH', detail };
  if (raw === 'EENVELOPE' || (rc >= 500 && rc < 600 && /recipient|address|user unknown|mailbox/i.test(String(err?.message || '')))) {
    return { code: `${p}_BAD_ADDRESS`, detail };
  }
  if (rc === 550 && /limit|quota|exceeded/i.test(String(err?.message || ''))) return { code: 'MAIL_QUOTA', detail };
  if (/^(ECONNECTION|ETIMEDOUT|ESOCKET|EDNS|ECONNRESET|ECONNREFUSED|ENOTFOUND|EAI_AGAIN)$/.test(raw)) return { code: 'MAIL_NETWORK', detail };
  if (rc >= 400 && rc < 500) return { code: 'MAIL_TEMPORARY', detail };
  if (rc >= 500) return { code: 'MAIL_REJECTED', detail };
  return { code: 'MAIL_UNKNOWN', detail: detail || err?.name || '' };
}

// ---------- 実際の外部連携（テストでは差し替える）----------
export async function realAppendToSheet(data, env = process.env) {
  let credentials;
  try {
    credentials = JSON.parse(env.GOOGLE_SERVICE_ACCOUNT_JSON);
  } catch {
    const e = new Error('GOOGLE_SERVICE_ACCOUNT_JSON が未設定または JSON として読めません');
    e.name = 'SheetConfigError';
    throw e;
  }
  if (!env.GOOGLE_SHEET_ID) {
    const e = new Error('GOOGLE_SHEET_ID が未設定です');
    e.name = 'SheetConfigError';
    throw e;
  }
  const mod = await import('googleapis');
  const google = mod.google ?? mod.default.google;
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  const row = [
    new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }),
    data.type,
    data.companyName,
    data.contactName,
    data.email,
    data.industry || '',
    data.scale || '',
    data.score != null ? String(data.score) : '',
    data.stage || '',
    data.recommendations[0]?.service || '',
    data.recommendations[1]?.service || '',
    data.issues.join(' / '),
    data.strengths.join(' / '),
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId: env.GOOGLE_SHEET_ID,
    range: `${SHEET_NAME}!A:M`,
    valueInputOption: 'RAW',
    requestBody: { values: [row] },
  });
}

export async function realSendMail(mail, env = process.env) {
  if (!env.GMAIL_USER || !env.GMAIL_APP_PASSWORD) {
    const e = new Error('GMAIL_USER / GMAIL_APP_PASSWORD が未設定です');
    e.name = 'MailConfigError';
    throw e;
  }
  const mod = await import('nodemailer');
  const nodemailer = mod.default ?? mod;
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: env.GMAIL_USER, pass: env.GMAIL_APP_PASSWORD },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
  await transporter.sendMail({ from: `${mail.fromName} <${env.GMAIL_USER}>`, to: mail.to, subject: mail.subject, text: mail.text });
}

// ---------- メール本文 ----------
function buildUserMail(data, siteUrl) {
  const diagnosisBlock = data.score != null
    ? ['', '─── 診断結果 ───', `スコア: ${data.score}点（${data.stage}）`, `業種: ${data.industry || '—'}`, `従業員規模: ${data.scale || '—'}`].join('\n')
    : '';
  return {
    fromName: 'ざつね屋',
    to: data.email,
    subject: '【ざつね屋】お問い合わせを受け付けました',
    text: [
      `${data.contactName} 様`,
      '',
      `このたびは「${data.type}」のお申し込みをいただき、`,
      'ありがとうございます。',
      '内容を確認のうえ、2営業日以内にご連絡いたします。',
      '',
      '─────────────────',
      '受付内容',
      '─────────────────',
      `種別　 : ${data.type}`,
      `会社名 : ${data.companyName}`,
      `担当者 : ${data.contactName}`,
      diagnosisBlock,
      '',
      '─────────────────',
      'ざつね屋',
      siteUrl,
    ].join('\n'),
  };
}

function buildOwnerMail(data) {
  const recLines = data.recommendations.map((r, i) => `推奨${i + 1}: ${r.service}（${r.price}）`).join('\n');
  const issuesLine = data.issues.join(' / ');
  const strengthsLine = data.strengths.join(' / ');
  return {
    fromName: 'ざつね屋 問い合わせ通知',
    to: OWNER_EMAIL,
    subject: `【新規問い合わせ】${data.type}：${data.companyName}`,
    text: [
      `【種別】${data.type}`,
      `【会社名】${data.companyName}`,
      `【担当者】${data.contactName}`,
      `【メール】${data.email}`,
      data.score != null ? [
        '',
        `【診断スコア】${data.score}点（${data.stage}）`,
        `【業種】${data.industry || '—'}`,
        `【規模】${data.scale || '—'}`,
        issuesLine ? `【課題】${issuesLine}` : '',
        strengthsLine ? `【強み】${strengthsLine}` : '',
      ].filter(Boolean).join('\n') : '',
      recLines ? `\n【推奨サービス】\n${recLines}` : '',
      '',
      `【受付時刻】${new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}`,
    ].join('\n'),
  };
}

// ---------- ハンドラ ----------
export function createHandler(deps = {}) {
  const env = deps.env || process.env;
  const appendToSheet = deps.appendToSheet || ((d) => realAppendToSheet(d, env));
  const sendMail = deps.sendMail || ((m) => realSendMail(m, env));
  // 診断ツールの公開URL（自動返信メールの署名に載せる）。Netlify は本番URLを process.env.URL に自動注入する。
  const siteUrl = env.SITE_URL || env.URL || 'https://ai-shindan-zatuneya.netlify.app';

  const limiter = createRateLimiter({ windowMs: 10 * 60 * 1000, max: 20 });
  const globalLimiter = createRateLimiter({ windowMs: 60 * 60 * 1000, max: 200 });
  // 同じメールアドレス宛ての自動返信を短時間に連発させない（第三者のアドレスへのメール爆撃の防止）
  const perEmailLimiter = createRateLimiter({ windowMs: 60 * 60 * 1000, max: 3 });

  return async function handler(req, context) {
    const pre = await preflight(req, context, { limiter, globalLimiter, maxBytes: MAX_BODY_BYTES });
    if (pre.response) return pre.response;

    // ハニーポット：画面には出ない項目が埋まっていればボット。成功を装って何も処理しない
    if (typeof pre.body.website === 'string' && pre.body.website.trim() !== '') {
      logEvent(FN, 'honeypot_hit', {});
      return ok({ saved: false, failures: [] });
    }

    let data;
    try {
      data = validate(pre.body);
    } catch (e) {
      if (e instanceof ValidationError) return invalidInput(e);
      throw e;
    }

    const e = perEmailLimiter.check(data.email.toLowerCase());
    if (!e.allowed) {
      logEvent(FN, 'rate_limited', { code: 'RATE_LIMITED_EMAIL' });
      return rateLimited(e.retryAfterSec, 'ip');
    }

    const failures = [];
    const run = async (target, fn) => {
      try {
        await fn();
        return true;
      } catch (err) {
        const c = target === 'sheet' ? classifySheetError(err) : classifyMailError(err, target);
        failures.push({ target, code: c.code, detail: c.detail });
        logEvent(FN, 'step_failed', { target, code: c.code, detail: c.detail });
        return false;
      }
    };

    const sheetOk = await run('sheet', () => appendToSheet(data));
    const ownerOk = await run('owner_mail', () => sendMail(buildOwnerMail(data)));
    await run('user_mail', () => sendMail(buildUserMail(data, siteUrl)));

    // 記録（シート）も担当者への通知も失敗＝この問い合わせが誰にも届いていない
    if (!sheetOk && !ownerOk) {
      return fail(502, 'INQUIRY_NOT_RECORDED', '送信を完了できませんでした。お手数ですが info@zatuneya.com までご連絡ください。', {
        detail: failures.map((f) => `${f.target}:${f.code}`).join(','),
      });
    }
    return ok({ saved: true, failures });
  };
}
