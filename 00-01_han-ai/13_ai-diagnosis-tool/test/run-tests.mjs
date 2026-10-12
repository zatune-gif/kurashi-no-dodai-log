// 診断ツールの Netlify Functions の最小テスト。実際の外部サービス（Anthropic・Google・Gmail）とは通信しない。
// 実行：npm test（= node test/run-tests.mjs）
// - 外部連携は差し替え（モック）で正常系・異常系を確認する。
// - Anthropic SDK だけは、手元(127.0.0.1)の模擬サーバーに向けて実際にソケット通信させ、
//   SDK が返す本物のエラークラス・タイムアウト・接続拒否が原因別コードに分類されることも確認する。
import http from 'node:http';
import fs from 'node:fs';
import vm from 'node:vm';
import Anthropic from '@anthropic-ai/sdk';

import * as comment from '../netlify/lib/generate-comment.mjs';
import * as library from '../netlify/lib/generate-library.mjs';
import * as inquiry from '../netlify/lib/save-inquiry.mjs';
import { createRateLimiter } from '../netlify/lib/guard.mjs';

let total = 0;
let passed = 0;
const failures = [];
async function t(name, fn) {
  total += 1;
  try {
    await fn();
    passed += 1;
  } catch (e) {
    failures.push(`${name}\n    ${e.message}`);
  }
}
function eq(actual, expected, label = '') {
  if (actual !== expected) throw new Error(`${label} expected=${JSON.stringify(expected)} actual=${JSON.stringify(actual)}`);
}
function truthy(v, label = '') {
  if (!v) throw new Error(`${label} expected truthy, got ${JSON.stringify(v)}`);
}

// ログ出力を捕まえる（診断ログに秘密情報が出ていないことの確認用）
const captured = [];
const origErr = console.error;
console.error = (...a) => captured.push(a.join(' '));

const SECRET_KEY = 'sk-ant-TESTSECRET-0000';
const SECRET_PASS = 'gmail-app-pass-TESTSECRET';

function mkReq(body, { method = 'POST', headers = {}, raw } = {}) {
  const init = { method, headers: { 'Content-Type': 'application/json', ...headers } };
  if (method !== 'GET' && method !== 'HEAD') init.body = raw !== undefined ? raw : JSON.stringify(body);
  return new Request('https://example.test/api/x', init);
}
const ctx = (ip = '203.0.113.1') => ({ ip });
async function call(handler, body, opts = {}, ip) {
  const res = await handler(mkReq(body, opts), ctx(ip));
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch { /* 本文が JSON でない場合は null */ }
  return { status: res.status, json, headers: res.headers, text };
}

function apiError(status, type, message = 'x') {
  return Anthropic.APIError.generate(status, { type: 'error', error: { type, message } }, message, new Headers({ 'request-id': 'req_test123' }));
}
const textMsg = (text, extra = {}) => ({ stop_reason: 'end_turn', content: [{ type: 'text', text }], ...extra });
function fakeClientDeps(createImpl, env = { ANTHROPIC_API_KEY: SECRET_KEY }) {
  const calls = [];
  const opts = [];
  return {
    calls,
    opts,
    deps: {
      env,
      createClient: (o) => {
        opts.push(o);
        return { messages: { create: async (p) => { calls.push(p); return createImpl(p); } } };
      },
    },
  };
}

const COMMENT_BODY = { score: 55, stage: '導入期', strengths: ['強み1'], issues: ['課題1'] };
const THREE_ACTIONS = 'まず社内で使うAIツールを一つに絞り、全員が同じ画面で触れる状態にしましょう。\n毎週の定例業務から一つ選び、AIに下書きを作らせて手順を記録してください。\n成果と失敗を月に一度共有する場を作り、使い方のルールを少しずつ更新しましょう。';
const LIB_BODY = {
  score: 40, stage: '導入期', industry: '製造業', scale: '10〜29名', customerType: '法人中心',
  documentTypes: ['見積書'], staffSkill: 'ITスキルは低め', mainProblem: '見積作成に時間がかかる',
  companyFeature: '', targetTasks: ['メール返信', '見積書作成'], aiTool: 'ChatGPT', tone: 'ビジネスカジュアル',
  scope: 'チームで共有', strengths: ['a'], issues: ['b'],
};
const LIB_JSON = JSON.stringify({
  prompts: [{ task: 'メール返信', title: '返信の下書き', prompt: 'あなたは広報担当です。【　】' }],
  actions: ['アクション1です。', 'アクション2です。', 'アクション3です。'],
  recommendations: [{ rank: 1, type: 'standalone', service: '業務の見直し支援（業務改善）', price: '320,000円', reason: '理由です。' }],
});
const INQ_BODY = {
  type: '詳細診断・相談', companyName: '株式会社テスト', contactName: '大音 晃司', email: 'test@example.com',
  score: 50, stage: '導入期', industry: '製造業', scale: '10〜29名', strengths: ['s'], issues: ['i'],
  recommendations: [{ service: '業務の見直し支援（業務改善）', price: '320,000円' }],
};
function inqDeps(over = {}) {
  const sheet = [];
  const mails = [];
  return {
    sheet, mails,
    deps: {
      env: { SITE_URL: 'https://site.test', GMAIL_USER: 'x@y.z', GMAIL_APP_PASSWORD: SECRET_PASS },
      appendToSheet: async (d) => { sheet.push(d); },
      sendMail: async (m) => { mails.push(m); },
      ...over,
    },
  };
}

// ============ 共通ガード ============
await t('rate limiter: 上限までは許可・超えると拒否し retryAfter を返す', () => {
  const l = createRateLimiter({ windowMs: 1000, max: 2 });
  eq(l.check('a', 0).allowed, true); eq(l.check('a', 10).allowed, true);
  const r = l.check('a', 20);
  eq(r.allowed, false); truthy(r.retryAfterSec >= 1, 'retryAfter');
});
await t('rate limiter: 窓を過ぎれば再び許可・別キーは独立', () => {
  const l = createRateLimiter({ windowMs: 1000, max: 1 });
  l.check('a', 0);
  eq(l.check('a', 500).allowed, false);
  eq(l.check('b', 500).allowed, true);
  eq(l.check('a', 1500).allowed, true);
});
await t('rate limiter: キー数が上限を超えてもメモリが増え続けない', () => {
  const l = createRateLimiter({ windowMs: 100000, max: 1, maxKeys: 50 });
  for (let i = 0; i < 500; i++) l.check(`k${i}`, i);
  eq(l.check('k499', 600).allowed, false, '直近キーは保持');
});

for (const [label, mod, mkDeps] of [
  ['generate-comment', comment, () => fakeClientDeps(async () => textMsg(THREE_ACTIONS)).deps],
  ['generate-library', library, () => fakeClientDeps(async () => textMsg(LIB_JSON)).deps],
  ['save-inquiry', inquiry, () => inqDeps().deps],
]) {
  const body = label === 'generate-comment' ? COMMENT_BODY : label === 'generate-library' ? LIB_BODY : INQ_BODY;
  await t(`${label}: GET は 405 METHOD_NOT_ALLOWED`, async () => {
    const r = await call(mod.createHandler(mkDeps()), null, { method: 'GET' });
    eq(r.status, 405); eq(r.json.error.code, 'METHOD_NOT_ALLOWED'); eq(r.json.ok, false);
  });
  await t(`${label}: JSON でない本文は 400 INVALID_JSON`, async () => {
    const r = await call(mod.createHandler(mkDeps()), null, { raw: '{oops' });
    eq(r.status, 400); eq(r.json.error.code, 'INVALID_JSON');
  });
  await t(`${label}: 配列やnullの本文は 400 INVALID_JSON`, async () => {
    const h = mod.createHandler(mkDeps());
    eq((await call(h, null, { raw: '[1]' })).json.error.code, 'INVALID_JSON');
    eq((await call(h, null, { raw: 'null' })).json.error.code, 'INVALID_JSON');
  });
  await t(`${label}: 上限超えの本文（Content-Length あり）は 413 PAYLOAD_TOO_LARGE`, async () => {
    const r = await call(mod.createHandler(mkDeps()), { pad: 'x'.repeat(40 * 1024) });
    eq(r.status, 413); eq(r.json.error.code, 'PAYLOAD_TOO_LARGE');
  });
  await t(`${label}: 同一IPの連続送信は 429 RATE_LIMITED + Retry-After（上限内は通る）`, async () => {
    const h = mod.createHandler(mkDeps());
    let last;
    let blockedAt = -1;
    for (let i = 0; i < 60; i++) {
      last = await call(h, label === 'save-inquiry' ? { ...body, email: `u${i}@example.com` } : body, {}, '198.51.100.7');
      if (last.status === 429) { blockedAt = i; break; }
    }
    truthy(blockedAt > 0, '途中までは通る');
    eq(last.json.error.code, 'RATE_LIMITED'); truthy(Number(last.headers.get('retry-after')) >= 1, 'Retry-After');
    // 別IPは影響を受けない
    eq((await call(h, label === 'save-inquiry' ? { ...body, email: 'other@example.com' } : body, {}, '198.51.100.8')).status !== 429, true, '別IP');
  });
}

// ============ generate-comment ============
await t('generate-comment 正常: ok:true + actions3件・モデルは claude-haiku-5-5・思考オフ', async () => {
  const f = fakeClientDeps(async () => textMsg(THREE_ACTIONS));
  const r = await call(comment.createHandler(f.deps), COMMENT_BODY);
  eq(r.status, 200); eq(r.json.ok, true); eq(r.json.data.actions.length, 3);
  eq(f.calls[0].model, 'claude-haiku-5-5'); eq(f.calls[0].thinking, undefined, 'thinking は指定しない(adaptive)'); eq(f.calls[0].output_config.effort, 'low');
  truthy(f.calls[0].messages[0].content.includes('55点（導入期）'), 'prompt');
});
await t('generate-comment: 先頭が思考ブロックでも text ブロックから取り出せる', async () => {
  const f = fakeClientDeps(async () => ({ stop_reason: 'end_turn', content: [{ type: 'thinking', thinking: '' }, { type: 'text', text: THREE_ACTIONS }] }));
  eq((await call(comment.createHandler(f.deps), COMMENT_BODY)).json.ok, true);
});
await t('generate-comment: 箇条書き記号・番号を除去する', async () => {
  const f = fakeClientDeps(async () => textMsg('1. ' + THREE_ACTIONS.split('\n').join('\n・')));
  const r = await call(comment.createHandler(f.deps), COMMENT_BODY);
  truthy(!/^[\d・]/.test(r.json.data.actions[0]), r.json.data.actions[0]);
});
await t('generate-comment: 環境変数でモデル差し替え可・不正な値は無視', async () => {
  const f = fakeClientDeps(async () => textMsg(THREE_ACTIONS), { ANTHROPIC_API_KEY: 'k', ANTHROPIC_MODEL_COMMENT: 'claude-sonnet-5-5' });
  await call(comment.createHandler(f.deps), COMMENT_BODY);
  eq(f.calls[0].model, 'claude-sonnet-5-5');
  const g = fakeClientDeps(async () => textMsg(THREE_ACTIONS), { ANTHROPIC_API_KEY: 'k', ANTHROPIC_MODEL_COMMENT: 'gpt-4; drop' });
  await call(comment.createHandler(g.deps), COMMENT_BODY);
  eq(g.calls[0].model, 'claude-haiku-5-5');
});
for (const [label, body] of [
  ['score が範囲外(101)', { ...COMMENT_BODY, score: 101 }],
  ['score が文字列', { ...COMMENT_BODY, score: '55' }],
  ['score なし', { stage: '導入期' }],
  ['stage が想定外', { ...COMMENT_BODY, stage: '不明期' }],
  ['strengths が配列でない', { ...COMMENT_BODY, strengths: 'abc' }],
  ['strengths が21件', { ...COMMENT_BODY, strengths: Array(21).fill('a') }],
  ['issues の1件が201文字', { ...COMMENT_BODY, issues: ['あ'.repeat(201)] }],
]) {
  await t(`generate-comment 入力不正(${label}): 400 VALIDATION_FAILED・API は呼ばない`, async () => {
    const f = fakeClientDeps(async () => textMsg(THREE_ACTIONS));
    const r = await call(comment.createHandler(f.deps), body);
    eq(r.status, 400); eq(r.json.error.code, 'VALIDATION_FAILED'); eq(f.calls.length, 0, 'API呼び出し数');
    truthy(r.json.error.detail.includes('field='), 'detail に項目名');
  });
}
await t('generate-comment: API キー未設定は 500 CONFIG_MISSING_ANTHROPIC_KEY', async () => {
  const r = await call(comment.createHandler({ env: {}, createClient: () => null }), COMMENT_BODY);
  eq(r.status, 500); eq(r.json.error.code, 'CONFIG_MISSING_ANTHROPIC_KEY');
});

const API_CASES = [
  [401, 'authentication_error', 'x', 500, 'ANTHROPIC_AUTH'],
  [403, 'permission_error', 'x', 500, 'ANTHROPIC_PERMISSION'],
  [404, 'not_found_error', 'model: x', 500, 'ANTHROPIC_MODEL_NOT_FOUND'],
  [400, 'invalid_request_error', 'Your credit balance is too low', 500, 'ANTHROPIC_BILLING'],
  [400, 'invalid_request_error', 'bad param', 500, 'ANTHROPIC_BAD_REQUEST'],
  [413, 'request_too_large', 'x', 413, 'ANTHROPIC_TOO_LARGE'],
  [429, 'rate_limit_error', 'x', 503, 'UPSTREAM_RATE_LIMITED'],
  [529, 'overloaded_error', 'x', 503, 'UPSTREAM_OVERLOADED'],
  [500, 'api_error', 'x', 502, 'UPSTREAM_ERROR'],
];
for (const [mod, label, body] of [[comment, 'generate-comment', COMMENT_BODY], [library, 'generate-library', LIB_BODY]]) {
  for (const [status, type, msg, httpStatus, code] of API_CASES) {
    await t(`${label} APIエラー ${status}(${type}) → ${code}`, async () => {
      const f = fakeClientDeps(async () => { throw apiError(status, type, msg); });
      const r = await call(mod.createHandler(f.deps), body);
      eq(r.status, httpStatus); eq(r.json.ok, false); eq(r.json.error.code, code);
      truthy(r.json.error.detail.includes(`upstream_status=${status}`), 'detail に上流ステータス');
      truthy(r.json.error.detail.includes('request_id=req_test123'), 'detail に request_id');
      truthy(!r.text.includes(SECRET_KEY), 'キー非露出');
    });
  }
  await t(`${label}: タイムアウト → 504 UPSTREAM_TIMEOUT / 接続失敗 → 502 UPSTREAM_CONNECTION / 不明 → UPSTREAM_UNKNOWN`, async () => {
    const mk = (err) => fakeClientDeps(async () => { throw err; });
    eq((await call(mod.createHandler(mk(new Anthropic.APIConnectionTimeoutError({})).deps), body)).json.error.code, 'UPSTREAM_TIMEOUT');
    eq((await call(mod.createHandler(mk(new Anthropic.APIConnectionError({ cause: new Error('x') })).deps), body)).json.error.code, 'UPSTREAM_CONNECTION');
    eq((await call(mod.createHandler(mk(new TypeError('boom')).deps), body)).json.error.code, 'UPSTREAM_UNKNOWN');
  });
}
await t('API エラーコードは原因ごとに全て別の文言（丸めていない）', async () => {
  const seen = new Map();
  for (const [status, type, msg] of API_CASES) {
    const f = fakeClientDeps(async () => { throw apiError(status, type, msg); });
    const r = await call(comment.createHandler(f.deps), COMMENT_BODY);
    seen.set(r.json.error.code, r.json.error.message);
  }
  eq(seen.size, API_CASES.length, '種類数');
});
for (const [label, msg, code] of [
  ['refusal', { stop_reason: 'refusal', content: [] }, 'AI_REFUSED'],
  ['max_tokens', textMsg('a', { stop_reason: 'max_tokens' }), 'AI_TRUNCATED'],
  ['空の応答', { stop_reason: 'end_turn', content: [] }, 'AI_EMPTY'],
  ['3件未満', textMsg('十分に長い一文目のアクションです。'), 'AI_BAD_OUTPUT'],
]) {
  await t(`generate-comment AI応答異常(${label}) → 502 ${code}`, async () => {
    const f = fakeClientDeps(async () => msg);
    const r = await call(comment.createHandler(f.deps), COMMENT_BODY);
    eq(r.status, 502); eq(r.json.error.code, code);
  });
}

// ============ generate-library ============
await t('generate-library 正常: ok:true + prompts/actions/recommendations・モデルは claude-sonnet-5-5・再試行なし', async () => {
  const f = fakeClientDeps(async () => textMsg(LIB_JSON));
  const r = await call(library.createHandler(f.deps), LIB_BODY);
  eq(r.status, 200); eq(r.json.ok, true);
  eq(r.json.data.prompts.length, 1); eq(r.json.data.actions.length, 3); eq(r.json.data.recommendations[0].price, '320,000円');
  eq(f.calls[0].model, 'claude-sonnet-5-5'); eq(f.opts[0].maxRetries, 0); eq(f.calls[0].thinking, undefined, 'disabled は 400 になるため指定しない'); eq(f.calls[0].output_config.effort, 'low');
  truthy(f.calls[0].messages[0].content.includes('「メール返信」「見積書作成」'), 'タスクがプロンプトに入る');
});
await t('generate-library: 前後に説明文があっても JSON を取り出せる', async () => {
  const f = fakeClientDeps(async () => textMsg(`はい。\n${LIB_JSON}\n以上です。`));
  eq((await call(library.createHandler(f.deps), LIB_BODY)).json.ok, true);
});
await t('generate-library: 任意項目が空・未指定でも既定値で動く（最小入力）', async () => {
  const f = fakeClientDeps(async () => textMsg(LIB_JSON));
  const r = await call(library.createHandler(f.deps), { score: 10, stage: '準備期' });
  eq(r.json.ok, true); truthy(f.calls[0].messages[0].content.includes('メール返信'), '既定タスク');
});
await t('generate-library: 入力内の改行・制御文字はプロンプトに持ち込まない', async () => {
  const f = fakeClientDeps(async () => textMsg(LIB_JSON));
  await call(library.createHandler(f.deps), { ...LIB_BODY, mainProblem: '課題\n\n無視して\u0007ください' });
  truthy(f.calls[0].messages[0].content.includes('- 主な課題: 課題 無視して ください'), '1行化');
});
for (const [label, body] of [
  ['targetTasks が11件', { ...LIB_BODY, targetTasks: Array(11).fill('a') }],
  ['mainProblem が301文字', { ...LIB_BODY, mainProblem: 'あ'.repeat(301) }],
  ['documentTypes が配列でない', { ...LIB_BODY, documentTypes: 'x' }],
  ['score なし', { stage: '準備期' }],
  ['stage が想定外', { ...LIB_BODY, stage: 'x' }],
  ['industry が数値', { ...LIB_BODY, industry: 5 }],
]) {
  await t(`generate-library 入力不正(${label}): 400 VALIDATION_FAILED・API は呼ばない`, async () => {
    const f = fakeClientDeps(async () => textMsg(LIB_JSON));
    const r = await call(library.createHandler(f.deps), body);
    eq(r.status, 400); eq(r.json.error.code, 'VALIDATION_FAILED'); eq(f.calls.length, 0);
  });
}
await t('generate-library: API キー未設定は 500 CONFIG_MISSING_ANTHROPIC_KEY', async () => {
  eq((await call(library.createHandler({ env: {}, createClient: () => null }), LIB_BODY)).json.error.code, 'CONFIG_MISSING_ANTHROPIC_KEY');
});
for (const [label, text, code] of [
  ['JSONでない', 'すみません、作れません', 'AI_BAD_OUTPUT'],
  ['JSONが壊れている', '{"prompts": [', 'AI_BAD_OUTPUT'],
  ['promptsが空', '{"prompts": [], "actions": []}', 'AI_BAD_OUTPUT'],
]) {
  await t(`generate-library AI応答異常(${label}) → 502 ${code}`, async () => {
    const f = fakeClientDeps(async () => textMsg(text));
    const r = await call(library.createHandler(f.deps), LIB_BODY);
    eq(r.status, 502); eq(r.json.error.code, code);
  });
}
await t('generate-library: refusal / max_tokens は専用コード', async () => {
  const a = fakeClientDeps(async () => ({ stop_reason: 'refusal', content: [] }));
  eq((await call(library.createHandler(a.deps), LIB_BODY)).json.error.code, 'AI_REFUSED');
  const b = fakeClientDeps(async () => textMsg('{', { stop_reason: 'max_tokens' }));
  eq((await call(library.createHandler(b.deps), LIB_BODY)).json.error.code, 'AI_TRUNCATED');
});
await t('generate-library: 制限に達したら Claude API を呼ばない（費用が発生しない）', async () => {
  const f = fakeClientDeps(async () => textMsg(LIB_JSON));
  const h = library.createHandler(f.deps);
  let n = 0;
  for (let i = 0; i < 40; i++) { if ((await call(h, LIB_BODY, {}, '192.0.2.9')).status === 200) n += 1; }
  eq(f.calls.length, n, 'API呼び出し数 = 成功数'); truthy(n <= 20 && n > 0, `成功は上限20以内: ${n}`);
});
await t('generate-library: 全体上限(300/時)を超えると IP が違っても 429 RATE_LIMITED_GLOBAL', async () => {
  const f = fakeClientDeps(async () => textMsg(LIB_JSON));
  const h = library.createHandler(f.deps);
  let code = '';
  for (let i = 0; i < 320; i++) {
    const r = await call(h, LIB_BODY, {}, `10.0.${Math.floor(i / 250)}.${i % 250}`);
    if (r.status === 429) { code = r.json.error.code; break; }
  }
  eq(code, 'RATE_LIMITED_GLOBAL'); truthy(f.calls.length <= 300, 'API呼び出し300以内');
});
await t('normalizeOutput: 長すぎる文字列は切り詰め・件数は上限・不正要素は除去', () => {
  const n = library.normalizeOutput({
    prompts: Array(9).fill({ task: 't', title: 'x'.repeat(500), prompt: 'p'.repeat(9000) }).concat([{ prompt: '' }, null]),
    actions: Array(9).fill('a'), recommendations: [{ service: '' }, { service: 's', rank: 'x' }],
  });
  eq(n.prompts.length, 5); eq(n.prompts[0].prompt.length, 4000); eq(n.prompts[0].title.length, 100);
  eq(n.actions.length, 5); eq(n.recommendations.length, 1); eq(n.recommendations[0].rank, 1);
});

// ============ save-inquiry ============
await t('save-inquiry 正常: シート1行・メール2通（担当者通知＋自動返信）・ok:true', async () => {
  const f = inqDeps();
  const r = await call(inquiry.createHandler(f.deps), INQ_BODY);
  eq(r.status, 200); eq(r.json.ok, true); eq(r.json.data.saved, true); eq(r.json.data.failures.length, 0);
  eq(f.sheet.length, 1); eq(f.mails.length, 2);
  eq(f.mails[0].to, 'zatuneya@gmail.com'); eq(f.mails[1].to, 'test@example.com');
  truthy(f.mails[1].text.includes('https://site.test'), '署名URL');
});
await t('save-inquiry 正常: 診断なしの資料請求（score なし）も通る', async () => {
  const f = inqDeps();
  const r = await call(inquiry.createHandler(f.deps), { type: '資料請求（診断なし）', companyName: 'A', contactName: 'B', email: 'a@b.co' });
  eq(r.status, 200); eq(f.mails.length, 2);
});
for (const [label, patch] of [
  ['宛先が複数(カンマ)', { email: 'a@x.com, b@y.com' }],
  ['宛先に改行(ヘッダ注入)', { email: 'a@x.com\r\nBcc: z@z.com' }],
  ['@なし', { email: 'abc' }],
  ['ドットなしドメイン', { email: 'a@b' }],
  ['メールが255文字', { email: `${'a'.repeat(250)}@b.co` }],
  ['種別が想定外', { type: '何でも' }],
  ['会社名なし', { companyName: '' }],
  ['会社名が101文字', { companyName: 'あ'.repeat(101) }],
  ['担当者が数値', { contactName: 5 }],
  ['score が範囲外', { score: 1000 }],
  ['recommendations が6件', { recommendations: Array(6).fill({ service: 's', price: 'p' }) }],
  ['strengths が文字列', { strengths: 'x' }],
]) {
  await t(`save-inquiry 入力不正(${label}): 400 VALIDATION_FAILED・シートもメールも触らない`, async () => {
    const f = inqDeps();
    const r = await call(inquiry.createHandler(f.deps), { ...INQ_BODY, ...patch });
    eq(r.status, 400); eq(r.json.error.code, 'VALIDATION_FAILED'); eq(f.sheet.length + f.mails.length, 0);
  });
}
await t('save-inquiry: 会社名の改行はメール件名・シートに持ち込まない', async () => {
  const f = inqDeps();
  await call(inquiry.createHandler(f.deps), { ...INQ_BODY, companyName: '株式会社\r\nBcc: x@y.z' });
  truthy(!/[\r\n]/.test(f.mails[0].subject), '件名に改行なし'); truthy(!/[\r\n]/.test(f.sheet[0].companyName), 'シート');
});
await t('save-inquiry: ハニーポットが埋まっていれば成功を装い何も処理しない', async () => {
  const f = inqDeps();
  const r = await call(inquiry.createHandler(f.deps), { ...INQ_BODY, website: 'http://spam.example' });
  eq(r.status, 200); eq(r.json.data.saved, false); eq(f.sheet.length + f.mails.length, 0);
});
await t('save-inquiry: 同じメールアドレス宛ては1時間に3回まで（4回目は 429）', async () => {
  const f = inqDeps();
  const h = inquiry.createHandler(f.deps);
  const codes = [];
  for (let i = 0; i < 4; i++) codes.push((await call(h, INQ_BODY, {}, `203.0.113.${10 + i}`)).status);
  eq(codes.join(','), '200,200,200,429');
  eq(f.mails.length, 6, '4回目はメールを送らない');
});
await t('save-inquiry: 全体上限(200/時)を超えると 429 RATE_LIMITED_GLOBAL', async () => {
  const f = inqDeps();
  const h = inquiry.createHandler(f.deps);
  let code = '';
  for (let i = 0; i < 230; i++) {
    const r = await call(h, { ...INQ_BODY, email: `u${i}@example.com` }, {}, `10.1.${Math.floor(i / 250)}.${i % 250}`);
    if (r.status === 429) { code = r.json.error.code; break; }
  }
  eq(code, 'RATE_LIMITED_GLOBAL');
});
await t('save-inquiry: シートだけ失敗(403) → ok:true・failures に SHEET_FORBIDDEN・メールは送る', async () => {
  const f = inqDeps({ appendToSheet: async () => { const e = new Error('The caller does not have permission'); e.code = 403; throw e; } });
  const r = await call(inquiry.createHandler(f.deps), INQ_BODY);
  eq(r.status, 200); eq(r.json.data.failures[0].target, 'sheet'); eq(r.json.data.failures[0].code, 'SHEET_FORBIDDEN'); eq(f.mails.length, 2);
});
await t('save-inquiry: 自動返信だけ失敗(EENVELOPE) → USER_MAIL_BAD_ADDRESS・担当者通知は届く', async () => {
  let n = 0;
  const f = inqDeps({ sendMail: async (m) => { n += 1; if (m.to !== 'zatuneya@gmail.com') { const e = new Error('No recipients'); e.code = 'EENVELOPE'; throw e; } } });
  const r = await call(inquiry.createHandler(f.deps), INQ_BODY);
  eq(r.status, 200); eq(r.json.data.failures.length, 1); eq(r.json.data.failures[0].target, 'user_mail'); eq(r.json.data.failures[0].code, 'USER_MAIL_BAD_ADDRESS'); eq(n, 2);
});
await t('save-inquiry: シートも担当者通知も失敗 → 502 INQUIRY_NOT_RECORDED（原因コードを detail に残す）', async () => {
  const f = inqDeps({
    appendToSheet: async () => { const e = new Error('x'); e.code = 404; throw e; },
    sendMail: async () => { const e = new Error('Invalid login'); e.code = 'EAUTH'; throw e; },
  });
  const r = await call(inquiry.createHandler(f.deps), INQ_BODY);
  eq(r.status, 502); eq(r.json.error.code, 'INQUIRY_NOT_RECORDED');
  truthy(r.json.error.detail.includes('sheet:SHEET_NOT_FOUND') && r.json.error.detail.includes('owner_mail:MAIL_AUTH'), r.json.error.detail);
});
await t('save-inquiry: シート失敗でも担当者通知が届けば ok:true（問い合わせは失われない）', async () => {
  const f = inqDeps({ appendToSheet: async () => { throw new Error('boom'); } });
  eq((await call(inquiry.createHandler(f.deps), INQ_BODY)).status, 200);
});
await t('classifySheetError: 原因ごとに別コード', () => {
  const mk = (o) => Object.assign(new Error(o.message || 'x'), o);
  const code = (o) => inquiry.classifySheetError(mk(o)).code;
  eq(code({ code: 401 }), 'SHEET_AUTH');
  eq(code({ message: 'invalid_grant: Invalid JWT' }), 'SHEET_AUTH');
  eq(code({ code: 403, message: 'Google Sheets API has not been used in project' }), 'SHEET_API_DISABLED');
  eq(code({ code: 403, message: 'The caller does not have permission' }), 'SHEET_FORBIDDEN');
  eq(code({ code: 404 }), 'SHEET_NOT_FOUND');
  eq(code({ code: 400, message: 'Unable to parse range: 問い合わせ一覧!A:M' }), 'SHEET_TAB_NOT_FOUND');
  eq(code({ code: 400, message: 'Invalid values' }), 'SHEET_BAD_REQUEST');
  eq(code({ code: 429 }), 'SHEET_QUOTA');
  eq(code({ code: 503 }), 'SHEET_UPSTREAM');
  eq(code({ code: 'ENOTFOUND' }), 'SHEET_NETWORK');
  eq(code({ name: 'SheetConfigError' }), 'SHEET_CONFIG_MISSING');
  eq(code({ code: 'WEIRD' }), 'SHEET_UNKNOWN');
  truthy(inquiry.classifySheetError(mk({ code: 'WEIRD' })).detail.includes('code=WEIRD'), '未知の識別子も残す');
});
await t('classifyMailError: 原因ごとに別コード', () => {
  const mk = (o) => Object.assign(new Error(o.message || 'x'), o);
  const code = (o, tg = 'user_mail') => inquiry.classifyMailError(mk(o), tg).code;
  eq(code({ code: 'EAUTH' }), 'MAIL_AUTH');
  eq(code({ code: 'EENVELOPE' }, 'owner_mail'), 'OWNER_MAIL_BAD_ADDRESS');
  eq(code({ code: 'ETIMEDOUT' }), 'MAIL_NETWORK');
  eq(code({ responseCode: 550, message: 'Daily user sending quota exceeded' }), 'MAIL_QUOTA');
  eq(code({ responseCode: 421 }), 'MAIL_TEMPORARY');
  eq(code({ responseCode: 554 }), 'MAIL_REJECTED');
  eq(code({ name: 'MailConfigError' }), 'MAIL_CONFIG_MISSING');
  eq(code({ code: 'WEIRD' }), 'MAIL_UNKNOWN');
});
await t('実装(realAppendToSheet/realSendMail): 環境変数が無いとき設定エラーとして分類される（外部通信なし）', async () => {
  let e1; try { await inquiry.realAppendToSheet(INQ_BODY_FULL(), {}); } catch (e) { e1 = e; }
  eq(inquiry.classifySheetError(e1).code, 'SHEET_CONFIG_MISSING');
  let e2; try { await inquiry.realSendMail({ fromName: 'x', to: 'a@b.co', subject: 's', text: 't' }, {}); } catch (e) { e2 = e; }
  eq(inquiry.classifyMailError(e2, 'user_mail').code, 'MAIL_CONFIG_MISSING');
});
function INQ_BODY_FULL() { return { ...INQ_BODY, recommendations: [], strengths: [], issues: [] }; }

// ============ 依存パッケージの読み込み（更新後のバージョンで関数が使う API が存在するか）============
await t('googleapis 185: google.auth.GoogleAuth と google.sheets().spreadsheets.values.append が存在する', async () => {
  const mod = await import('googleapis');
  const google = mod.google ?? mod.default.google;
  const auth = new google.auth.GoogleAuth({ credentials: { client_email: 'a@b.iam.gserviceaccount.com', private_key: 'x' }, scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
  eq(typeof google.sheets({ version: 'v4', auth }).spreadsheets.values.append, 'function');
});
await t('nodemailer 10: createTransport(service:gmail) が作れ sendMail が存在する（送信はしない）', async () => {
  const mod = await import('nodemailer');
  const nm = mod.default ?? mod;
  const tr = nm.createTransport({ service: 'gmail', auth: { user: 'a', pass: 'b' } });
  eq(typeof tr.sendMail, 'function');
});
await t('関数ファイル: default エクスポートと config（path・method・rateLimit）が正しい', async () => {
  const want = { 'generate-comment': false, 'generate-library': true, 'save-inquiry': true };
  for (const [name, rl] of Object.entries(want)) {
    const m = await import(`../netlify/functions/${name}.mjs`);
    eq(typeof m.default, 'function', `${name} default`);
    eq(m.config.path, `/api/${name}`, `${name} path`); eq(m.config.method, 'POST', `${name} method`);
    eq(Boolean(m.config.rateLimit), rl, `${name} rateLimit`);
    if (rl) { eq(m.config.rateLimit.aggregateBy.join(','), 'ip,domain'); truthy(m.config.rateLimit.windowLimit > 0, 'windowLimit'); }
  }
});

// ============ 模擬サーバー（127.0.0.1）で本物の SDK を通した通信層の確認 ============
async function withMock(handler, fn) {
  const seen = [];
  const server = http.createServer((rq, rs) => {
    let b = '';
    rq.on('data', (c) => { b += c; });
    rq.on('end', () => { seen.push({ headers: rq.headers, body: b ? JSON.parse(b) : null }); handler(rq, rs, seen.length); });
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const port = server.address().port;
  const prev = process.env.ANTHROPIC_BASE_URL;
  process.env.ANTHROPIC_BASE_URL = `http://127.0.0.1:${port}`;
  try { await fn(seen, port); } finally {
    if (prev === undefined) delete process.env.ANTHROPIC_BASE_URL; else process.env.ANTHROPIC_BASE_URL = prev;
    server.closeAllConnections?.();
    await new Promise((r) => server.close(r));
  }
}
const jsonRes = (rs, status, obj, headers = {}) => { rs.writeHead(status, { 'content-type': 'application/json', ...headers }); rs.end(JSON.stringify(obj)); };
const okMessage = (text) => ({ id: 'msg_1', type: 'message', role: 'assistant', model: 'm', content: [{ type: 'text', text }], stop_reason: 'end_turn', stop_sequence: null, usage: { input_tokens: 1, output_tokens: 1 } });

await t('模擬サーバー: generate-comment が実際に /v1/messages へ送る内容（モデル・キー・effort。思考は既定のまま）', async () => {
  await withMock((rq, rs) => jsonRes(rs, 200, okMessage(THREE_ACTIONS)), async (seen) => {
    const h = comment.createHandler({ env: { ANTHROPIC_API_KEY: SECRET_KEY } });
    const r = await call(h, COMMENT_BODY);
    eq(r.json.ok, true); eq(seen[0].headers['x-api-key'], SECRET_KEY);
    eq(seen[0].body.model, 'claude-haiku-5-5'); eq(seen[0].body.thinking, undefined); eq(seen[0].body.output_config.effort, 'low');
    truthy(seen[0].body.max_tokens >= 1500, 'max_tokens は思考分の余裕を含む');
  });
});
await t('模擬サーバー: generate-library が実際に送る内容と、応答の取り出し', async () => {
  await withMock((rq, rs) => jsonRes(rs, 200, okMessage(LIB_JSON)), async (seen) => {
    const h = library.createHandler({ env: { ANTHROPIC_API_KEY: SECRET_KEY } });
    const r = await call(h, LIB_BODY);
    eq(r.json.ok, true); eq(seen[0].body.model, 'claude-sonnet-5-5'); eq(seen[0].body.thinking, undefined); eq(seen[0].body.output_config.effort, 'low'); truthy(seen[0].body.max_tokens >= 5000, 'max_tokens');
    eq(r.json.data.prompts[0].task, 'メール返信');
  });
});
for (const [status, type, code] of [[401, 'authentication_error', 'ANTHROPIC_AUTH'], [429, 'rate_limit_error', 'UPSTREAM_RATE_LIMITED'], [529, 'overloaded_error', 'UPSTREAM_OVERLOADED'], [500, 'api_error', 'UPSTREAM_ERROR'], [404, 'not_found_error', 'ANTHROPIC_MODEL_NOT_FOUND']]) {
  await t(`模擬サーバー: 本物の SDK が ${status} を受けたとき ${code} に分類（generate-library は再試行しない）`, async () => {
    await withMock((rq, rs) => jsonRes(rs, status, { type: 'error', error: { type, message: 'm' } }, { 'request-id': 'req_mock' }), async (seen) => {
      const r = await call(library.createHandler({ env: { ANTHROPIC_API_KEY: SECRET_KEY } }), LIB_BODY);
      eq(r.json.error.code, code); eq(seen.length, 1, 'リクエスト回数（再試行なし）');
      truthy(r.json.error.detail.includes('request_id=req_mock'), 'request_id');
    });
  });
}
await t('模擬サーバー: generate-comment は 529 を1回だけ再試行する（計2回）', async () => {
  await withMock((rq, rs, n) => (n === 1 ? jsonRes(rs, 529, { type: 'error', error: { type: 'overloaded_error', message: 'm' } }, { 'retry-after-ms': '10' }) : jsonRes(rs, 200, okMessage(THREE_ACTIONS))), async (seen) => {
    const r = await call(comment.createHandler({ env: { ANTHROPIC_API_KEY: SECRET_KEY } }), COMMENT_BODY);
    eq(r.json.ok, true); eq(seen.length, 2);
  });
});
await t('模擬サーバー: 応答が来ない場合は UPSTREAM_TIMEOUT（タイムアウトは環境変数で変更可）', async () => {
  await withMock(() => { /* 応答しない */ }, async () => {
    const r = await call(library.createHandler({ env: { ANTHROPIC_API_KEY: SECRET_KEY, ANTHROPIC_TIMEOUT_MS: '300' } }), LIB_BODY);
    eq(r.status, 504); eq(r.json.error.code, 'UPSTREAM_TIMEOUT');
  });
});
await t('模擬サーバー: 接続できない場合は UPSTREAM_CONNECTION', async () => {
  const prev = process.env.ANTHROPIC_BASE_URL;
  process.env.ANTHROPIC_BASE_URL = 'http://127.0.0.1:1';
  try {
    const r = await call(library.createHandler({ env: { ANTHROPIC_API_KEY: SECRET_KEY } }), LIB_BODY);
    eq(r.status, 502); eq(r.json.error.code, 'UPSTREAM_CONNECTION');
  } finally { if (prev === undefined) delete process.env.ANTHROPIC_BASE_URL; else process.env.ANTHROPIC_BASE_URL = prev; }
});

// ============ 画面側（utils.js / request.js）：送信失敗を握りつぶさない ============
const APP_DIR = new URL('..', import.meta.url);
const readApp = (name) => fs.readFileSync(new URL(name, APP_DIR), 'utf8');

class FakeEl {
  constructor(doc, id = '') {
    this.doc = doc; this.id = id; this.children = []; this.listeners = {}; this._text = ''; this.value = '';
    this.disabled = false; this.className = ''; this.type = '';
    const cls = new Set();
    this.classList = {
      add: (c) => { cls.add(c); if (c === 'active' && doc) doc.activated.push(this.id); },
      remove: (c) => cls.delete(c),
      toggle: (c, on) => { if (on === undefined ? !cls.has(c) : on) cls.add(c); else cls.delete(c); },
      contains: (c) => cls.has(c),
    };
  }
  set textContent(v) { this._text = String(v); if (v === '') this.children = []; }
  get textContent() { return this._text; }
  set innerHTML(_) { throw new Error('innerHTML は使わない（textContent で組み立てる）'); }
  appendChild(c) { this.children.push(c); return c; }
  addEventListener(ev, fn) { (this.listeners[ev] ||= []).push(fn); }
  click() { return Promise.all((this.listeners.click || []).map((fn) => fn())); }
  scrollIntoView() {}
  allText() { return [this._text, ...this.children.map((c) => c.allText())].join('\n'); }
}
function makeApp(baseUrl, fetchImpl) {
  const els = new Map();
  const doc = {
    activated: [],
    getElementById(id) { if (!els.has(id)) els.set(id, new FakeEl(doc, id)); return els.get(id); },
    createElement() { return new FakeEl(doc); },
    querySelectorAll() { return []; },
  };
  const ctx = vm.createContext({
    document: doc, window: { scrollTo() {} }, sessionStorage: { setItem() {} }, location: { href: '' },
    fetch: fetchImpl || ((u, o) => fetch(baseUrl + u, o)),
    AbortController, setTimeout, clearTimeout, Date, JSON, Error,
  });
  vm.runInContext(readApp('utils.js'), ctx);
  return { ctx, doc, els };
}
async function withApiMock(handler, fn) {
  const server = http.createServer((rq, rs) => { rq.resume(); rq.on('end', () => handler(rq, rs)); });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  try { await fn(`http://127.0.0.1:${server.address().port}`); } finally {
    server.closeAllConnections?.();
    await new Promise((r) => server.close(r));
  }
}
const apiJson = (status, obj) => (rq, rs) => { rs.writeHead(status, { 'content-type': 'application/json' }); rs.end(JSON.stringify(obj)); };
const apiHtml = (status) => (rq, rs) => { rs.writeHead(status, { 'content-type': 'text/html' }); rs.end('<html>Not Found</html>'); };

await t('画面 postInquiry: 成功（ok:true）は ok を返す', async () => {
  await withApiMock(apiJson(200, { ok: true, data: { saved: true, failures: [] } }), async (base) => {
    const { ctx } = makeApp(base);
    const r = await ctx.postInquiry({ a: 1 });
    eq(r.ok, true); eq(r.data.saved, true);
  });
});
for (const [label, handler, code, detailPart] of [
  ['429 RATE_LIMITED', apiJson(429, { ok: false, error: { code: 'RATE_LIMITED', message: 'm', detail: 'retry_after=5s' } }), 'RATE_LIMITED', 'retry_after'],
  ['400 VALIDATION_FAILED', apiJson(400, { ok: false, error: { code: 'VALIDATION_FAILED', message: 'm', detail: 'field=email reason=invalid_email' } }), 'VALIDATION_FAILED', 'field=email'],
  ['502 INQUIRY_NOT_RECORDED', apiJson(502, { ok: false, error: { code: 'INQUIRY_NOT_RECORDED', message: 'm', detail: 'sheet:SHEET_AUTH' } }), 'INQUIRY_NOT_RECORDED', 'SHEET_AUTH'],
  ['GitHub Pages 相当の 404（HTML）', apiHtml(404), 'CLIENT_BAD_RESPONSE', 'http=404'],
  ['静的ホストの 405（HTML）', apiHtml(405), 'CLIENT_BAD_RESPONSE', 'http=405'],
]) {
  await t(`画面 postInquiry: ${label} → ${code}（識別子を残す）`, async () => {
    await withApiMock(handler, async (base) => {
      const r = await makeApp(base).ctx.postInquiry({});
      eq(r.ok, false); eq(r.error.code, code); truthy(r.error.detail.includes(detailPart), r.error.detail);
    });
  });
}
await t('画面 postInquiry: 接続できない → CLIENT_NETWORK / 中断 → CLIENT_TIMEOUT', async () => {
  const a = await makeApp('http://127.0.0.1:1').ctx.postInquiry({});
  eq(a.error.code, 'CLIENT_NETWORK');
  const b = await makeApp('', async () => { const e = new Error('x'); e.name = 'AbortError'; throw e; }).ctx.postInquiry({});
  eq(b.error.code, 'CLIENT_TIMEOUT');
});
await t('画面 describeInquiryError: 原因ごとに文言が違い、再送で直らないものに再送を促さない', () => {
  const { ctx } = makeApp('');
  const codes = ['CLIENT_NETWORK', 'CLIENT_TIMEOUT', 'CLIENT_BAD_RESPONSE', 'RATE_LIMITED', 'VALIDATION_FAILED', 'INQUIRY_NOT_RECORDED', 'PAYLOAD_TOO_LARGE', 'SOMETHING_NEW'];
  const seen = new Set();
  for (const c of codes) { const d = ctx.describeInquiryError({ code: c }); seen.add(d.title + d.action); truthy(d.title && d.action, c); }
  eq(seen.size, codes.length, '文言の種類数');
  const bad = ctx.describeInquiryError({ code: 'CLIENT_BAD_RESPONSE' });
  truthy(bad.action.includes('info@zatuneya.com') && !bad.action.includes('もう一度送信'), '再送を促さずメール案内');
  truthy(ctx.describeInquiryError({ code: 'RATE_LIMITED' }).action.includes('待って'), '時間をおく案内');
  truthy(ctx.describeInquiryError({ code: 'SOMETHING_NEW' }).action.includes('info@zatuneya.com'), '未知コードでもメール案内');
});
await t('画面 showInquiryError: 識別子と時刻を表示・textContent で組み立てる（HTML 注入なし）・再送ボタン動作', () => {
  const { ctx } = makeApp('');
  const box = new FakeEl(null, 'box');
  box.classList.add('hidden');
  let retried = 0;
  ctx.showInquiryError(box, { code: 'VALIDATION_FAILED', detail: 'field=<img onerror=x>' }, { note: '診断結果はご覧いただけます。', onRetry: () => { retried += 1; } });
  const text = box.allText();
  truthy(text.includes('エラーコード：VALIDATION_FAILED'), '識別子'); truthy(text.includes('field=<img onerror=x>'), 'detail はそのまま文字列として');
  truthy(text.includes('診断結果はご覧いただけます。'), 'note');
  eq(box.classList.contains('hidden'), false, '表示される');
  const retry = box.children.find((c) => c.className.includes('send-error__retry'));
  truthy(retry, '再送ボタン'); retry.listeners.click[0](); eq(retried, 1);
  ctx.hideInquiryError(box); eq(box.classList.contains('hidden'), true); eq(box.children.length, 0);
});

async function runRequestFlow(handler) {
  let result;
  await withApiMock(handler, async (base) => {
    const app = makeApp(base);
    vm.runInContext(readApp('request.js'), app.ctx);
    const { doc } = app;
    doc.getElementById('company-name').value = '株式会社テスト';
    doc.getElementById('contact-name').value = '大音';
    doc.getElementById('contact-email').value = 'test@example.com';
    doc.getElementById('hp-website').value = '';
    await doc.getElementById('btn-next').click();
    await doc.getElementById('btn-skip-diagnosis').click();
    result = { doc, btn: doc.getElementById('btn-skip-diagnosis'), box: doc.getElementById('send-error') };
  });
  return result;
}
await t('画面 request.js: 送信成功 → 完了画面を出す・エラー表示なし・ボタン復帰', async () => {
  const r = await runRequestFlow(apiJson(200, { ok: true, data: { saved: true, failures: [] } }));
  truthy(r.doc.activated.includes('screen-thanks'), '完了画面'); eq(r.box.classList.contains('hidden'), true); eq(r.btn.disabled, false);
});
for (const [label, handler, code] of [
  ['GitHub Pages 相当の 405', apiHtml(405), 'CLIENT_BAD_RESPONSE'],
  ['429', apiJson(429, { ok: false, error: { code: 'RATE_LIMITED', message: 'm' } }), 'RATE_LIMITED'],
  ['502 保存失敗', apiJson(502, { ok: false, error: { code: 'INQUIRY_NOT_RECORDED', message: 'm' } }), 'INQUIRY_NOT_RECORDED'],
]) {
  await t(`画面 request.js: 送信失敗(${label}) → 完了画面を出さず原因別の表示・再送できる`, async () => {
    const r = await runRequestFlow(handler);
    eq(r.doc.activated.includes('screen-thanks'), false, '完了画面は出さない');
    eq(r.box.classList.contains('hidden'), false, 'エラー表示'); truthy(r.box.allText().includes(`エラーコード：${code}`), '識別子');
    eq(r.btn.disabled, false, '再送できる');
  });
}

await t('GitHub Pages 退避: 全HTML(7)の先頭 script が Netlify 版の同じページへ移動する（ファイル名・クエリ・ハッシュを保持）', () => {
  const files = fs.readdirSync(APP_DIR).filter((n) => n.endsWith('.html'));
  eq(files.length, 7, 'HTML 数');
  for (const f of files) {
    const html = readApp(f);
    const m = html.match(/<script>([\s\S]*?)<\/script>/);
    truthy(m && html.indexOf(m[0]) < html.indexOf('</head>') && m[1].includes('github'), `${f}: head 内の最初の script`);
    const run = (hostname, pathname, search = '', hash = '') => {
      let to = null;
      const code = m[1].replace("location.replace('./diagnosis-simple.html');", '');
      vm.runInNewContext(code, { location: { hostname, pathname, search, hash, replace: (u) => { to = u; } } });
      return to;
    };
    if (f === 'index.html') {
      eq(run('zatune-gif.github.io', '/kurashi-no-dodai-log/00-01_han-ai/13_ai-diagnosis-tool/'), 'https://ai-shindan-zatuneya.netlify.app/', `${f} ディレクトリ`);
      continue;
    }
    eq(run('zatune-gif.github.io', `/kurashi-no-dodai-log/00-01_han-ai/13_ai-diagnosis-tool/${f}`, '?x=1', '#sec'), `https://ai-shindan-zatuneya.netlify.app/${f}?x=1#sec`, `${f} GitHub Pages`);
    eq(run('ai-shindan-zatuneya.netlify.app', `/${f}`), null, `${f} Netlify では移動しない`);
    eq(run('localhost', `/${f}`), null, `${f} localhost では移動しない`);
    eq(run('evilgithub.io', `/${f}`), null, `${f} 似たドメインでは移動しない`);
  }
});
await t('画面HTML: 送信失敗の表示欄が request.html / detail.html にある（role=alert・初期は非表示）', () => {
  for (const f of ['request.html', 'detail.html']) truthy(/<div id="send-error" class="send-error hidden[^"]*" role="alert"><\/div>/.test(readApp(f)), f);
});
await t('画面 escapeHtml: タグ・引用符・アンパサンドを無害化する', () => {
  const { ctx } = makeApp('');
  eq(ctx.escapeHtml('<img src=x onerror=alert(1)>"\'&'), '&lt;img src=x onerror=alert(1)&gt;&quot;&#39;&amp;');
  eq(ctx.escapeHtml(null), ''); eq(ctx.escapeHtml(0), '0');
});
await t('画面ソース: AI 出力・回答を innerHTML に入れる箇所はすべて escapeHtml を通す', () => {
  for (const f of ['detail.js', 'diagnosis-simple.js']) {
    const src = readApp(f);
    truthy(!/<li>\$\{[a-z]\}<\/li>/.test(src), `${f}: <li>\${変数} が残っている`);
    truthy(!/prompt-tag">\$\{p\.task\}/.test(src), `${f}: p.task`);
    truthy(!/>\$\{(text|opt\.text)\}</.test(src) && !/<\/span>\$\{text\}/.test(src), `${f}: 選択肢`);
  }
  truthy(!/function escapeHtml/.test(readApp('detail.js')) && /function escapeHtml/.test(readApp('utils.js')), '定義は utils.js の1か所');
});
await t('netlify.toml: 開発用ファイルを 404 にする redirect(force) と Node 24 が設定されている', () => {
  const toml = readApp('netlify.toml');
  eq(/NODE_VERSION = "24"/.test(toml), true, 'Node');
  for (const p of ['/netlify/*', '/test/*', '/node_modules/*', '/package.json', '/package-lock.json', '/README.md', '/netlify.toml']) {
    truthy(new RegExp(`from = "${p.replace(/[*.]/g, '\\$&')}"\\s+to = "/404.html"\\s+status = 404\\s+force = true`).test(toml), p);
  }
  for (const p of ['/api/', '/diagnosis-simple.html', '/style.css']) truthy(!toml.includes(`from = "${p}`), `${p} は塞いでいない`);
});

// ============ ログに秘密情報が出ていない ============
await t('診断ログ: API キー・メールのアプリパスワード・入力内容（会社名・メール）が出力されていない', () => {
  const all = captured.join('\n');
  truthy(captured.length > 0, 'ログが出ている（診断ログが機能している）');
  truthy(!all.includes(SECRET_KEY), 'APIキー'); truthy(!all.includes(SECRET_PASS), 'アプリパスワード');
  truthy(!all.includes('test@example.com') && !all.includes('株式会社テスト'), '入力内容');
  for (const line of captured) JSON.parse(line); // 全て1行JSON
});

console.error = origErr;
console.log(`\n${passed}/${total} PASS`);
if (failures.length) {
  console.log(`\nFAILED (${failures.length}):`);
  for (const f of failures) console.log(`  - ${f}`);
  process.exit(1);
}
