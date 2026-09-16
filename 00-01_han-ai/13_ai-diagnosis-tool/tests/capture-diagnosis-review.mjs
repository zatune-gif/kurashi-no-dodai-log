import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const output = path.resolve(process.argv[2] || process.env.QA_OUTPUT || 'qa-artifacts');
const port = Number(process.env.QA_PORT || 4173);
const baseUrl = `http://127.0.0.1:${port}`;
fs.mkdirSync(output, { recursive: true });
const server = spawn(process.execPath, ['tests/qa-server.mjs'], {
  cwd: new URL('../', import.meta.url),
  env: { ...process.env, QA_PORT: String(port) },
  stdio: ['ignore', 'pipe', 'pipe'],
});

await new Promise((resolve, reject) => {
  const timer = setTimeout(() => reject(new Error('QA server start timeout')), 5000);
  server.once('error', reject);
  server.stdout.on('data', (chunk) => {
    if (chunk.toString().includes('QA server:')) {
      clearTimeout(timer);
      resolve();
    }
  });
});

const browser = await chromium.launch({ headless: true });
try {
  for (const width of [375, 768, 1280]) {
    const page = await browser.newPage({ viewport: { width, height: width === 375 ? 812 : 900 } });
    await page.route('**/.netlify/functions/generate-comment', (route) => route.fulfill({ status: 503, body: '{}' }));
    await page.goto(`${baseUrl}/diagnosis-simple.html`, { waitUntil: 'domcontentloaded' });
    await page.click('#btn-start');
    await page.keyboard.press('Tab');
    await page.locator('.option-btn').first().focus();
    await page.screenshot({ path: path.join(output, `diagnosis-v3-${width}-question-focus.png`), fullPage: true });
    if (width === 375) {
      const box = await page.locator('.option-btn').first().boundingBox();
      await page.screenshot({
        path: path.join(output, 'diagnosis-v3-375-focus-detail.png'),
        clip: {
          x: Math.max(0, box.x - 8),
          y: Math.max(0, box.y - 8),
          width: Math.min(width, box.width + 16),
          height: box.height + 16,
        },
      });
    }
    for (let index = 0; index < 12; index++) {
      await page.locator('.option-btn').first().click();
      await page.click('#btn-next');
    }
    await page.locator('#screen-results.active').waitFor();
    await page.screenshot({ path: path.join(output, `diagnosis-v3-${width}-result.png`), fullPage: true });
    await page.close();
  }
} finally {
  await browser.close();
  server.kill('SIGTERM');
}

console.log(output);
