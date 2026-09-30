const { google } = require('googleapis');
const nodemailer = require('nodemailer');

const OWNER_EMAIL  = 'zatuneya@gmail.com';
const SHEET_NAME   = '問い合わせ一覧';
// 診断ツールの公開URL。当面は Netlify（ai-shindan-zatuneya）。独自ドメイン取得時に最終URLへ再置換する
// （置換対象一覧は README「ドメイン確定時の再置換対象」を参照）。本番 Netlify では process.env.URL に本番URLが自動注入される。
const SITE_URL     = process.env.SITE_URL || process.env.URL || 'https://ai-shindan-zatuneya.netlify.app';

// =====================
// Google Sheets 書き込み
// =====================
async function appendToSheet(data) {
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
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
    data.industry  || '',
    data.scale     || '',
    data.score     != null ? String(data.score) : '',
    data.stage     || '',
    (data.recommendations || [])[0]?.service || '',
    (data.recommendations || [])[1]?.service || '',
    (data.issues    || []).join(' / '),
    (data.strengths || []).join(' / '),
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: `${SHEET_NAME}!A:M`,
    valueInputOption: 'RAW',
    requestBody: { values: [row] },
  });
}

// =====================
// メール送信
// =====================
async function sendEmails(data, { createTransport = nodemailer.createTransport } = {}) {
  const transporter = createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  // 診断結果ブロック（診断なし時は空）
  const diagnosisBlock = data.score != null
    ? [
        '',
        '─── 診断結果 ───',
        `スコア: ${data.score}点（${data.stage}）`,
        `業種: ${data.industry || '—'}`,
        `従業員規模: ${data.scale || '—'}`,
      ].join('\n')
    : '';

  // ユーザーへの自動返信
  await transporter.sendMail({
    from: `ざつね屋 <${process.env.GMAIL_USER}>`,
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
      SITE_URL,
    ].join('\n'),
  });

  // オーナーへの通知
  const recLines = (data.recommendations || [])
    .map((r, i) => `推奨${i + 1}: ${r.service}（${r.price}）`)
    .join('\n');

  const issuesLine    = (data.issues    || []).join(' / ');
  const strengthsLine = (data.strengths || []).join(' / ');

  await transporter.sendMail({
    from: `ざつね屋 問い合わせ通知 <${process.env.GMAIL_USER}>`,
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
        issuesLine    ? `【課題】${issuesLine}` : '',
        strengthsLine ? `【強み】${strengthsLine}` : '',
      ].filter(Boolean).join('\n') : '',
      recLines ? `\n【推奨サービス】\n${recLines}` : '',
      '',
      `【受付時刻】${new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}`,
    ].filter(l => l !== undefined).join('\n'),
  });
}

function isValidEmail(value) {
  if (typeof value !== 'string' || value.length === 0 || value.length > 254) return false;
  if (value !== value.trim() || /[\u0000-\u0020\u007f]/.test(value)) return false;

  const at = value.indexOf('@');
  if (at <= 0 || at !== value.lastIndexOf('@')) return false;

  const local = value.slice(0, at);
  const domain = value.slice(at + 1);
  if (local.length > 64 || domain.length > 253) return false;
  if (!/^[A-Za-z0-9!#$%&'*+/=?^_`{|}~.-]+$/.test(local)) return false;
  if (local.startsWith('.') || local.endsWith('.') || local.includes('..')) return false;

  const labels = domain.split('.');
  if (labels.length < 2) return false;
  return labels.every((label) => (
    label.length >= 1
    && label.length <= 63
    && /^[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?$/.test(label)
  ));
}

// =====================
// メインハンドラ
// =====================
function createHandler({ appendToSheet: append = appendToSheet, sendEmails: send = sendEmails } = {}) {
  return async (event) => {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }

    let data;
    try {
      data = JSON.parse(event.body);
    } catch {
      return { statusCode: 400, body: JSON.stringify({ ok: false, error: 'Invalid JSON' }) };
    }

    // 必須フィールド確認
    if (!data || typeof data !== 'object' || !data.type || !data.companyName || !data.contactName) {
      return { statusCode: 400, body: JSON.stringify({ ok: false, error: 'Missing required fields' }) };
    }
    if (!isValidEmail(data.email)) {
      return { statusCode: 400, body: JSON.stringify({ ok: false, error: 'Invalid email' }) };
    }

    const errors = [];

    try {
      await append(data);
    } catch (e) {
      console.error('Sheets error:', e.message);
      errors.push('sheet');
    }

    try {
      await send(data);
    } catch (e) {
      console.error('Email error:', e.message);
      errors.push('email');
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true, errors }),
    };
  };
}

exports.isValidEmail = isValidEmail;
exports.sendEmails = sendEmails;
exports.createHandler = createHandler;
exports.handler = createHandler();
