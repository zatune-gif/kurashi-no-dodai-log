const Anthropic = require('@anthropic-ai/sdk');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const {
      score, stage, industry, scale,
      customerType, documentTypes = [], staffSkill, mainProblem, companyFeature,
      targetTasks = [], aiTool, tone, scope,
      strengths = [], issues = []
    } = JSON.parse(event.body);

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const tasks = targetTasks.slice(0, 5);
    if (tasks.length === 0) tasks.push('メール返信', '報告書・提案書');

    const skillNote = staffSkill?.includes('低め')
      ? 'シンプルで短く、誰でも使いやすいプロンプトにする（複雑な指示は避ける）'
      : staffSkill?.includes('高い')
        ? '詳細な役割定義・制約条件を含む高品質なプロンプトにする'
        : '標準的な長さ・複雑さのプロンプトにする';

    const toneNote = {
      'フォーマル（取引先向け）': '丁寧な敬語・フォーマルな文体',
      'ビジネスカジュアル': '柔らかいビジネス語調',
      '社内向け（やわらかめ）': '社内向けのやわらかい語調'
    }[tone] || 'ビジネスカジュアル';

    const featureNote = companyFeature
      ? `「${companyFeature}」という自社の特徴を文脈に自然に織り込む`
      : `${industry}の業種特性を文脈に自然に織り込む`;

    const servicesCatalog = `
【ざつね屋のサービス一覧（税別・広島県府中市近郊）】
業務の見直し支援（業務改善）:
- 320,000円（2か月・16時間）
オプション（AI活用設計）: 個別にお見積り
個別実装:
- 個別にお見積り
オプション（運用保守）: 個別にお見積り`;

    const prompt = `あなたは地域企業の業務変革を支援するコンサルタントです。

企業情報:
- 業種: ${industry}
- 規模: ${scale}
- 取引相手: ${customerType}
- よく作る文書の形式: ${documentTypes.join('、') || '不明'}
- スタッフのITスキル: ${staffSkill}
- 主な課題: ${mainProblem}
${companyFeature ? `- 自社の特徴: ${companyFeature}` : ''}
- 使用するAIツール: ${aiTool}
- 文章トーン: ${tone}
- 活用範囲: ${scope}
- AI準備度スコア: ${score}点（${stage}）
- 活用したい業務数: ${tasks.length}件

活用したい業務「${tasks.join('」「')}」のそれぞれについて、すぐ使えるプロンプトテンプレートを1本ずつ作成してください。

プロンプト作成の条件:
- ${skillNote}
- ${aiTool}での使用を想定した書き方にする
- 文章トーン: ${toneNote}
- ${featureNote}
- プロンプトの冒頭に必ず役割定義（「あなたは〜です。」）を含める
- 入力欄は【　】で示す
- マークダウン記号（#、*、-など）は使わない
- 改行は自然に使用する

また、以下のサービス一覧から、この企業のスコア・規模・スキル・業務数を考慮して必ず1件推薦してください。
${servicesCatalog}

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

    const message = await client.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 3000,
      messages: [{ role: 'user', content: prompt }]
    });

    const text = message.content[0].text.trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');

    const data = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(data.recommendations)) data.recommendations = [];

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.error('generate-library error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to generate library' })
    };
  }
};
