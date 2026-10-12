// 詳細診断：プロンプトライブラリ・推奨アクション・サービス推薦を Claude で生成する。
// 出力が長く費用がかさむ関数のため、連続呼び出しの制限を最も厳しくしている。
// 既定モデルは Claude Sonnet 5.5。環境変数 ANTHROPIC_MODEL_LIBRARY で差し替え可。
import { ok, fail, logEvent } from './http.mjs';
import {
  createRateLimiter, preflight, invalidInput, ValidationError,
  str, strArray, intInRange, oneOf, STAGES,
} from './guard.mjs';
import { createClient as realCreateClient, pickModel, configMissing, classifyApiError, extractText } from './claude.mjs';

export const DEFAULT_MODEL = 'claude-sonnet-5-5';
const FN = 'generate-library';
const MAX_BODY_BYTES = 32 * 1024;

const SERVICES_CATALOG = `
【ざつね屋のサービス一覧（税別・広島県府中市近郊）】
業務の見直し支援（業務改善）:
- 320,000円（2か月・16時間）
オプション（AI活用設計）: 個別にお見積り
個別実装:
- 個別にお見積り
オプション（運用保守）: 個別にお見積り`;

function validate(b) {
  return {
    score: intInRange(b.score, 'score', { min: 0, max: 100 }),
    stage: oneOf(b.stage, 'stage', STAGES),
    industry: str(b.industry, 'industry', { max: 100, def: '不明' }),
    scale: str(b.scale, 'scale', { max: 100, def: '不明' }),
    customerType: str(b.customerType, 'customerType', { max: 100, def: '不明' }),
    documentTypes: strArray(b.documentTypes, 'documentTypes', { maxItems: 10, maxLen: 60 }),
    staffSkill: str(b.staffSkill, 'staffSkill', { max: 100, def: '不明' }),
    mainProblem: str(b.mainProblem, 'mainProblem', { max: 300, def: '不明' }),
    companyFeature: str(b.companyFeature, 'companyFeature', { max: 300 }),
    targetTasks: strArray(b.targetTasks, 'targetTasks', { maxItems: 10, maxLen: 60 }),
    aiTool: str(b.aiTool, 'aiTool', { max: 100, def: 'まだ決まっていない' }),
    tone: str(b.tone, 'tone', { max: 100, def: 'ビジネスカジュアル' }),
    scope: str(b.scope, 'scope', { max: 100, def: 'チームで共有' }),
    // strengths / issues は送信されるが、プロンプトには使わない（形式のみ検証）
    strengths: strArray(b.strengths, 'strengths', { maxItems: 20, maxLen: 200 }),
    issues: strArray(b.issues, 'issues', { maxItems: 20, maxLen: 200 }),
  };
}

function buildPrompt(i) {
  const tasks = i.targetTasks.slice(0, 5);
  if (tasks.length === 0) tasks.push('メール返信', '報告書・提案書');

  const skillNote = i.staffSkill.includes('低め')
    ? 'シンプルで短く、誰でも使いやすいプロンプトにする（複雑な指示は避ける）'
    : i.staffSkill.includes('高い')
      ? '詳細な役割定義・制約条件を含む高品質なプロンプトにする'
      : '標準的な長さ・複雑さのプロンプトにする';

  const toneNote = {
    'フォーマル（取引先向け）': '丁寧な敬語・フォーマルな文体',
    'ビジネスカジュアル': '柔らかいビジネス語調',
    '社内向け（やわらかめ）': '社内向けのやわらかい語調',
  }[i.tone] || 'ビジネスカジュアル';

  const featureNote = i.companyFeature
    ? `「${i.companyFeature}」という自社の特徴を文脈に自然に織り込む`
    : `${i.industry}の業種特性を文脈に自然に織り込む`;

  return `あなたは地域企業の業務変革を支援するコンサルタントです。

企業情報:
- 業種: ${i.industry}
- 規模: ${i.scale}
- 取引相手: ${i.customerType}
- よく作る文書の形式: ${i.documentTypes.join('、') || '不明'}
- スタッフのITスキル: ${i.staffSkill}
- 主な課題: ${i.mainProblem}
${i.companyFeature ? `- 自社の特徴: ${i.companyFeature}` : ''}
- 使用するAIツール: ${i.aiTool}
- 文章トーン: ${i.tone}
- 活用範囲: ${i.scope}
- AI準備度スコア: ${i.score}点（${i.stage}）
- 活用したい業務数: ${tasks.length}件

活用したい業務「${tasks.join('」「')}」のそれぞれについて、すぐ使えるプロンプトテンプレートを1本ずつ作成してください。

プロンプト作成の条件:
- ${skillNote}
- ${i.aiTool}での使用を想定した書き方にする
- 文章トーン: ${toneNote}
- ${featureNote}
- プロンプトの冒頭に必ず役割定義（「あなたは〜です。」）を含める
- 入力欄は【　】で示す
- マークダウン記号（#、*、-など）は使わない
- 改行は自然に使用する

また、以下のサービス一覧から、この企業のスコア・規模・スキル・業務数を考慮して必ず1件推薦してください。
${SERVICES_CATALOG}

推薦ルール（必ず守ること）:
- rank 1（type: "standalone"）: 「業務の見直し支援（業務改善）」または「個別実装」のいずれか1つ
- 判断基準：課題や改善したい業務がまだ明確でない、またはAIが役立つか分からない状態（準備期〜活用期が目安）→ 業務の見直し支援（業務改善）を推薦
- 判断基準：改善すべき仕組みの仕様がすでに明確になっている状態（推進期が目安）→ 個別実装を推薦
- price は「業務の見直し支援（業務改善）」の場合は「320,000円」、「個別実装」の場合は「個別にお見積り」とすること
- オプション（AI活用設計・運用保守）は、本文中で自然に触れる場合のみreasonに含めてよい（recommendationsの件数は増やさない）

以下のJSON形式のみで回答してください（前後の説明文は不要）:
{
  "prompts": [
    {
      "task": "業務名",
      "title": "プロンプトのタイトル（20文字以内）",
      "prompt": "プロンプト本文（改行あり）"
    }
  ],
  "actions": [
    "この企業が今すぐ実行できる具体的なアクション（1〜2文）",
    "アクション2",
    "アクション3"
  ],
  "recommendations": [
    {
      "rank": 1,
      "type": "standalone",
      "service": "サービス名（「業務の見直し支援（業務改善）」または「個別実装」のいずれか、カタログの名称と一致させる）",
      "price": "価格文字列（320,000円 / 個別にお見積り）",
      "reason": "この企業にこのサービスを勧める具体的な理由（2文以内・です・ます調）"
    }
  ]
}`;
}

// AI の出力を検証して必要な形に整える。使えない場合は null。
export function normalizeOutput(data) {
  if (!data || typeof data !== 'object') return null;
  const s = (v, max) => (typeof v === 'string' ? v.slice(0, max) : '');
  const prompts = (Array.isArray(data.prompts) ? data.prompts : [])
    .map((p) => ({ task: s(p?.task, 100), title: s(p?.title, 100), prompt: s(p?.prompt, 4000) }))
    .filter((p) => p.prompt)
    .slice(0, 5);
  const actions = (Array.isArray(data.actions) ? data.actions : [])
    .map((a) => s(a, 400))
    .filter(Boolean)
    .slice(0, 5);
  const recommendations = (Array.isArray(data.recommendations) ? data.recommendations : [])
    .map((r) => ({
      rank: Number.isInteger(r?.rank) ? r.rank : 1,
      type: s(r?.type, 20) || 'standalone',
      service: s(r?.service, 100),
      price: s(r?.price, 100),
      reason: s(r?.reason, 600),
    }))
    .filter((r) => r.service)
    .slice(0, 3);
  if (prompts.length === 0) return null;
  return { prompts, actions, recommendations };
}

export function createHandler(deps = {}) {
  const env = deps.env || process.env;
  const createClient = deps.createClient || ((opts) => realCreateClient(opts, env));
  // 1回あたりの費用が大きいので制限は厳しめ。研修会場など同一回線から複数名が同時に使う場合を考慮した値。
  const limiter = createRateLimiter({ windowMs: 10 * 60 * 1000, max: 20 });
  const globalLimiter = createRateLimiter({ windowMs: 60 * 60 * 1000, max: 300 });

  return async function handler(req, context) {
    const pre = await preflight(req, context, { limiter, globalLimiter, maxBytes: MAX_BODY_BYTES });
    if (pre.response) return pre.response;

    let input;
    try {
      input = validate(pre.body);
    } catch (e) {
      if (e instanceof ValidationError) return invalidInput(e);
      throw e;
    }

    // 再試行は行わない（失敗時に費用と待ち時間が倍になるのを避ける。画面側は固定の提案文で代替する）
    const timeoutMs = Number(env.ANTHROPIC_TIMEOUT_MS) > 0 ? Number(env.ANTHROPIC_TIMEOUT_MS) : 55000;
    const client = createClient({ timeoutMs, maxRetries: 0 });
    if (!client) {
      logEvent(FN, 'config_missing', { code: 'CONFIG_MISSING_ANTHROPIC_KEY' });
      return configMissing();
    }

    const model = pickModel('ANTHROPIC_MODEL_LIBRARY', DEFAULT_MODEL, env);

    let message;
    try {
      message = await client.messages.create({
        model,
        // 思考は既定（adaptive）のまま effort を low にして短く済ませる（Claude Sonnet 5.5 の公式推奨。
        // disabled は 400 になる）。思考の分も max_tokens に数えられるため、出力（JSON 約3,000トークン）より余裕を持たせる。
        max_tokens: 6000,
        output_config: { effort: 'low' },
        messages: [{ role: 'user', content: buildPrompt(input) }],
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

    const jsonMatch = extracted.text.match(/\{[\s\S]*\}/);
    let parsed = null;
    if (jsonMatch) {
      try {
        parsed = JSON.parse(jsonMatch[0]);
      } catch {
        parsed = null;
      }
    }
    const data = normalizeOutput(parsed);
    if (!data) {
      logEvent(FN, 'bad_output', { code: 'AI_BAD_OUTPUT', model });
      return fail(502, 'AI_BAD_OUTPUT', 'AI の回答の形式が想定と異なりました。もう一度お試しください。');
    }
    return ok(data);
  };
}
