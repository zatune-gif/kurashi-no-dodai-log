import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import AxeBuilder from '@axe-core/playwright';
import { chromium, firefox, webkit } from 'playwright';

const port = 4174;
const baseUrl = `http://127.0.0.1:${port}`;
const focusMeasurements = [];
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

async function openPage(browser, width, pathname = 'diagnosis-simple.html') {
  const context = await browser.newContext({ viewport: { width, height: width === 375 ? 812 : 900 } });
  const page = await context.newPage();
  const closePage = page.close.bind(page);
  page.close = async () => {
    await closePage();
    await context.close();
  };
  await page.route('**/.netlify/functions/generate-comment', (route) => route.fulfill({ status: 503, body: '{}' }));
  await page.goto(`${baseUrl}/${pathname}`, { waitUntil: 'domcontentloaded' });
  return page;
}

async function assertNoOverflow(page, label) {
  const dimensions = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth }));
  assert.ok(dimensions.scrollWidth <= dimensions.width, `${label}: no horizontal overflow`);
}

function parseRgb(value) {
  const channels = value.match(/[\d.]+/g)?.slice(0, 3).map(Number);
  if (channels?.length !== 3) throw new Error(`Unable to parse RGB color: ${value}`);
  return channels;
}

function contrastRatio(foreground, background) {
  const luminance = (channels) => {
    const linear = channels.map((channel) => {
      const normalized = channel / 255;
      return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
  };
  const first = luminance(parseRgb(foreground));
  const second = luminance(parseRgb(background));
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

async function assertFocusContrast(locator, background, label) {
  await locator.page().keyboard.press('Tab');
  await locator.focus();
  const focus = await locator.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      matches: element.matches(':focus-visible'),
      color: style.outlineColor,
      style: style.outlineStyle,
      width: Number.parseFloat(style.outlineWidth),
    };
  });
  const ratio = contrastRatio(focus.color, background);
  const outline = focus.color;
  focusMeasurements.push({ label, ratio, outline, background });
  assert.ok(
    focus.matches && focus.style !== 'none' && focus.width >= 3 && ratio >= 3,
    `${label}: visible focus indicator is at least 3px and 3:1 (${focus.width}px ${outline} on ${background})`,
  );
}

async function finishDiagnosis(page, optionIndex) {
  for (let index = 0; index < 12; index++) {
    const selectedIndex = Array.isArray(optionIndex) ? optionIndex[index] : optionIndex;
    await page.locator('.option-btn').nth(selectedIndex).click();
    await page.click('#btn-next');
  }
  await page.locator('#screen-results.active').waitFor();
}

let checks = 0;
try {
  for (const browserType of [chromium, firefox, webkit]) {
    const browser = await browserType.launch({ headless: true });
    try {
      for (const width of [375, 768, 1280]) {
        const page = await openPage(browser, width);
        await assertNoOverflow(page, `${browserType.name()} ${width}`);
        checks++;
        const hamburgerVisible = await page.locator('.site-nav__hamburger').isVisible();
        assert.equal(hamburgerVisible, width < 900, `${browserType.name()} ${width}: responsive nav mode`);
        checks++;
        await page.close();
      }

      const page = await openPage(browser, 375);
      const hamburger = page.locator('.site-nav__hamburger');
      const hamburgerBox = await hamburger.boundingBox();
      assert.ok(hamburgerBox.width >= 44 && hamburgerBox.height >= 44, `${browserType.name()}: menu target is 44px`);
      await assertFocusContrast(hamburger, 'rgb(255, 255, 255)', `${browserType.name()}: header menu`);
      const outlineWidth = await hamburger.evaluate((element) => Number.parseFloat(getComputedStyle(element).outlineWidth));
      assert.ok(outlineWidth >= 3, `${browserType.name()}: menu keyboard focus is visible`);
      const headerLogo = page.locator('.site-logo');
      const headerLogoBox = await headerLogo.boundingBox();
      assert.ok(headerLogoBox.height >= 44, `${browserType.name()}: header logo target is at least 44px`);
      await assertFocusContrast(headerLogo, 'rgb(255, 255, 255)', `${browserType.name()}: header logo`);
      const footerLogo = page.locator('.site-footer__logo');
      const footerLogoBox = await footerLogo.boundingBox();
      assert.ok(footerLogoBox.height >= 44, `${browserType.name()}: footer logo target is at least 44px`);
      await assertFocusContrast(footerLogo, 'rgb(25, 59, 63)', `${browserType.name()}: footer logo`);
      await hamburger.click();
      assert.ok(await page.locator('#site-nav.is-open').isVisible(), `${browserType.name()}: SP menu opens`);
      await hamburger.click();
      checks += 8;
      const startButton = page.locator('#btn-start');
      await assertFocusContrast(startButton, 'rgb(239, 244, 245)', `${browserType.name()}: main action`);
      checks++;
      await page.click('#btn-start');
      assert.equal(await page.locator('.progress-bar-wrap').getAttribute('aria-valuenow'), '1');
      assert.equal(await page.locator('.progress-bar-wrap').getAttribute('aria-valuetext'), '1問目（全12問）');
      assert.equal(await page.evaluate(() => document.activeElement?.id), 'question-text');
      checks += 3;

      const option = page.locator('.option-btn').nth(3);
      assert.ok((await option.boundingBox()).height >= 44, `${browserType.name()}: option target is at least 44px`);
      await option.click();
      assert.equal(await option.getAttribute('aria-pressed'), 'true');
      await page.click('#btn-next');
      await page.click('#btn-back');
      assert.equal(await page.locator('.option-btn').nth(3).getAttribute('aria-pressed'), 'true', `${browserType.name()}: back keeps answer`);
      checks += 3;

      await page.click('#btn-next');
      for (let index = 1; index < 12; index++) {
        await page.locator('.option-btn').nth(3).click();
        await page.click('#btn-next');
      }
      await page.locator('#screen-results.active').waitFor();
      assert.equal(await page.locator('#score-number').textContent(), '100');
      assert.equal(await page.locator('#stage-badge').textContent(), '推進期');
      assert.equal(await page.evaluate(() => document.activeElement?.id), 'results-heading');
      const footerColumns = await page.locator('.site-footer__sitemap').evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(' ').length);
      assert.equal(footerColumns, 2, `${browserType.name()}: SP footer remains two columns`);
      checks += 4;
      await page.click('#btn-retry');
      assert.ok(await page.locator('#screen-welcome.active').isVisible(), `${browserType.name()}: retry returns to welcome`);
      assert.equal(await page.evaluate(() => document.activeElement?.id), 'btn-start');
      checks += 2;
      await page.close();
    } finally {
      await browser.close();
    }
  }

  const browser = await chromium.launch({ headless: true });
  try {
    const page = await openPage(browser, 375);
    let violations = (await new AxeBuilder({ page }).analyze()).violations;
    assert.deepEqual(violations.map(({ id }) => id), [], `welcome axe: ${violations.map(({ id }) => id).join(', ')}`);
    checks++;
    await page.click('#btn-start');
    violations = (await new AxeBuilder({ page }).analyze()).violations;
    assert.deepEqual(violations.map(({ id }) => id), [], `question axe: ${violations.map(({ id }) => id).join(', ')}`);
    checks++;
    await finishDiagnosis(page, 0);
    violations = (await new AxeBuilder({ page }).analyze()).violations;
    if (violations.length) console.error(JSON.stringify(violations.map(({ id, nodes }) => ({ id, nodes: nodes.map(({ target, failureSummary }) => ({ target, failureSummary })) })), null, 2));
    assert.deepEqual(violations.map(({ id }) => id), [], `result axe: ${violations.map(({ id }) => id).join(', ')}`);
    assert.equal(await page.locator('#score-number').textContent(), '0');
    assert.equal(await page.locator('#stage-badge').textContent(), '準備期');
    checks += 3;
    await page.close();

    const introAnswers = [2, ...Array(11).fill(1)];
    for (const [optionIndex, expectedStage] of [[introAnswers, '導入期'], [2, '活用期'], [3, '推進期']]) {
      const stagePage = await openPage(browser, 375);
      await stagePage.click('#btn-start');
      await finishDiagnosis(stagePage, optionIndex);
      assert.equal(await stagePage.locator('#stage-badge').textContent(), expectedStage);
      const stageViolations = (await new AxeBuilder({ page: stagePage }).analyze()).violations;
      assert.deepEqual(stageViolations.map(({ id }) => id), [], `${expectedStage} axe: ${stageViolations.map(({ id }) => id).join(', ')}`);
      checks += 2;
      await stagePage.close();
    }

    const desktop = await openPage(browser, 1280);
    await desktop.click('#btn-start');
    await finishDiagnosis(desktop, 0);
    const width = await desktop.locator('#screen-results .container').evaluate((element) => element.getBoundingClientRect().width);
    assert.ok(width <= 720.5 && width >= 700, `desktop result width is readable: ${width}`);
    checks++;
    await desktop.close();

    for (const pathname of ['detail.html', 'prices.html', 'curriculum.html', 'estimate.html', 'request.html']) {
      for (const viewportWidth of [375, 1280]) {
        const sharedPage = await openPage(browser, viewportWidth, pathname);
        await assertNoOverflow(sharedPage, `${pathname} ${viewportWidth}`);
        assert.equal(await sharedPage.locator('.site-header').count(), 1, `${pathname}: shared header`);
        assert.equal(await sharedPage.locator('.site-footer').count(), 1, `${pathname}: shared footer`);
        const sharedHeaderLogoBox = await sharedPage.locator('.site-logo').boundingBox();
        const sharedFooterLogoBox = await sharedPage.locator('.site-footer__logo').boundingBox();
        assert.ok(sharedHeaderLogoBox.height >= 44, `${pathname}: header logo target is at least 44px`);
        assert.ok(sharedFooterLogoBox.height >= 44, `${pathname}: footer logo target is at least 44px`);
        const sharedHamburger = sharedPage.locator('.site-nav__hamburger');
        assert.equal(await sharedHamburger.isVisible(), viewportWidth === 375, `${pathname}: responsive nav mode`);
        if (viewportWidth === 375) {
          await sharedHamburger.click();
          assert.ok(await sharedPage.locator('#site-nav.is-open').isVisible(), `${pathname}: SP nav opens`);
          checks++;
        }
        checks += 6;
        await sharedPage.close();
      }
    }
  } finally {
    await browser.close();
  }

  console.log(`diagnosis browser: ${checks} checks PASS (Chromium, Firefox, WebKit)`);
  console.log(`focus indicator contrast: minimum ${Math.min(...focusMeasurements.map(({ ratio }) => ratio)).toFixed(2)}:1 (${focusMeasurements.length} computed-style measurements)`);
} finally {
  server.kill('SIGTERM');
}
