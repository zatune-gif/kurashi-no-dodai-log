import assert from 'node:assert/strict';
import fs from 'node:fs';

let checks = 0;
const check = Object.fromEntries(
  ['match', 'doesNotMatch'].map((method) => [
    method,
    (...args) => {
      assert[method](...args);
      checks++;
    },
  ]),
);

const root = new URL('../', import.meta.url);
const pages = ['diagnosis-simple.html', 'detail.html', 'prices.html', 'curriculum.html', 'estimate.html', 'request.html'];

for (const page of pages) {
  const html = fs.readFileSync(new URL(page, root), 'utf8');
  check.match(html, /class="site-logo__mark"[\s\S]*viewBox="0 0 48 48"/, `${page}: approved leaf mark`);
  check.match(html, /class="site-logo__copy"/, `${page}: grouped brand copy`);
  check.match(html, /<footer class="site-footer"/, `${page}: shared footer remains present`);
  check.doesNotMatch(html, /Noto\+Serif\+JP:wght@700;900/, `${page}: unused serif 700 is not requested`);
}

const diagnosisHtml = fs.readFileSync(new URL('diagnosis-simple.html', root), 'utf8');
check.match(diagnosisHtml, /role="progressbar"/);
check.match(diagnosisHtml, /aria-valuemin="0"/);
check.match(diagnosisHtml, /aria-valuetext="[^\"]+"/);
check.match(diagnosisHtml, /tabindex="-1"[^>]*id="question-text"|id="question-text"[^>]*tabindex="-1"/);

const css = fs.readFileSync(new URL('style.css', root), 'utf8');
const sharedCss = fs.readFileSync(new URL('nav-header-footer.css', root), 'utf8');
check.match(css + sharedCss, /:focus-visible/);
check.match(sharedCss, /\.site-logo\{[^}]*min-height:44px/);
check.match(sharedCss, /\.site-footer__logo\{[^}]*min-height:44px/);
check.doesNotMatch(sharedCss, /max-width:480px[^}]*site-footer__sitemap[^}]*grid-template-columns:1fr/);
check.match(sharedCss, /@media\(max-width:768px\)[\s\S]*site-footer__sitemap\{[^}]*grid-template-columns:repeat\(2,/);

const js = fs.readFileSync(new URL('diagnosis-simple.js', root), 'utf8');
check.doesNotMatch(js, /progressBar\.style\.width|btnBack\.style\.visibility/);
check.match(js, /aria-pressed/);
check.match(js, /aria-valuenow/);
check.match(js, /aria-valuetext/);

console.log(`diagnosis UI contract: ${checks} checks PASS`);
