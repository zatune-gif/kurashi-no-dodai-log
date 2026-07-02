'use strict';

const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const Anthropic = require('@anthropic-ai/sdk');

const CLIENT_BASE_DIR = 'C:\\Users\\ooto\\仕事\\中小企業向けAI活用支援事業\\クライアント';

let mainWindow;

// ─────────────────────────────────────
// ウィンドウ作成
// ─────────────────────────────────────
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 900,
    minWidth: 960,
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    title: 'ざつね屋 提案書生成ツール'
  });
  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// ─────────────────────────────────────
// IPC: JSONファイルを開く
// ─────────────────────────────────────
ipcMain.handle('open-json', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: '診断データJSONを選択',
    filters: [{ name: 'JSON', extensions: ['json'] }],
    properties: ['openFile']
  });
  if (result.canceled || !result.filePaths.length) return null;
  try {
    const content = fs.readFileSync(result.filePaths[0], 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
});

// ─────────────────────────────────────
// サービスカタログ（成果物のマスタ）
// 出典: consulting-operations/contract_om.md 第1条
//       consulting-operations/contract_banso.md 第1条
//       consulting-operations/service_brochure.md
//       docs/superpowers/specs/ メモリ（project_revenue_standard.md）
// ─────────────────────────────────────
function getServiceDeliverables(serviceName) {
  const n = serviceName || '';

  // ── AI業務改善オーダーメイドサービス（contract_om.md 第1条）──
  // 成果物は制作のみ・制作＋運用サポートどちらも同一の3点
  // 運用サポート（MTG×2回・軽微改修・メール対応）はサービス活動であり成果物ではない
  if (n.includes('AI業務改善オーダーメイド') || n.includes('オーダーメイドサービス')) {
    return [
      '業務専用AI指示書テンプレート（コピペで使える形式）',
      'スタッフ向け操作手順書（誰でも使える図解付き）',
      '業務仕様書（社内管理用記録）'
    ];
  }

  // ── AI開発伴走サービス（contract_banso.md 第1条）──
  // 物理的な納品物ではなくサービス内容を記載
  if (n.includes('AI開発伴走') || n.includes('MTGプラン') || n.includes('伴走サービス')) {
    return [
      '月次オンラインMTG（60〜90分）の実施',
      'AI活用状況の共有・業務課題のヒアリング',
      'AI活用方法の提案・共同検討',
      'MTGで合意した取り組み方針の記録・整理'
    ];
  }

  // ── セット価格（先に判定：個別コース名が含まれるため順序が重要）──
  if (n.includes('全コースセット')) {
    return [
      '自社AI活用マップ',
      '業務別プロンプトライブラリ10本',
      '画像生成プロンプト集',
      '当日作成したショート動画1本',
      'チームで共有できる自動化テンプレート集・演習成果ファイル'
    ];
  }
  if (n.includes('実践セット')) {
    return ['業務別プロンプトライブラリ10本', '画像生成プロンプト集', '当日作成したショート動画1本', '動画制作の再現手順書'];
  }
  if (n.includes('入門セット')) {
    return ['自社AI活用マップ', '業務別プロンプトライブラリ10本'];
  }

  // ── 研修：各コース（service_brochure.md / project_revenue_standard.md）──
  if (n.includes('AI活用知識編') || (n.includes('①') && !n.includes('セット'))) {
    return ['自社AI活用マップ'];
  }
  if ((n.includes('実践編') && n.includes('文書系')) || (n.includes('②') && !n.includes('セット'))) {
    return ['業務別プロンプトライブラリ10本'];
  }
  if ((n.includes('実践編') && n.includes('画像系')) || (n.includes('③') && !n.includes('セット'))) {
    return ['当日作成した画像素材', '画像生成プロンプト集'];
  }
  if ((n.includes('実践編') && n.includes('動画系')) || (n.includes('④') && !n.includes('セット'))) {
    return ['当日作成したショート動画1本', '動画制作の再現手順書'];
  }
  if (n.includes('Claude Code') && n.includes('個別')) {
    return ['当日作成した実行スクリプト・プロンプト（自分の業務に使えるもの）'];
  }
  if (n.includes('Claude Code') || (n.includes('⑤') && !n.includes('セット'))) {
    return ['チームで共有できる自動化テンプレート集', '各自の演習成果ファイル'];
  }

  // ── 対応不可（別途相談）──
  return null;
}

// ─────────────────────────────────────
// IPC: Claude APIで提案書を生成
// ─────────────────────────────────────
ipcMain.handle('generate-proposal', async (_, diagData) => {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const rec  = diagData.recommendations?.[0] || {};
  const strengths = (diagData.diagnosis?.strengths || []).map(s => `・${s}`).join('\n');
  const issues    = (diagData.diagnosis?.issues    || []).map(i => `・${i}`).join('\n');
  const tasks     = (diagData.diagnosis?.targetTasks || []).join('、');

  const deliverables = getServiceDeliverables(rec.service);
  const isUnknownService = deliverables === null;
  const deliverableLines = deliverables
    ? deliverables.map(d => `- ${d}`).join('\n')
    : '- 別途ご相談の上、確定いたします';

  const prompt = `あなたはざつね屋（広島近郊の中小企業向けAI活用支援専門家）のコンサルタントです。
クライアントの診断データをもとに提案書のドラフトを作成してください。

【クライアント情報】
会社名: ${diagData.client?.companyName || ''}
業種: ${diagData.diagnosis?.industry || ''}
規模: ${diagData.diagnosis?.scale || ''}
主な取引相手: ${diagData.diagnosis?.customerType || ''}
自社・業務の特徴: ${diagData.diagnosis?.companyFeature || '（記載なし）'}

【AI活用準備度診断結果】
スコア: ${diagData.diagnosis?.score || 0}点（${diagData.diagnosis?.stage || ''}）
現状: ${diagData.diagnosis?.currentState || ''}
ゴール: ${diagData.diagnosis?.goal || ''}

【強み（診断より）】
${strengths || '（なし）'}

【課題（診断より）】
${issues || '（なし）'}

【最も困っている場面】
${diagData.diagnosis?.mainProblem || ''}

【よく作る文書】
${(diagData.diagnosis?.documentTypes || []).join('、')}

【AIで活用したい業務】
${tasks || '（指定なし）'}

【推奨サービス（AI判定）】
${rec.service || ''}（${rec.price || ''}）
推薦理由: ${rec.reason || ''}

${isUnknownService
  ? '【注意】このサービスはカタログ外のため成果物を特定できません。セクション2の「含まれる成果物」は「別途ご相談の上、確定いたします」と出力してください。'
  : `【このサービスに含まれる成果物（変更禁止・そのまま出力すること）】\n${deliverableLines}`}

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
${deliverableLines}
---
「---」区切り線とセクション見出しをそのまま含めて出力してください。`;

  const message = await client.messages.create({
    model: 'claude-sonnet-5',
    max_tokens: 1500,
    messages: [{ role: 'user', content: prompt }]
  });

  return message.content[0].text;
});

// ─────────────────────────────────────
// IPC: PDF生成（3種類）
// ─────────────────────────────────────
ipcMain.handle('generate-pdfs', async (_, payload) => {
  const { clientData, diagData, estimateData, proposalData } = payload;

  const companyName = clientData.companyName || '未設定';
  const d = new Date();
  const dateStr = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
  const dateJp  = `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日`;

  const outputDir = path.join(CLIENT_BASE_DIR, companyName);
  fs.mkdirSync(outputDir, { recursive: true });

  const tasks = [
    {
      name: '診断結果',
      filename: `診断結果_${companyName}_${dateStr}.pdf`,
      html: buildDiagnosisHtml(clientData, diagData, dateJp)
    },
    {
      name: '見積書',
      filename: `見積書_${companyName}_${dateStr}.pdf`,
      html: buildEstimateHtml(clientData, estimateData, dateJp)
    },
    {
      name: '提案書',
      filename: `提案書_${companyName}_${dateStr}.pdf`,
      html: buildProposalHtml(clientData, diagData, proposalData, estimateData, dateJp)
    }
  ];

  const results = [];
  for (const task of tasks) {
    const outputPath = path.join(outputDir, task.filename);
    await generatePdf(task.html, outputPath);
    results.push({ name: task.name, path: outputPath });
  }

  shell.openPath(outputDir);
  return { ok: true, results, outputDir };
});

// ─────────────────────────────────────
// PDF生成（内部）
// ─────────────────────────────────────
async function generatePdf(htmlContent, outputPath) {
  const tmpPath = path.join(os.tmpdir(), `zatune_${Date.now()}.html`);
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

// ─────────────────────────────────────
// 共通ユーティリティ
// ─────────────────────────────────────
function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fmtNum(n) {
  return Number(n || 0).toLocaleString('ja-JP');
}

// ─────────────────────────────────────
// 診断結果PDFテンプレート
// ─────────────────────────────────────
function buildDiagnosisHtml(clientData, diagData, dateJp) {
  const d = diagData.diagnosis || {};
  const stages = ['準備期', '導入期', '活用期', '推進期'];
  const stageIdx = stages.indexOf(d.stage);

  const stageBar = stages.map((s, i) => {
    const cls = i === stageIdx ? 'active' : i < stageIdx ? 'done' : '';
    return `${i > 0 ? '<div class="s-line"></div>' : ''}<div class="s-step ${cls}"><div class="s-dot"></div><span>${s}</span></div>`;
  }).join('');

  const liHtml = arr => (arr || []).length
    ? (arr).map(x => `<li>${esc(x)}</li>`).join('')
    : '<li>（なし）</li>';

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

// ─────────────────────────────────────
// 見積書PDFテンプレート
// ─────────────────────────────────────
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
  ${estimateData.applyMonitor ? '<div class="tr" style="color:#DA7756;font-size:11px;padding-top:6px"><span>※ モニター価格適用（30%引き）</span></div>' : ''}
</div>
${estimateData.applySubsidy ? `
<div class="sub-box">
  <div class="sub-ttl">🎁 人材開発支援助成金 活用時（最大75%助成）</div>
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

// ─────────────────────────────────────
// 提案書PDFテンプレート
// ─────────────────────────────────────
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
.hd-sub{font-size:11px;color:#666}
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
<div class="hd">
  <div class="hd-title">AI活用支援 ご提案書</div>
</div>
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
<p class="note" style="margin-top:10px">※研修サービスをご利用の場合、人材開発支援助成金で最大75%の助成が受けられます（期限：2027年3月末）。</p>

<h3>標準スケジュール</h3>
<table class="pt">
  <thead><tr><th>期間</th><th>内容</th></tr></thead>
  <tbody>
    <tr><td>1週目</td><td>ヒアリング追加確認・スコープ確定・ご契約</td></tr>
    <tr><td>2〜3週目</td><td>プロンプト設計・手順書制作</td></tr>
    <tr><td>4週目</td><td>貴社レビュー → 修正 → 引き渡しMTG → 納品</td></tr>
    <tr><td>5〜8週目</td><td>運用サポート期間（オプション選択時）</td></tr>
  </tbody>
</table>

<h2>4. ざつね屋について</h2>
<div class="about-box">
  <ul>
    <li>広島近郊の中小企業・小規模事業者に特化したAI活用支援の専門家です</li>
    <li>「教えること（研修）」「作ること（制作）」「一緒に開発すること（伴走）」をワンストップで対応します</li>
    <li>AI活用の提案だけでなく、実装・手順書化まで一貫して対応できます</li>
    <li>担当者が変わっても困らない「仕組み」として残ることを重視した支援をします</li>
  </ul>
</div>

<h2>5. 次のステップ</h2>
<div class="next-box">
  <div class="step">1.　<strong>このまま進める</strong>　→　受注確認書をお送りします（1営業日以内）</div>
  <div class="step">2.　<strong>内容を調整したい</strong>　→　追加のご質問・変更点をお聞かせください</div>
  <div class="step">3.　<strong>他のプランも検討したい</strong>　→　別途お見積もりをご用意します</div>
</div>

<h2>ご連絡先</h2>
<p>ざつね屋<br>メール：heyho.zatune@gmail.com<br>ご返信は本メールへの返信でお気軽にどうぞ。</p>

<div class="footer">© 2026 ざつね屋</div>
</body></html>`;
}
