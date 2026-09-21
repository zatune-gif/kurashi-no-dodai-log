// flyer.html → 印刷入稿用PDF（A4両面・塗り足し3mm・216x303mm）
// 出力: dist/zatuneya-flyer-henkakuya_A4_bleed.pdf
import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const src = pathToFileURL(path.join(dir, 'flyer.html')).href;
const out = path.join(dir, 'dist', 'zatuneya-flyer-henkakuya_A4_bleed.pdf');

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(src, { waitUntil: 'networkidle' });
await page.evaluate(async () => { await document.fonts.ready; });
await page.waitForTimeout(400);

await page.pdf({
  path: out,
  width: '216mm',
  height: '303mm',
  printBackground: true,
  margin: { top: 0, right: 0, bottom: 0, left: 0 },
  preferCSSPageSize: false,
});

await browser.close();
console.log('PDF:', out);
console.log('※ RGBで出力されます。入稿先がRGB受付なら変換不要。CMYK/フォントアウトライン化が必須の場合は');
console.log('   Illustrator もしくは Ghostscript(gs -sDEVICE=pdfwrite -dNoOutputFonts ... + ICCプロファイル) で後処理してください。');
