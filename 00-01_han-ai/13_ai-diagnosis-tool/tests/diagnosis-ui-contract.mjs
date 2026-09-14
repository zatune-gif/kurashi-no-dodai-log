import assert from 'node:assert/strict';
import fs from 'node:fs';

const root = new URL('../', import.meta.url);
const pages = ['diagnosis-simple.html', 'detail.html', 'prices.html', 'curriculum.html', 'estimate.html', 'request.html'];

for (const page of pages) {
  const html = fs.readFileSync(new URL(page, root), 'utf8');
  assert.match(html, /class="site-logo__mark"[\s\S]*viewBox="0 0 48 48"/, `${page}: approved leaf mark`);
  assert.match(html, /class="site-logo__copy"/, `${page}: grouped brand copy`);
  assert.match(html, /<footer class="site-footer"/, `${page}: shared footer remains present`);
}

const diagnosisHtml = fs.readFileSync(new URL('diagnosis-simple.html', root), 'utf8');
assert.match(diagnosisHtml, /role="progressbar"/);
assert.match(diagnosisHtml, /aria-valuemin="0"/);
assert.match(diagnosisHtml, /tabindex="-1"[^>]*id="question-text"|id="question-text"[^>]*tabindex="-1"/);

const css = fs.readFileSync(new URL('style.css', root), 'utf8');
const sharedCss = fs.readFileSync(new URL('nav-header-footer.css', root), 'utf8');
assert.match(css + sharedCss, /:focus-visible/);
assert.doesNotMatch(sharedCss, /max-width:480px[^}]*site-footer__sitemap[^}]*grid-template-columns:1fr/);
assert.match(sharedCss, /@media\(max-width:768px\)[\s\S]*site-footer__sitemap\{[^}]*grid-template-columns:repeat\(2,/);

const js = fs.readFileSync(new URL('diagnosis-simple.js', root), 'utf8');
assert.doesNotMatch(js, /progressBar\.style\.width|btnBack\.style\.visibility/);
assert.match(js, /aria-pressed/);
assert.match(js, /aria-valuenow/);

console.log('diagnosis UI contract: 26 checks PASS');
