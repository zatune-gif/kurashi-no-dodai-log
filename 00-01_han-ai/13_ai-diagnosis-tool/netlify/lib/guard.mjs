// 外部から叩ける関数の共通ガード：メソッド確認・同一IPの連続送信制限・本文サイズ上限・入力検証ヘルパー。
import { fail } from './http.mjs';

// ---------- クライアントIP ----------
export function clientIp(req, context) {
  return (
    context?.ip ||
    req.headers.get('x-nf-client-connection-ip') ||
    (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() ||
    'unknown'
  );
}

// ---------- 連続送信の制限（関数インスタンス内のメモリ）----------
// 注意：Netlify は関数インスタンスを複数起動し得るため、これは「補助」の防御。
// 本線の防御は各関数ファイルの config.rateLimit（Netlify 側のレート制限）。
export function createRateLimiter({ windowMs, max, maxKeys = 5000 }) {
  const hits = new Map(); // key -> 直近リクエスト時刻の配列
  return {
    check(key, now = Date.now()) {
      const from = now - windowMs;
      const list = (hits.get(key) || []).filter((t) => t > from);
      if (list.length >= max) {
        hits.set(key, list);
        const retryAfterSec = Math.max(1, Math.ceil((list[0] + windowMs - now) / 1000));
        return { allowed: false, retryAfterSec };
      }
      list.push(now);
      hits.set(key, list);
      if (hits.size > maxKeys) {
        for (const [k, v] of hits) {
          if (!v.some((t) => t > from)) hits.delete(k);
        }
        // それでも多すぎる場合は古い順に捨てる（メモリ肥大の防止）
        while (hits.size > maxKeys) hits.delete(hits.keys().next().value);
      }
      return { allowed: true, retryAfterSec: 0 };
    },
  };
}

export function rateLimited(retryAfterSec, scope) {
  const global = scope === 'global';
  const message = global
    ? 'ただいまアクセスが集中しています。しばらく待ってからもう一度お試しください。'
    : '短時間に操作が続いたため、いったん受け付けを止めています。しばらく待ってからもう一度お試しください。';
  return fail(429, global ? 'RATE_LIMITED_GLOBAL' : 'RATE_LIMITED', message, {
    detail: `retry_after=${retryAfterSec}s`,
    headers: { 'Retry-After': String(retryAfterSec) },
  });
}

// ---------- リクエストの前処理 ----------
// 戻り値：{ response } なら処理を打ち切ってそのまま返す。{ body, ip } なら本処理へ進む。
export async function preflight(req, context, { limiter, globalLimiter, maxBytes }) {
  if (req.method !== 'POST') {
    return {
      response: fail(405, 'METHOD_NOT_ALLOWED', 'この操作は POST でのみ受け付けています。', {
        headers: { Allow: 'POST' },
      }),
    };
  }

  const ip = clientIp(req, context);

  const g = globalLimiter.check('global');
  if (!g.allowed) return { response: rateLimited(g.retryAfterSec, 'global') };
  const p = limiter.check(ip);
  if (!p.allowed) return { response: rateLimited(p.retryAfterSec, 'ip') };

  const tooLarge = () =>
    fail(413, 'PAYLOAD_TOO_LARGE', '送信内容が大きすぎます。', { detail: `limit=${maxBytes}B` });

  const declared = Number(req.headers.get('content-length'));
  if (Number.isFinite(declared) && declared > maxBytes) return { response: tooLarge() };

  let text;
  try {
    text = await req.text();
  } catch {
    return { response: fail(400, 'BODY_READ_FAILED', '送信内容を読み取れませんでした。') };
  }
  if (Buffer.byteLength(text, 'utf8') > maxBytes) return { response: tooLarge() };

  let body;
  try {
    body = JSON.parse(text);
  } catch {
    return { response: fail(400, 'INVALID_JSON', '送信内容の形式が正しくありません。') };
  }
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    return { response: fail(400, 'INVALID_JSON', '送信内容の形式が正しくありません。') };
  }
  return { body, ip };
}

// ---------- 入力検証ヘルパー ----------
// いずれも失敗時は ValidationError を throw する。
export class ValidationError extends Error {
  constructor(field, reason) {
    super(`${field}: ${reason}`);
    this.name = 'ValidationError';
    this.field = field;
    this.reason = reason;
  }
}

// 制御文字を除去（メールの件名・ヘッダや AI プロンプトへの混入を防ぐ）
const CONTROL = /[\u0000-\u0008\u000B-\u001F\u007F]/g;

export function str(v, field, { max, required = false, def = '' } = {}) {
  if (v === undefined || v === null || v === '') {
    if (required) throw new ValidationError(field, 'required');
    return def;
  }
  if (typeof v !== 'string') throw new ValidationError(field, 'must_be_string');
  const s = v.replace(CONTROL, ' ').replace(/[\r\n]+/g, ' ').trim();
  if (required && s === '') throw new ValidationError(field, 'required');
  if (s.length > max) throw new ValidationError(field, `too_long(max=${max})`);
  return s;
}

export function strArray(v, field, { maxItems, maxLen }) {
  if (v === undefined || v === null) return [];
  if (!Array.isArray(v)) throw new ValidationError(field, 'must_be_array');
  if (v.length > maxItems) throw new ValidationError(field, `too_many_items(max=${maxItems})`);
  return v.map((x, i) => str(x, `${field}[${i}]`, { max: maxLen }));
}

export function intInRange(v, field, { min, max, required = true }) {
  if (v === undefined || v === null) {
    if (required) throw new ValidationError(field, 'required');
    return null;
  }
  if (typeof v !== 'number' || !Number.isInteger(v) || v < min || v > max) {
    throw new ValidationError(field, `must_be_integer_${min}_to_${max}`);
  }
  return v;
}

export function oneOf(v, field, allowed, { required = true } = {}) {
  if (v === undefined || v === null || v === '') {
    if (required) throw new ValidationError(field, 'required');
    return '';
  }
  if (!allowed.includes(v)) throw new ValidationError(field, 'unexpected_value');
  return v;
}

// 複数の宛先（カンマ区切り等）を許さない厳しめのメール形式。メール送信の踏み台化を防ぐ。
const EMAIL =
  /^[^\s@,;<>()"'\\]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)+$/;
export function email(v, field) {
  const s = str(v, field, { max: 254, required: true });
  if (!EMAIL.test(s)) throw new ValidationError(field, 'invalid_email');
  return s;
}

export function invalidInput(err) {
  return fail(400, 'VALIDATION_FAILED', '入力内容に不備があります。内容を確認してもう一度お試しください。', {
    detail: `field=${err.field} reason=${err.reason}`,
  });
}

export const STAGES = ['準備期', '導入期', '活用期', '推進期'];
