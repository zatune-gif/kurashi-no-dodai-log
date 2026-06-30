const Anthropic = require('@anthropic-ai/sdk');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { score, stage, strengths, issues } = JSON.parse(event.body);
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const strengthsText = strengths.length > 0 ? strengths.join('\n') : '特になし';
    const issuesText    = issues.length > 0    ? issues.join('\n')    : '特になし';

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      messages: [{
        role: 'user',
        content: `あなたは中小企業向けAI活用コンサルタントです。

診断スコア: ${score}点（${stage}）

強み:
${strengthsText}

課題:
${issuesText}

この会社が今すぐ実行できる具体的なアクションを3つ提案してください。
条件：1アクション1〜2文、マークダウン・番号・記号は不要、各アクションは改行で区切る。`
      }]
    });

    const actions = message.content[0].text
      .split('\n')
      .map(l => l.replace(/^[\s\-・•\d\.、]+/, '').trim())
      .filter(l => l.length > 10)
      .slice(0, 3);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actions })
    };
  } catch (error) {
    console.error('generate-comment error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to generate comment' })
    };
  }
};
