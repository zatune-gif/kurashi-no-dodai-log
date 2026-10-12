// 簡易診断：推奨アクション3件を Claude で生成する。
// 軽い用途（短い文3つ）のため Claude Haiku 5.5 を使う。環境変数 ANTHROPIC_MODEL_COMMENT で差し替え可。
import { ok, fail, logEvent } from './http.mjs';
import {
  createRateLimiter, preflight, invalidInput, ValidationError,
  strArray, intInRange, oneOf, STAGES,
} from './guard.mjs';
import { createClient as realCreateClient, pickModel, configMissing, classifyApiError, extractText } from './claude.mjs';

export const DEFAULT_MODEL = 'claude-haiku-5-5';
const FN = 'generate-comment';
const MAX_BODY_BYTES = 16 * 1024;

export function createHandler(deps = {}) {
  const env = deps.env || process.env;
  const createClient = deps.createClient || ((opts) => realCreateClient(opts, env));
  const limiter = createRateLimiter({ windowMs: 10 * 60 * 1000, max: 40 });
  const globalLimiter = createRateLimiter({ windowMs: 60 * 60 * 1000, max: 1000 });

  return async function handler(req, context) {
    const pre = await preflight(req, context, { limiter, globalLimiter, maxBytes: MAX_BODY_BYTES });
    if (pre.response) return pre.response;

    let input;
    try {
      input = {
        score: intInRange(pre.body.score, 'score', { min: 0, max: 100 }),
        stage: oneOf(pre.body.stage, 'stage', STAGES),
        strengths: strArray(pre.body.strengths, 'strengths', { maxItems: 20, maxLen: 200 }),
        issues: strArray(pre.body.issues, 'issues', { maxItems: 20, maxLen: 200 }),
      };
    } catch (e) {
      if (e instanceof ValidationError) return invalidInput(e);
      throw e;
    }

    const client = createClient({ timeoutMs: 20000, maxRetries: 1 });
    if (!client) {
      logEvent(FN, 'config_missing', { code: 'CONFIG_MISSING_ANTHROPIC_KEY' });
      return configMissing();
    }

    const strengthsText = input.strengths.length > 0 ? input.strengths.join('\n') : '特になし';
    const issuesText = input.issues.length > 0 ? input.issues.join('\n') : '特になし';
    const model = pickModel('ANTHROPIC_MODEL_COMMENT', DEFAULT_MODEL, env);

    let message;
    try {
      message = await client.messages.create({
        model,
        max_tokens: 600,
        // 短い文を3つ作るだけなので、思考を切って低い effort で素早く返す
        thinking: { type: 'disabled' },
        output_config: { effort: 'low' },
        messages: [{
          role: 'user',
          content: `あなたは地域企業の業務変革を支援するコンサルタントです。

診断スコア: ${input.score}点（${input.stage}）

強み:
${strengthsText}

課題:
${issuesText}

この会社が今すぐ実行できる具体的なアクションを3つ提案してください。
条件：1アクション1〜2文、マークダウン・番号・記号は不要、各アクションは改行で区切る。`,
        }],
      });
    } catch (err) {
      const c = classifyApiError(err);
      logEvent(FN, 'upstream_error', { code: c.code, detail: c.detail, model });
      return fail(c.httpStatus, c.code, c.message, { detail: c.detail });
    }

    const extracted = extractText(message);
    if (extracted.errorCode) {
      logEvent(FN, 'bad_output', { code: extracted.errorCode, stop_reason: message?.stop_reason, model });
      return fail(502, extracted.errorCode, extracted.message);
    }

    const actions = extracted.text
      .split('\n')
      .map((l) => l.replace(/^[\s\-・•\d.、]+/, '').trim())
      .filter((l) => l.length > 10)
      .slice(0, 3);

    if (actions.length < 3) {
      logEvent(FN, 'bad_output', { code: 'AI_BAD_OUTPUT', actions: actions.length, model });
      return fail(502, 'AI_BAD_OUTPUT', 'AI の回答の形式が想定と異なりました。もう一度お試しください。');
    }
    return ok({ actions });
  };
}
