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
AI経営改善パッケージ（主力）:
- 標準版（3か月・16時間）360,000円
AI実務研修:
- ①AI活用知識編（5名）60,000円
- ①AI活用知識編（10名）80,000円
- ②実践編・文書系（5名）要お問い合わせ
- ②実践編・文書系（10名）要お問い合わせ
- ③実践編・画像系（5名）要お問い合わせ
- ③実践編・画像系（10名）要お問い合わせ
- ④実践編・動画系（5名）要お問い合わせ
- ④実践編・動画系（10名）要お問い合わせ
- ⑤Claude Code・グループ（MAX3名）180,000円
AI活用伴走（月額）:
- 月2回・各60〜90分 100,000円/月
セット価格:
- 入門セット（①+②・5名）152,000円
- 入門セット（①+②・10名）209,000円
- 実践セット（②+③+④・5名）270,000円
- 実践セット（②+③+④・10名）378,000円
- 全コースセット（①②③④+⑤グループ・5名）400,000円
- 全コースセット（①②③④+⑤グループ・10名）560,000円`;

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

また、以下のサービス一覧から、この企業のスコア・規模・スキル・業務数を考慮して必ず2件推薦してください。
${servicesCatalog}

推薦ルール（必ず守ること）:
- rank 1（type: "standalone"）: 単独サービス（AI実務研修・AI経営改善パッケージ・AI活用伴走のいずれか1つ）
- rank 2（type: "set"）: セット価格（入門セット/実践セット/全コースセットのいずれか）
- 準備期（〜30点）: standalone=AI実務研修 ①AI活用知識編（5名）、set=入門セット（①+②・5名）
- 導入期（31〜60点）: standalone=AI実務研修 ②実践編・文書系（5名）、set=実践セット（②+③+④・5名）
- 活用期（61〜80点）: standalone=AI経営改善パッケージ（360,000円・3か月）、set=実践セット（②+③+④・10名）
- 推進期（81〜100点）: standalone=AI経営改善パッケージ（360,000円・3か月）、set=全コースセット（①②③④+⑤グループ・5名）
- スタッフスキル「低め」→ standalone は AI実務研修 ①AI活用知識編 を優先
- スタッフスキル「高い」→ standalone は ⑤Claude Code・グループ を優先
- 規模「51名以上」→ グループ・M系を優先
- ②〜④の研修コースは対外価格を非公開としているため、price は「要お問い合わせ」とすること

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
      "service": "単独サービス名（カタログの名称と一致させる）",
      "price": "価格文字列（例：60,000円 / 要お問い合わせ）",
      "reason": "この企業にこのサービスを勧める具体的な理由（2文以内・です・ます調）"
    },
    {
      "rank": 2,
      "type": "set",
      "service": "セット名（カタログの名称と一致させる）",
      "price": "価格文字列（例：135,000円）",
      "reason": "理由（2文以内）"
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
