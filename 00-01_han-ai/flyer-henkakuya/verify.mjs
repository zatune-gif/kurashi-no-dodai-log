// 検証: 実寸レンダリング（216x303mm相当）で表裏PNGを書き出し、機械チェックを行う
// - dist/preview-front.png / preview-back.png（目視用・350dpi相当）
// - 文言チェック: 金額（360,000円）不在 / 実績数値（%）不在 / 必須要素の存在
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const src = pathToFileURL(path.join(dir, 'flyer.html')).href;
const distDir = path.join(dir, 'dist');
fs.mkdirSync(distDir, { recursive: true });

const MM = 96 / 25.4;              // 1mm in CSS px
const SCALE = 350 / 96;           // 350dpi 相当
const W = Math.round(216 * MM);
const H = Math.round(303 * MM);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: SCALE });
await page.goto(src, { waitUntil: 'networkidle' });
await page.evaluate(async () => { await document.fonts.ready; });
await page.waitForTimeout(400);

for (const id of ['front', 'back']) {
  const el = await page.$('#' + id);
  await el.screenshot({ path: path.join(distDir, `preview-${id}.png`) });
}

const bodyText = await page.evaluate(() => document.body.innerText);
const html = await page.content();

const checks = [];
const must = (name, cond) => checks.push({ name, ok: !!cond });

// 金額を載せない（主力パッケージ）
must('金額「360,000円」が本文に無い', !/360[,，]?000\s*円/.test(bodyText));
must('金額「36万」表記が無い', !/36\s*万/.test(bodyText));
// 実績に根拠の無い数値を載せない
must('実績セクションに「%」入り数値が無い', !/\d+\s*[%％]/.test(bodyText));
must('「削減」「短縮」の数値実績表現が無い', !/(約?\d+\s*[%％]?\s*(削減|短縮))/.test(bodyText));
// 掲載しないもの
must('助成金・補助金の訴求が無い', !/助成金/.test(bodyText) && !/補助金の(活用|申請をお手伝い)/.test(bodyText));
must('農業・移住の話題が無い', !/(農業|移住)/.test(bodyText));
must('モニター割引が無い', !/モニター/.test(bodyText));
// 必須要素
must('肩書「地域企業の小さな業務変革屋」', /地域企業の小さな業務変革屋/.test(bodyText));
must('標語 H1「AIを入れることより、仕事がよくなることから。」', /AIを入れることより、\s*仕事がよくなることから。/.test(bodyText.replace(/\n/g, '')));
must('主力「AI経営改善パッケージ」', /AI経営改善パッケージ/.test(bodyText));
must('3サービス名（研修・個別業務設計・伴走）', /AI実務研修/.test(bodyText) && /個別業務設計/.test(bodyText) && /AI活用伴走/.test(bodyText));
must('研修①価格「5名 60,000円〜」', /5名\s*60[,，]?000\s*円/.test(bodyText));
must('氏名「大音 晃司（おおと こうじ）」', /大音\s*晃司/.test(bodyText) && /おおと こうじ/.test(bodyText));
must('連絡先 zatuneya@gmail.com', /zatuneya@gmail\.com/.test(bodyText));
must('著作権「© 2026 ざつね屋」', /©\s*2026\s*ざつね屋/.test(bodyText));
must('診断URLのQR画像を参照', /assets\/qr-shindan\.png/.test(html));
must('HP QR画像を参照', /assets\/qr-hp\.png/.test(html));
must('絵文字を使っていない', !/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(bodyText));

let pass = 0;
for (const c of checks) { console.log((c.ok ? '  PASS ' : '  FAIL ') + c.name); if (c.ok) pass++; }
console.log(`\n${pass}/${checks.length} PASS`);

// ページ寸法
const dims = await page.evaluate(() => {
  const r = (s) => { const e = document.querySelector(s); const b = e.getBoundingClientRect(); return { w: +(b.width / (96 / 25.4)).toFixed(1), h: +(b.height / (96 / 25.4)).toFixed(1) }; };
  return { front: r('#front'), back: r('#back'), scrollW: document.documentElement.scrollWidth };
});
console.log('\nページ実寸(mm):', JSON.stringify(dims));

const overflow = await page.evaluate(() => {
  const r = {};
  for (const id of ['front', 'back']) {
    const e = document.getElementById(id);
    r[id] = { over: e.scrollHeight - e.clientHeight };
  }
  return r;
});
console.log('版面はみ出し(px):', JSON.stringify(overflow),
  (overflow.front.over > 2 || overflow.back.over > 2) ? '  ← 要修正' : '  OK');

await browser.close();
process.exit(pass === checks.length ? 0 : 1);
