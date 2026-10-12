// Anthropic API 呼び出し側の共通処理：クライアント生成・モデル選択・エラーの原因別分類。
import Anthropic from '@anthropic-ai/sdk';
import { fail } from './http.mjs';

export function createClient({ timeoutMs, maxRetries }, env = process.env) {
  const apiKey = env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  return new Anthropic({ apiKey, timeout: timeoutMs, maxRetries });
}

// 環境変数でモデルを差し替えられる（廃止・不具合時にコード変更なしで戻せる）。形式不正なら既定値を使う。
export function pickModel(envName, fallback, env = process.env) {
  const v = env[envName];
  return typeof v === 'string' && /^claude-[a-z0-9.-]{3,60}$/.test(v) ? v : fallback;
}

export function configMissing() {
  return fail(500, 'CONFIG_MISSING_ANTHROPIC_KEY', 'AI 機能の設定が完了していません。ざつね屋までご連絡ください。');
}

// Anthropic API のエラーを「誰が・どう直すか」で分ける。status / type / request_id は detail に残す。
export function classifyApiError(err) {
  const status = typeof err?.status === 'number' ? err.status : null;
  const type = err?.error?.error?.type || err?.error?.type || '';
  const requestId = err?.requestID || err?.request_id || '';
  const msg = String(err?.message || '');
  const detail = [
    status !== null ? `upstream_status=${status}` : null,
    type ? `type=${type}` : null,
    requestId ? `request_id=${requestId}` : null,
    status === null && err?.constructor?.name ? `error=${err.constructor.name}` : null,
  ]
    .filter(Boolean)
    .join(' ');

  const mk = (httpStatus, code, message) => ({ httpStatus, code, message, detail });

  if (err instanceof Anthropic.APIConnectionTimeoutError) {
    return mk(504, 'UPSTREAM_TIMEOUT', 'AI の応答に時間がかかりすぎました。しばらく待ってからもう一度お試しください。');
  }
  if (err instanceof Anthropic.APIConnectionError) {
    return mk(502, 'UPSTREAM_CONNECTION', 'AI サービスに接続できませんでした。しばらく待ってからもう一度お試しください。');
  }
  if (status === 401) return mk(500, 'ANTHROPIC_AUTH', 'AI 機能の認証に問題があります。ざつね屋までご連絡ください。');
  if (status === 403) return mk(500, 'ANTHROPIC_PERMISSION', 'AI 機能の利用権限に問題があります。ざつね屋までご連絡ください。');
  if (status === 404) return mk(500, 'ANTHROPIC_MODEL_NOT_FOUND', 'AI 機能の設定（モデル）に問題があります。ざつね屋までご連絡ください。');
  if (status === 400 && /credit balance/i.test(msg)) {
    return mk(500, 'ANTHROPIC_BILLING', 'AI 機能の利用枠に問題があります。ざつね屋までご連絡ください。');
  }
  if (status === 400 || status === 422) {
    return mk(500, 'ANTHROPIC_BAD_REQUEST', 'AI 機能の設定に問題があります。ざつね屋までご連絡ください。');
  }
  if (status === 413) return mk(413, 'ANTHROPIC_TOO_LARGE', '入力内容が大きすぎます。内容を短くしてもう一度お試しください。');
  if (status === 429) {
    return mk(503, 'UPSTREAM_RATE_LIMITED', 'AI サービスが混み合っています。しばらく待ってからもう一度お試しください。');
  }
  if (status === 529 || type === 'overloaded_error') {
    return mk(503, 'UPSTREAM_OVERLOADED', 'AI サービスが混み合っています。しばらく待ってからもう一度お試しください。');
  }
  if (status !== null && status >= 500) {
    return mk(502, 'UPSTREAM_ERROR', 'AI サービス側で一時的な問題が起きています。しばらく待ってからもう一度お試しください。');
  }
  return mk(500, 'UPSTREAM_UNKNOWN', 'AI の呼び出しで想定外のエラーが起きました。ざつね屋までご連絡ください。');
}

// 応答から本文テキストを取り出す。思考ブロック等が先頭に来ても影響を受けない。
// 戻り値：{ text } または { errorCode, message }
export function extractText(message) {
  if (message?.stop_reason === 'refusal') {
    return { errorCode: 'AI_REFUSED', message: 'AI が今回の内容には回答できませんでした。' };
  }
  if (message?.stop_reason === 'max_tokens') {
    return { errorCode: 'AI_TRUNCATED', message: 'AI の回答が途中で切れました。もう一度お試しください。' };
  }
  const text = (message?.content || [])
    .filter((b) => b?.type === 'text' && typeof b.text === 'string')
    .map((b) => b.text)
    .join('')
    .trim();
  if (!text) return { errorCode: 'AI_EMPTY', message: 'AI から回答が得られませんでした。もう一度お試しください。' };
  return { text };
}
