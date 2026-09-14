import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const output = path.resolve(process.env.QA_OUTPUT || 'qa-artifacts');
fs.mkdirSync(output, { recursive: true });
const browser = await chromium.launch({ headless: true });

for (const width of [375, 1280]) {
  const page = await browser.newPage({ viewport: { width, height: width === 375 ? 812 : 900 } });
  await page.route('**/.netlify/functions/generate-comment', (route) => route.fulfill({ status: 503, body: '{}' }));
  await page.goto('http://127.0.0.1:4173/diagnosis-simple.html', { waitUntil: 'domcontentloaded' });
  await page.click('#btn-start');
  await page.screenshot({ path: path.join(output, `diagnosis-v3-${width}-question.png`), fullPage: true });
  for (let index = 0; index < 12; index++) {
    await page.locator('.option-btn').first().click();
    await page.click('#btn-next');
  }
  await page.locator('#screen-results.active').waitFor();
  await page.screenshot({ path: path.join(output, `diagnosis-v3-${width}-result.png`), fullPage: true });
  await page.close();
}

await browser.close();
console.log(output);
