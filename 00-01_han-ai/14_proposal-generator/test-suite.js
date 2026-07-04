'use strict';

// Electronメインプロセスとして実行する統合テストスクリプト
// 起動: node start-test.js

const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Anthropic = require('@anthropic-ai/sdk');

const SAMPLE_JSON = path.join(__dirname, 'test', 'sample-diagnosis.json');
const TEST_OUT_DIR = path.join(os.tmpdir(), 'zatune-pdf-test');

let passed = 0;
let failed = 0;

function log(msg)  { console.log(`  ${msg}`); }
function ok(label) { console.log(`  ✅ ${label}`); passed++; }
function ng(label, err) { console.log(`  ❌ ${label}: ${err}`); failed++; }

// ─── ユーティリティ（main.js と同一） ───
function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
function fmtNum(n) { return Number(n || 0).toLocaleString('ja-JP'); }

// ─── テスト1: サンプルJSON読み込み ───
function testLoadJson() {
  console.log('\n[1] JSON読み込みテスト');
  try {
    const raw = fs.readFileSync(SAMPLE_JSON, 'utf-8');
    const data = JSON.parse(raw);
    if (!data.client?.companyName) throw new Error('client.companyName がない');
    if (!data.diagnosis?.score)    throw new Error('diagnosis.score がない');
    if (!Array.isArray(data.recommendations)) throw new Error('recommendations が配列でない');
    ok(`JSON解析OK（会社名: ${data.client.companyName}、スコア: ${data.diagnosis.score}点）`);
    return data;
  } catch (e) {
    ng('JSON読み込み', e.message);
    return null;
  }
}

// ─── テスト2: パス構築 ───
function testPathConstruction() {
  console.log('\n[2] パス構築テスト');
  const CLIENT_BASE_DIR = 'C:\\Users\\ooto\\仕事\\中小企業向けAI活用支援事業\\クライアント';
  const companyName = 'テスト建設株式会社';
  const outputDir = path.join(CLIENT_BASE_DIR, companyName);

  if (!path.isAbsolute(outputDir)) {
    ng('絶対パスチェック', `非絶対パス: ${outputDir}`);
    return null;
  }
  ok(`絶対パス OK: ${outputDir}`);
  return { CLIENT_BASE_DIR, outputDir };
}

// ─── テスト3: HTMLテンプレート生成 ───
function testHtmlTemplates(data) {
  console.log('\n[3] HTMLテンプレート生成テスト');

  const d = data.diagnosis || {};
  const clientData = data.client;

  // 診断結果HTML
  const diagHtml = buildDiagnosisHtml(clientData, data, '2026年6月23日');
  if (!diagHtml.includes(data.client.companyName)) {
    ng('診断結果HTML: 会社名が含まれていない', data.client.companyName);
  } else if (!diagHtml.includes(String(d.score))) {
    ng('診断結果HTML: スコアが含まれていない', String(d.score));
  } else if (!diagHtml.includes(d.stage)) {
    ng('診断結果HTML: ステージが含まれていない', d.stage);
  } else {
    ok(`診断結果HTML生成OK（${diagHtml.length.toLocaleString()}文字）`);
  }

  // 見積書HTML
  const estimateData = {
    estimateNumber: '2026-06-001',
    lineItems: [{ service: 'AI業務改善オーダーメイドサービス Mプラン', plan: '制作＋運用サポート', price: 110000 }],
    applyMonitor: false,
    applySubsidy: true
  };
  const estHtml = buildEstimateHtml(clientData, estimateData, '2026年6月23日');
  if (!estHtml.includes('110,000')) {
    ng('見積書HTML: 金額が含まれていない', '110,000');
  } else {
    ok(`見積書HTML生成OK（${estHtml.length.toLocaleString()}文字）`);
  }

  // 提案書HTML（セクションは仮テキスト）
  const proposalData = {
    section1: '貴社の現状と課題のダミーテキストです。',
    section2: 'ご提案するサービスのダミーテキストです。'
  };
  const propHtml = buildProposalHtml(clientData, data, proposalData, estimateData, '2026年6月23日');
  if (!propHtml.includes(clientData.companyName)) {
    ng('提案書HTML: 会社名が含まれていない', clientData.companyName);
  } else {
    ok(`提案書HTML生成OK（${propHtml.length.toLocaleString()}文字）`);
  }

  return { diagHtml, estimateData, proposalData };
}

// ─── テスト4: Claude API呼び出し ───
async function testClaudeApi(data) {
  console.log('\n[4] Claude API テスト');
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || !apiKey.startsWith('sk-ant')) {
    ng('APIキー確認', 'ANTHROPIC_API_KEY が .env にない、または形式が不正');
    return null;
  }
  ok(`APIキー確認OK（${apiKey.slice(0, 20)}...）`);

  try {
    const client = new Anthropic({ apiKey });

    const d = data.diagnosis || {};
    const rec = data.recommendations?.[0] || {};
    const strengths = (d.strengths || []).map(s => `・${s}`).join('\n');
    const issues    = (d.issues    || []).map(i => `・${i}`).join('\n');
    const tasks     = (d.targetTasks || []).join('、');

    const prompt = `あなたはざつね屋（広島県福山市近郊の中小企業向けAI活用支援専門家）のコンサルタントです。
クライアントの診断データをもとに提案書のドラフトを作成してください。

【クライアント情報】
会社名: ${data.client?.companyName || ''}
業種: ${d.industry || ''}
規模: ${d.scale || ''}
主な取引相手: ${d.customerType || ''}
自社・業務の特徴: ${d.companyFeature || '（記載なし）'}

【AI活用準備度診断結果】
スコア: ${d.score || 0}点（${d.stage || ''}）
現状: ${d.currentState || ''}
ゴール: ${d.goal || ''}

【強み（診断より）】
${strengths || '（なし）'}

【課題（診断より）】
${issues || '（なし）'}

【最も困っている場面】
${d.mainProblem || ''}

【よく作る文書】
${(d.documentTypes || []).join('、')}

【AIで活用したい業務】
${tasks || '（指定なし）'}

【推奨サービス（AI判定）】
${rec.service || ''}（${rec.price || ''}）
推薦理由: ${rec.reason || ''}

以下の2セクションを、会社名・業種・課題を盛り込み具体的に作成してください。
---
## 1. 貴社の現状と課題

**現状：**
（診断結果・業務詳細をもとに2〜3文。会社名・業種に言及）

**主な課題：**
- （課題①：具体的に）
- （課題②：具体的に）
- （課題③：具体的に）

**ゴールイメージ：**
（AIを活用した後の理想状態を1文で）

---
## 2. ご提案するサービス

### 推奨プラン：${rec.service || '（サービス名）'}

**このサービスをお勧めする理由：**
（推薦理由を2〜3文で。会社名・業種・課題に具体的に言及）

**含まれる成果物：**
- （成果物①）
- （成果物②）
- （成果物③）
---
「---」区切り線とセクション見出しをそのまま含めて出力してください。`;

    log('Claude API呼び出し中...');
    const message = await client.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }]
    });
    const textBlock = message.content.find(b => b.type === 'text');
    const text = textBlock?.text ?? '';
    if (!text || text.length < 100) throw new Error('レスポンスが短すぎる');

    // セクション分割確認
    const sec1Match = text.match(/##\s*1[^\n]*\n([\s\S]*?)(?=##\s*2|$)/);
    const sec2Match = text.match(/##\s*2[\s\S]*/);
    if (!sec1Match) throw new Error('セクション1（## 1）が見つからない');
    if (!sec2Match) throw new Error('セクション2（## 2）が見つからない');

    const section1 = sec1Match[1].trim();
    const section2 = sec2Match[0].replace(/^##\s*2[^\n]*\n/, '').trim();

    ok(`Claude API応答OK（${text.length}文字）`);
    ok(`セクション分割OK（1: ${section1.slice(0, 30)}... / 2: ${section2.slice(0, 30)}...）`);

    return { section1, section2 };
  } catch (e) {
    ng('Claude API', e.message);
    return null;
  }
}

// ─── テスト5: PDF生成 ───
async function testPdfGeneration(data, proposalResult) {
  console.log('\n[5] PDF生成テスト');
  fs.mkdirSync(TEST_OUT_DIR, { recursive: true });

  const dateJp = '2026年6月23日';
  const estimateData = {
    estimateNumber: '2026-06-001',
    lineItems: [{ service: 'AI業務改善オーダーメイドサービス Mプラン', plan: '制作＋運用サポート', price: 110000 }],
    applyMonitor: false,
    applySubsidy: true
  };
  const proposalData = proposalResult || {
    section1: '貴社の現状と課題のテストテキストです。',
    section2: 'ご提案するサービスのテストテキストです。'
  };

  const tasks = [
    { name: '診断結果', fn: () => buildDiagnosisHtml(data.client, data, dateJp) },
    { name: '見積書',   fn: () => buildEstimateHtml(data.client, estimateData, dateJp) },
    { name: '提案書',   fn: () => buildProposalHtml(data.client, data, proposalData, estimateData, dateJp) }
  ];

  for (const task of tasks) {
    const outPath = path.join(TEST_OUT_DIR, `テスト_${task.name}.pdf`);
    try {
      const html = task.fn();
      await generatePdf(html, outPath);
      const size = fs.statSync(outPath).size;
      ok(`${task.name}PDF生成OK（${(size / 1024).toFixed(1)} KB）→ ${outPath}`);
    } catch (e) {
      ng(`${task.name}PDF生成`, e.message);
    }
  }
}

// ─── PDF生成（main.js と同一ロジック） ───
async function generatePdf(htmlContent, outputPath) {
  const tmpPath = path.join(os.tmpdir(), `zatune_test_${Date.now()}.html`);
  fs.writeFileSync(tmpPath, htmlContent, 'utf-8');

  const win = new BrowserWindow({
    show: false,
    webPreferences: { nodeIntegration: false, contextIsolation: true }
  });

  await win.loadURL(`file:///${tmpPath.replace(/\\/g, '/')}`);
  await new Promise(r => setTimeout(r, 600));

  const pdfBuffer = await win.webContents.printToPDF({
    printBackground: true,
    pageSize: 'A4',
    margins: { top: 0.6, bottom: 0.6, left: 0.8, right: 0.8, marginType: 'custom' }
  });

  win.close();
  try { fs.unlinkSync(tmpPath); } catch {}
  fs.writeFileSync(outputPath, pdfBuffer);
}

// ─── HTMLテンプレート関数（main.js からコピー） ───
function buildDiagnosisHtml(clientData, diagData, dateJp) {
  const d = diagData.diagnosis || {};
  const stages = ['準備期', '導入期', '活用期', '推進期'];
  const stageIdx = stages.indexOf(d.stage);

  const stageBar = stages.map((s, i) => {
    const cls = i === stageIdx ? 'active' : i < stageIdx ? 'done' : '';
    return `${i > 0 ? '<div class="s-line"></div>' : ''}<div class="s-step ${cls}"><div class="s-dot"></div><span>${s}</span></div>`;
  }).join('');

  const liHtml = arr => (arr || []).length ? arr.map(x => `<li>${esc(x)}</li>`).join('') : '<li>（なし）</li>';
  const libraryHtml = (diagData.libraryPrompts || []).map(p => `
    <div class="p-card">
      <div class="p-tag">${esc(p.task)}</div>
      <div class="p-title">${esc(p.title)}</div>
      <pre class="p-body">${esc(p.prompt)}</pre>
    </div>`).join('');

  return `<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Hiragino Kaku Gothic ProN','Yu Gothic',Meiryo,sans-serif;font-size:12px;color:#1a1a1a;background:#fff;padding:28px;line-height:1.75}
.hd{border-bottom:3px solid #DA7756;padding-bottom:14px;margin-bottom:22px}
.hd-title{font-size:22px;font-weight:900;margin-bottom:4px}
.hd-sub{font-size:11px;color:#666}
.meta{display:grid;grid-template-columns:1fr 1fr;gap:6px;background:#f8f8f8;border:1px solid #e0e0e0;border-radius:6px;padding:10px;margin-bottom:20px}
.meta-r{font-size:12px}.meta-l{color:#888;margin-right:6px}
.score-blk{text-align:center;background:#1a1a1a;color:#fff;border-radius:8px;padding:18px;margin-bottom:20px}
.score-n{font-size:52px;font-weight:900;color:#DA7756;line-height:1}
.score-lbl{font-size:12px;margin-bottom:6px}
.s-badge{display:inline-block;background:#DA7756;color:#fff;font-size:13px;font-weight:700;padding:3px 14px;border-radius:20px;margin-bottom:10px}
.s-desc{font-size:11px;color:#ccc}
.s-bar{display:flex;align-items:center;margin-bottom:20px}
.s-step{display:flex;align-items:center;gap:3px;font-size:11px;white-space:nowrap}
.s-step.active{font-weight:700;color:#DA7756}.s-step.done{color:#999}
.s-dot{width:10px;height:10px;border-radius:50%;background:#ddd;flex-shrink:0}
.s-step.active .s-dot{background:#DA7756}.s-step.done .s-dot{background:#999}
.s-line{flex:1;height:1px;background:#ddd;margin:0 4px}
.sec{margin-bottom:18px}
.sec-ttl{font-size:13px;font-weight:900;color:#DA7756;border-left:4px solid #DA7756;padding-left:8px;margin-bottom:8px}
ul{padding-left:18px}ul li{margin-bottom:3px}
.goal-box{background:#fff8f5;border:2px solid #DA7756;border-radius:6px;padding:10px;font-size:12px;font-weight:600}
.p-card{border:1px solid #e0e0e0;border-radius:6px;padding:10px;margin-bottom:10px;page-break-inside:avoid}
.p-tag{display:inline-block;background:#DA7756;color:#fff;font-size:10px;font-weight:700;padding:2px 8px;border-radius:10px;margin-bottom:4px}
.p-title{font-size:12px;font-weight:700;margin-bottom:6px}
.p-body{font-size:11px;white-space:pre-wrap;background:#f8f8f8;border-radius:4px;padding:8px;line-height:1.6}
.footer{margin-top:28px;padding-top:10px;border-top:1px solid #e0e0e0;text-align:center;font-size:10px;color:#aaa}
</style></head><body>
<div class="hd">
  <div class="hd-title">AI活用準備度診断 結果レポート</div>
  <div class="hd-sub">発行日：${dateJp}　発行者：ざつね屋</div>
</div>
<div class="meta">
  <div class="meta-r"><span class="meta-l">会社名</span>${esc(clientData.companyName)}</div>
  <div class="meta-r"><span class="meta-l">担当者</span>${esc(clientData.contactName)}</div>
  <div class="meta-r"><span class="meta-l">業種</span>${esc(d.industry)}</div>
  <div class="meta-r"><span class="meta-l">規模</span>${esc(d.scale)}</div>
</div>
<div class="score-blk">
  <div class="score-lbl">AI活用準備度スコア</div>
  <div class="score-n">${d.score || 0}</div>
  <div style="color:#999;font-size:11px;margin:3px 0">/ 100点</div>
  <div class="s-badge">${esc(d.stage)}</div>
  <div class="s-desc">${esc(d.currentState)}</div>
</div>
<div class="s-bar">${stageBar}</div>
<div class="sec">
  <div class="sec-ttl">最終ゴール（全ステージ共通）</div>
  <div class="goal-box">AIと仕組みが回り、社員が本来の仕事に集中できる会社<br><small style="font-weight:400;color:#666">定型作業はAIが担い、人は判断・関係・創造に時間を使える状態</small></div>
</div>
<div class="sec">
  <div class="sec-ttl">ステージゴール（${esc(d.stage)}）</div>
  <p>${esc(d.goal)}</p>
</div>
<div class="sec"><div class="sec-ttl">強み</div><ul>${liHtml(d.strengths)}</ul></div>
<div class="sec"><div class="sec-ttl">優先課題</div><ul>${liHtml(d.issues)}</ul></div>
<div class="sec"><div class="sec-ttl">推奨アクション</div><ul>${liHtml(diagData.actions)}</ul></div>
${libraryHtml ? `<div class="sec"><div class="sec-ttl">業務別 おすすめプロンプト</div>${libraryHtml}</div>` : ''}
<div class="footer">© 2026 ざつね屋 | heyho.zatune@gmail.com</div>
</body></html>`;
}

function buildEstimateHtml(clientData, estimateData, dateJp) {
  const items    = estimateData.lineItems || [];
  const subtotal = items.reduce((s, x) => s + (Number(x.price) || 0), 0);
  const tax      = Math.round(subtotal * 0.1);
  const total    = subtotal + tax;
  const subsidyAmt   = Math.round(subtotal * 0.75);
  const clientBurden = subtotal - subsidyAmt;

  const rows = items.map(item => `
    <tr>
      <td>${esc(item.service)}</td>
      <td>${esc(item.plan)}</td>
      <td style="text-align:right;font-weight:700">${fmtNum(item.price)}円</td>
    </tr>`).join('');

  return `<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Hiragino Kaku Gothic ProN','Yu Gothic',Meiryo,sans-serif;font-size:12px;color:#1a1a1a;background:#fff;padding:32px;line-height:1.75}
.hd{border-bottom:3px solid #DA7756;padding-bottom:14px;margin-bottom:26px}
.hd-title{font-size:26px;font-weight:900}
.mt{width:100%;border-collapse:collapse;margin-bottom:26px}
.mt td{padding:6px 12px;border:1px solid #e0e0e0;font-size:12px}
.mt td:first-child{background:#f8f8f8;font-weight:700;width:120px}
.sec-ttl{font-size:13px;font-weight:900;color:#DA7756;border-left:4px solid #DA7756;padding-left:8px;margin:22px 0 10px}
.pt{width:100%;border-collapse:collapse;margin-bottom:14px}
.pt th{background:#1a1a1a;color:#fff;padding:9px 12px;text-align:left;font-size:11px}
.pt td{padding:9px 12px;border-bottom:1px solid #e0e0e0;font-size:12px}
.pt tr:last-child td{border-bottom:none}
.total-blk{background:#f8f8f8;border:1px solid #e0e0e0;border-radius:6px;padding:14px;margin-bottom:18px}
.tr{display:flex;justify-content:space-between;padding:3px 0;font-size:13px}
.tr.grand{font-size:16px;font-weight:900;color:#DA7756;border-top:2px solid #DA7756;padding-top:7px;margin-top:4px}
.sub-box{background:#f0f7f0;border:1px solid #4caf50;border-radius:6px;padding:12px;margin-bottom:18px}
.sub-ttl{font-weight:700;color:#2e7d32;margin-bottom:7px}
.sub-r{display:flex;justify-content:space-between;font-size:12px;padding:2px 0}
.note{font-size:11px;color:#666;line-height:1.65}
.pay-box{border:1px solid #e0e0e0;border-radius:6px;padding:12px;margin-bottom:18px}
.footer{margin-top:28px;padding-top:10px;border-top:1px solid #e0e0e0;text-align:center;font-size:10px;color:#aaa}
</style></head><body>
<div class="hd"><div class="hd-title">見積書</div></div>
<table class="mt">
  <tr><td>見積番号</td><td>${esc(estimateData.estimateNumber)}</td></tr>
  <tr><td>発行日</td><td>${dateJp}</td></tr>
  <tr><td>有効期限</td><td>発行日から30日間</td></tr>
  <tr><td>宛先</td><td>${esc(clientData.companyName)} 御中</td></tr>
  <tr><td>発行者</td><td>ざつね屋</td></tr>
  <tr><td>連絡先</td><td>heyho.zatune@gmail.com</td></tr>
</table>
<div class="sec-ttl">今回のご提案内訳</div>
<table class="pt">
  <thead><tr><th>サービス・コース</th><th>プラン</th><th style="text-align:right">金額（税別）</th></tr></thead>
  <tbody>${rows}</tbody>
</table>
<div class="total-blk">
  <div class="tr"><span>小計（税別）</span><span>${fmtNum(subtotal)}円</span></div>
  <div class="tr"><span>消費税（10%）</span><span>${fmtNum(tax)}円</span></div>
  <div class="tr grand"><span>合計（税込）</span><span>${fmtNum(total)}円</span></div>
</div>
${estimateData.applySubsidy ? `
<div class="sub-box">
  <div class="sub-ttl">人材開発支援助成金 活用時（最大75%助成）</div>
  <div class="sub-r"><span>助成額（75%）</span><span style="font-weight:700;color:#2e7d32">${fmtNum(subsidyAmt)}円</span></div>
  <div class="sub-r"><span>企業様のご負担（25%）</span><span style="font-weight:900;font-size:14px;color:#DA7756">${fmtNum(clientBurden)}円（税別）</span></div>
  <div class="note" style="margin-top:7px">※ 助成金の申請・採択は企業様の手続きによります。期限：2027年3月末</div>
</div>` : ''}
<div class="sec-ttl">お支払い条件</div>
<div class="pay-box">
  <div class="note">
    ・研修サービス：研修実施日の2週間前までに全額お振込みください<br>
    ・AI業務改善オーダーメイドサービス：契約締結後・制作開始前に全額お振込みください<br>
    ・AI開発伴走サービス：毎月末日までに翌月分をお振込みください<br>
    ・振込手数料：お客様のご負担となります
  </div>
</div>
<div class="footer">© 2026 ざつね屋 | heyho.zatune@gmail.com</div>
</body></html>`;
}

function buildProposalHtml(clientData, diagData, proposalData, estimateData, dateJp) {
  const vd = new Date();
  vd.setDate(vd.getDate() + 30);
  const validDateJp = `${vd.getFullYear()}年${vd.getMonth()+1}月${vd.getDate()}日`;

  const items    = estimateData.lineItems || [];
  const subtotal = items.reduce((s, x) => s + (Number(x.price) || 0), 0);
  const tax      = Math.round(subtotal * 0.1);
  const total    = subtotal + tax;

  const priceRows = items.map(item => `
    <tr><td>${esc(item.service)}</td><td>${esc(item.plan)}</td><td style="text-align:right">${fmtNum(item.price)}円</td></tr>`).join('');

  const section1 = esc(proposalData.section1 || '').replace(/\n/g, '<br>');
  const section2 = esc(proposalData.section2 || '').replace(/\n/g, '<br>');

  return `<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Hiragino Kaku Gothic ProN','Yu Gothic',Meiryo,sans-serif;font-size:12px;color:#1a1a1a;background:#fff;padding:32px;line-height:1.8}
.hd{text-align:center;border-bottom:3px solid #DA7756;padding-bottom:18px;margin-bottom:26px}
.hd-title{font-size:24px;font-weight:900;margin-bottom:4px}
.mt{width:100%;border-collapse:collapse;margin-bottom:26px}
.mt td{padding:6px 12px;border:1px solid #e0e0e0;font-size:12px}
.mt td:first-child{background:#f8f8f8;font-weight:700;width:100px}
h2{font-size:14px;font-weight:900;color:#DA7756;border-left:4px solid #DA7756;padding-left:8px;margin:24px 0 12px}
h3{font-size:13px;font-weight:700;margin:14px 0 7px}
.prose{line-height:1.85;margin-bottom:10px}
.pt{width:100%;border-collapse:collapse;margin:10px 0}
.pt th{background:#1a1a1a;color:#fff;padding:8px 12px;text-align:left;font-size:11px}
.pt td{padding:8px 12px;border-bottom:1px solid #e0e0e0;font-size:12px}
.pt tr:last-child td{border-bottom:none}
.tr{display:flex;justify-content:space-between;padding:3px 0}
.grand{font-size:14px;font-weight:900;color:#DA7756;border-top:2px solid #DA7756;padding-top:7px;margin-top:3px}
.about-box{background:#f8f8f8;border-radius:6px;padding:12px}
.about-box ul{padding-left:18px}
.about-box li{margin-bottom:3px}
.next-box{border:2px solid #DA7756;border-radius:6px;padding:12px}
.step{padding:5px 0;border-bottom:1px solid #eee}
.step:last-child{border-bottom:none}
.note{font-size:11px;color:#666}
.footer{margin-top:28px;padding-top:10px;border-top:1px solid #e0e0e0;text-align:center;font-size:10px;color:#aaa}
</style></head><body>
<div class="hd"><div class="hd-title">AI活用支援 ご提案書</div></div>
<table class="mt">
  <tr><td>宛先</td><td>${esc(clientData.companyName)}　${esc(clientData.contactName)} 様</td></tr>
  <tr><td>提案日</td><td>${dateJp}</td></tr>
  <tr><td>有効期限</td><td>${validDateJp}（提案日より30日間）</td></tr>
  <tr><td>提案者</td><td>ざつね屋</td></tr>
</table>
<h2>1. 貴社の現状と課題</h2>
<div class="prose">${section1}</div>
<h2>2. ご提案するサービス</h2>
<div class="prose">${section2}</div>
<h2>3. 費用・スケジュール</h2>
<table class="pt">
  <thead><tr><th>サービス</th><th>プラン</th><th style="text-align:right">金額（税別）</th></tr></thead>
  <tbody>${priceRows}</tbody>
</table>
<div class="tr"><span>小計（税別）</span><span>${fmtNum(subtotal)}円</span></div>
<div class="tr"><span>消費税（10%）</span><span>${fmtNum(tax)}円</span></div>
<div class="tr grand"><span>合計（税込）</span><span>${fmtNum(total)}円</span></div>
<h2>4. ざつね屋について</h2>
<div class="about-box"><ul>
  <li>広島県福山市近郊の中小企業・小規模事業者に特化したAI活用支援の専門家です</li>
  <li>「教えること」「作ること」「一緒に開発すること」をワンストップで対応します</li>
  <li>実装・手順書化まで一貫して対応できます</li>
</ul></div>
<h2>5. 次のステップ</h2>
<div class="next-box">
  <div class="step">1.　<strong>このまま進める</strong>　→　受注確認書をお送りします</div>
  <div class="step">2.　<strong>内容を調整したい</strong>　→　追加のご質問・変更点をお聞かせください</div>
  <div class="step">3.　<strong>他のプランも検討したい</strong>　→　別途お見積もりをご用意します</div>
</div>
<div class="footer">© 2026 ざつね屋</div>
</body></html>`;
}

// ─── メイン ───
app.whenReady().then(async () => {
  console.log('='.repeat(60));
  console.log('  ざつね屋 提案書生成ツール 統合テスト');
  console.log('='.repeat(60));

  const data = testLoadJson();
  testPathConstruction();
  const htmlResult = data ? testHtmlTemplates(data) : null;
  const proposalResult = data ? await testClaudeApi(data) : null;
  if (data) await testPdfGeneration(data, proposalResult);

  console.log('\n' + '='.repeat(60));
  console.log(`  結果: ✅ ${passed}件 OK  /  ❌ ${failed}件 NG`);
  if (failed === 0) {
    console.log('  全テスト通過！本番運用可能です。');
    console.log(`  テストPDF出力先: ${TEST_OUT_DIR}`);
  } else {
    console.log('  NG項目を修正してください。');
  }
  console.log('='.repeat(60));

  app.quit();
});
