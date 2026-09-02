# Zatuneya HP V3 Lower Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/v2/`の既存13下層ページを本文と固有CSSを保持してV3共通UIへ移行し、`growth.html`と`tools.html`を追加してTOPの承認済みCTAを復活させる。

**Architecture:** 15ページ共通のトークン、skip link、header、footer、nav、V3共通ボタン、sticky CTAを`top-comp.css`だけに置く。`v3-top-page.css`はTOP本文の`v3-*`とTOP専用sectionだけに限定する。各HTMLは診断URL metaを1個だけ持ち、診断アンカーを`data-diagnosis-link`で既存`nav.js`へ委譲する。

**Tech Stack:** 静的HTML/CSS/JavaScript、Node.js ESM、Playwright、axe-core/playwright、Lighthouse、Chrome Launcher。

---

## 受入基準とタスク対応

| # | 受入基準 | 対応タスク |
| --- | --- | --- |
| 1 | 15ページ全てが`top-comp.css`を読み、`index.html`も同ファイルへ再ポイントする | 3 |
| 2 | `v3-top-page.css`はTOP本文専用で、共通トークンと共通UIセレクタを重複しない | 3 |
| 3 | 既存13ページは本文・固有CSSを維持し、header/footer/nav/sticky CTAだけをV3契約へ移行する | 4 |
| 4 | 15ページは診断URL metaを1個持ち、全診断アンカーを`data-diagnosis-link`へ委譲する | 2, 4, 5 |
| 5 | growth/toolsは確定本文を逐語で実装する | 6 |
| 6 | TOPの2 CTAを正しいhrefで復活する | 7 |
| 7 | 静的契約、3ブラウザ×3幅、axe、Lighthouse、既存回帰が通る | 2, 5, 8 |
| 8 | 本番切替・素材推測・実績差替え・branch削除を行わない | 1, 9 |

## ファイル責務

| パス | 責務 |
| --- | --- |
| `v2/top-comp.css` | 15ページ共通のCSS唯一の配置先 |
| `v2/v3-top-page.css` | TOP本文専用CSS |
| `v2/growth.html` | 5段階の成長地図 |
| `v2/tools.html` | AI活用準備度診断とプロンプトライブラリの一覧 |
| `v2/growth-tools-comp.css` | 新設2ページの本文専用CSS |
| `v2/tests/lower-pages-v3-contract.mjs` | 15ページの静的共通UI・診断URL契約 |
| `v2/tests/lower-pages-v3-browser.mjs` | 15ページのブラウザ共通UI契約 |

## 作業境界

- 実装は`zatuneya-hp` submoduleの新しい`codex/v3-lower-pages` branchと専用worktreeで行い、1本のPull Requestにまとめる。
- 親リポジトリ項目1（設計文書）と項目4（承認済み設計の記録・レビュー結果反映）は別タスク・別コミットであり、submodule gitlinkを混在させない。gitlink更新はClaude担当である。
- ルート`index.html`、`index-v2.html`、`sitemap.xml`、本番canonical・本番OGP、匿名実績、正式素材、branch削除は変更しない。
- 承認カンプ元PNGが不存在なら画像を生成せず、元ファイルの提供を依頼する。取得できた元ファイルだけを`design-comps/zatuneya-hp/`へ内容を表す安定名で保存する。

### Task 1: 基準固定と専用worktree

**Files:**
- Read: `docs/superpowers/specs/2026-09-02-zatuneya-hp-v3-lower-pages-design.md`
- Read: `docs/superpowers/specs/2026-08-30-zatuneya-hp-v3-top-page-copy.md`
- Read: `docs/superpowers/specs/2026-08-30-zatuneya-hp-v3-henkakuya-design.md`
- Create: `zatuneya-hp/.worktrees/v3-lower-pages/`（git worktree）

- [ ] **Step 1: 親リポジトリとsubmoduleの基準を記録する**

Run:

```powershell
$parent = 'C:\Users\ooto\work\ClaudeCode\kurashi-no-dodai-log'
$subrepo = "$parent\00-01_han-ai\zatuneya-hp"
git -C $parent status --short
git -C $subrepo fetch origin
git -C $subrepo rev-parse origin/main
```

Expected: 親リポジトリの既存差分を記録し、parent側にgitlink差分を作らない。

- [ ] **Step 2: 実装専用branchをworktreeで作成する**

Run:

```powershell
$parent = 'C:\Users\ooto\work\ClaudeCode\kurashi-no-dodai-log'
$subrepo = "$parent\00-01_han-ai\zatuneya-hp"
$worktree = "$subrepo\.worktrees\v3-lower-pages"
git -C $subrepo worktree add -b codex/v3-lower-pages $worktree origin/main
git -C $worktree status --short --branch
```

Expected: `codex/v3-lower-pages`が`origin/main`から作成され、worktreeはクリーンである。

- [ ] **Step 3: 現行回帰を実行する**

Run:

```powershell
Set-Location 'C:\Users\ooto\work\ClaudeCode\kurashi-no-dodai-log\00-01_han-ai\zatuneya-hp\.worktrees\v3-lower-pages'
node .\v2\tests\top-comp-contract.mjs
node .\v2\tests\verify-v2.mjs
node .\v2\tests\works-profile-comp-contract.mjs
npm run qa
```

Expected: 全コマンドが終了コード0で完了する。

### Task 2: 失敗する15ページ共通契約を追加する

**Files:**
- Create: `v2/tests/lower-pages-v3-contract.mjs`
- Modify: `v2/tests/verify-v2.mjs`

- [ ] **Step 1: 管理対象と診断metaを定義する**

```js
const managedPages = [
  'index.html', '404.html', 'contact.html', 'faq.html', 'privacy.html',
  'profile.html', 'service-banso.html', 'service-management.html',
  'service-order.html', 'service-training.html', 'services.html',
  'thank-you.html', 'tokusho.html', 'works.html', 'growth.html', 'tools.html'
];
const diagnosisMeta = '<meta name="zatuneya:diagnosis-url" content="https://ai-shindan-zatuneya.netlify.app/">';
const legacyDiagnosisUrl = 'https://han-ai-diagnosis.netlify.app/';
```

- [ ] **Step 2: 失敗する共通UI・診断アンカー契約を書く**

各ページに`existsSync`、`top-comp.css`、meta出現回数1、旧URL不在、`nav.js`、`comp-header`、`comp-footer`、`site-nav__dropdown-trigger`、`sticky-cta`、`sticky-cta-close`を検証する。診断アンカーは場所を問わず次の検証を使う。

```js
const diagnosisAnchors = [...html.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/gi)]
  .map(match => match[0])
  .filter(anchor => /AI活用準備度診断|無料診断|診断する/.test(anchor));
check(diagnosisAnchors.length > 0, `${page} has a diagnosis anchor`);
for (const anchor of diagnosisAnchors) {
  check(/\bdata-diagnosis-link\b/.test(anchor), `${page} delegates diagnosis anchor`);
  check(!/\bhref=/.test(anchor), `${page} has no hard-coded diagnosis href`);
}
```

- [ ] **Step 3: REDを確認する**

Run: `node .\v2\tests\lower-pages-v3-contract.mjs`

Expected: `growth.html exists`、`index.html loads shared top-comp.css`、旧診断URL不在のいずれかで失敗する。

- [ ] **Step 4: V2静的回帰を15ページへ拡張する**

`verify-v2.mjs`の`pages`配列へ`growth.html`と`tools.html`を追加する。全15ページでcanonical、OGP、ローカル参照先存在を確認し、TOPのmeta 1個・`data-diagnosis-link`5本契約は維持する。

- [ ] **Step 5: RED契約をコミットする**

Run:

```powershell
git add -- v2/tests/lower-pages-v3-contract.mjs v2/tests/verify-v2.mjs
git diff --cached --check
git commit -m "test: v3下層ページの共通契約を追加"
```

Expected: テスト2ファイルだけがコミットされる。

### Task 3: 共通CSSを一本化し、indexを再ポイントする

**Files:**
- Modify: `v2/top-comp.css`
- Modify: `v2/v3-top-page.css`
- Modify: `v2/index.html`
- Modify: `v2/tests/lower-pages-v3-contract.mjs`
- Test: `v2/tests/top-comp-contract.mjs`

- [ ] **Step 1: 共通セレクタをtop-comp.cssへ移す**

`v3-top-page.css`から`:root`、`.comp-wrap`、`.skip-link`、`.comp-header`、`.header-inner`、`.brand`、`.brand-mark`、`.comp-nav`、`.site-nav__*`、`.v3-button*`、`.sticky-cta*`、`.comp-footer`、`.footer-row`と、それらのmedia queryを削除して`top-comp.css`へ移す。`v3-top-page.css`には`.v3-hero`、`.problem-grid`、`.value-layout`、`.growth-steps`、`.tool-grid`、`.final-cta`などTOP本文のセレクタだけを残す。

- [ ] **Step 2: index.htmlに共通CSSを追加する**

`v2/index.html`の`<head>`で、次の順に読み込む。

```html
<link rel="stylesheet" href="./top-comp.css">
<link rel="stylesheet" href="./v3-top-page.css">
```

この再ポイントはTOPを下層と同じ共通UI契約へ接続する変更であり、TOP本文を下層ページの見た目へ戻す変更ではない。

- [ ] **Step 3: 共通CSS重複禁止を契約にする**

```js
const forbiddenTopBodySelectors = [
  ':root', '.comp-wrap', '.skip-link', '.comp-header', '.header-inner',
  '.brand', '.brand-mark', '.comp-nav', '.site-nav__link',
  '.site-nav__dropdown-trigger', '.sticky-cta', '.comp-footer', '.footer-row'
];
for (const selector of forbiddenTopBodySelectors) {
  check(!v3TopCss.includes(selector), `v3-top-page.css excludes shared selector: ${selector}`);
}
```

- [ ] **Step 4: GREENを確認してコミットする**

Run:

```powershell
node .\v2\tests\lower-pages-v3-contract.mjs
node .\v2\tests\top-comp-contract.mjs
git add -- v2/top-comp.css v2/v3-top-page.css v2/index.html v2/tests/lower-pages-v3-contract.mjs
git diff --cached --check
git commit -m "refactor: v3共通UIのCSSを一本化"
```

Expected: 共通CSSとTOPの再ポイントに関する契約が通る。

### Task 4: 既存13ページをV3共通UIと診断委譲へ移行する

**Files:**
- Modify: `v2/404.html`, `v2/contact.html`, `v2/faq.html`, `v2/privacy.html`, `v2/profile.html`
- Modify: `v2/service-banso.html`, `v2/service-management.html`, `v2/service-order.html`, `v2/service-training.html`, `v2/services.html`
- Modify: `v2/thank-you.html`, `v2/tokusho.html`, `v2/works.html`
- Read: `v2/nav.js`
- Test: `v2/tests/lower-pages-v3-contract.mjs`

- [ ] **Step 1: 各headを15ページ契約へ揃える**

各HTMLにこのmetaを1個だけ置き、`top-comp.css`、既存固有CSS、`nav.js`を読み続ける。

```html
<meta name="zatuneya:diagnosis-url" content="https://ai-shindan-zatuneya.netlify.app/">
<link rel="stylesheet" href="./top-comp.css">
<script src="./nav.js" defer></script>
```

- [ ] **Step 2: 共通header/footer/sticky CTAをV3構造へ置換する**

headerは`id="site-nav"`、`site-nav__link`、`site-nav__item--dropdown`、`site-nav__dropdown-trigger`、`id="nav-hamburger"`を持つ。footerは`comp-footer`と`footer-row`を保ち、`<small>© 2026 ざつね屋</small>`を表示する。各ページ末尾に次のsticky CTAを置く。

```html
<aside id="sticky-cta" class="sticky-cta" aria-label="無料診断へのご案内">
  <p class="sticky-cta__text">まずは無料診断から</p>
  <a class="sticky-cta__btn" data-diagnosis-link aria-disabled="true">診断する</a>
  <button id="sticky-cta-close" class="sticky-cta__close" type="button" aria-label="無料診断の案内を閉じる">×</button>
</aside>
```

- [ ] **Step 3: 全診断アンカーを属性委譲に置換する**

header、footer、本文CTA、sticky CTAの診断アンカーを`data-diagnosis-link aria-disabled="true"`へ置換し、旧URLと新URLの直書きhrefを残さない。相談・問い合わせ・料金・プロンプトライブラリのhrefは保持する。診断アンカーだけは本文DOM維持の許容例外である。

`nav.js`はmetaのHTTPS検証、`data-diagnosis-link`有効化、モバイルメニュー、ドロップダウン、sticky CTAの閉鎖・セッション抑止をすでに持つため、このタスクでは変更しない。契約とブラウザテストで現行動作を確認する。

- [ ] **Step 4: GREENを確認してコミットする**

Run:

```powershell
node .\v2\tests\lower-pages-v3-contract.mjs
node .\v2\tests\verify-v2.mjs
git add -- v2/404.html v2/contact.html v2/faq.html v2/privacy.html v2/profile.html v2/service-banso.html v2/service-management.html v2/service-order.html v2/service-training.html v2/services.html v2/thank-you.html v2/tokusho.html v2/works.html
git diff --cached --check
git commit -m "feat: v3共通UIを下層ページへ移行"
```

Expected: 13ページの本文・固有CSSを残したまま共通UI契約が通る。

### Task 5: works/profileを含む既存契約とブラウザ契約を更新する

**Files:**
- Modify: `v2/tests/works-profile-comp-contract.mjs`
- Modify: `v2/tests/services-comp-contract.mjs`
- Modify: `v2/tests/faq-contact-comp-contract.mjs`
- Modify: `v2/tests/legal-status-comp-contract.mjs`
- Create: `v2/tests/lower-pages-v3-browser.mjs`

- [ ] **Step 1: works/profile契約を診断委譲へ更新する**

既存の本文、画像asset、固有CSS、`aria-current`、header/footer同一性検証は残し、旧診断URL期待だけを以下へ置換する。

```js
check((works.match(/<meta name="zatuneya:diagnosis-url"/g) ?? []).length === 1, 'works has one diagnosis meta');
check((profile.match(/<meta name="zatuneya:diagnosis-url"/g) ?? []).length === 1, 'profile has one diagnosis meta');
check(!works.includes('https://han-ai-diagnosis.netlify.app/'), 'works removes legacy diagnosis URL');
check(/<a\b[^>]*\bdata-diagnosis-link\b/.test(works), 'works delegates diagnosis links');
```

- [ ] **Step 2: 他の既存3契約を同じ規則へ更新する**

`services-comp-contract.mjs`、`faq-contact-comp-contract.mjs`、`legal-status-comp-contract.mjs`から旧URL直書き期待を除き、meta一意性、`data-diagnosis-link`、共通header/footer、`nav.js`、固有CSS保持を確認する。既存の本文文字列、asset、ローカルリンク存在検証は削除しない。

- [ ] **Step 3: 15ページ×3幅のブラウザRED契約を追加する**

`lower-pages-v3-browser.mjs`で全15ページを375/768/1280pxで開く。HTTP 200、横スクロールなし、ハンバーガー開閉、ドロップダウン開閉とEscape閉鎖、sticky CTA閉鎖、診断アンカーのhref値を検証する。

```js
const response = await page.goto(`${server.origin}/${page}`, { waitUntil: 'load' });
assert.equal(response?.status(), 200, `${page} returns HTTP 200`);
assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `${page} has no horizontal overflow`);
await page.locator('#nav-hamburger').click();
await page.locator('.site-nav__dropdown-trigger').click();
await page.keyboard.press('Escape');
await page.locator('#sticky-cta-close').click();
```

growth/toolsについては、同じループ内で`320`、`375`、`768`、`1280`の各幅のfull-page PNGを`v2/qa-screenshots/<page-name>/<width>.png`へ出力する。既存13ページはブラウザ操作だけを確認し、既存のcanonical PNGを再生成しない。

- [ ] **Step 4: GREENを確認してコミットする**

Run:

```powershell
node .\v2\tests\works-profile-comp-contract.mjs
node .\v2\tests\services-comp-contract.mjs
node .\v2\tests\faq-contact-comp-contract.mjs
node .\v2\tests\legal-status-comp-contract.mjs
node .\v2\tests\lower-pages-v3-browser.mjs
git add -- v2/tests/works-profile-comp-contract.mjs v2/tests/services-comp-contract.mjs v2/tests/faq-contact-comp-contract.mjs v2/tests/legal-status-comp-contract.mjs v2/tests/lower-pages-v3-browser.mjs
git diff --cached --check
git commit -m "test: v3下層共通UIのブラウザ契約を追加"
```

Expected: 既存4契約と15ページ×3幅のブラウザ契約が通る。

### Task 6: growth.htmlとtools.htmlを確定本文どおりに実装する

**Files:**
- Create: `v2/growth.html`
- Create: `v2/tools.html`
- Create: `v2/growth-tools-comp.css`
- Test: `v2/tests/lower-pages-v3-contract.mjs`
- Test: `v2/tests/lower-pages-v3-browser.mjs`

- [ ] **Step 1: growth.htmlへ5段階を逐語で置く**

```html
<ol class="growth-map">
  <li><strong>知る</strong><span>どんなことができるのか、事例で分かる</span></li>
  <li><strong>わかる</strong><span>自社のどの業務に効くかが見える</span></li>
  <li><strong>できる</strong><span>実際に一つの業務が軽くなる</span></li>
  <li><strong>教える</strong><span>社内の人が他の人に教えられる</span></li>
  <li><strong>内製化</strong><span>新しい業務にも自分たちで広げられる</span></li>
</ol>
```

見出しは「知っている」から「自分たちで回せる」まで、リードは「AI活用は、一度の研修で終わるものではありません。会社の状態に合わせて、5つの段階を順に上がっていきます。」とする。

- [ ] **Step 2: tools.htmlへ2カードを逐語で置く**

見出しは「まず、無料のツールから」とする。診断カードは`data-diagnosis-link`を使い、プロンプトライブラリカードは次の固定hrefを使う。

```html
<a class="v3-button v3-button--secondary" href="https://zatune-gif.github.io/kurashi-no-dodai-log/00-01_han-ai/15_prompt-library/">ライブラリを見る</a>
```

- [ ] **Step 3: 新設2ページの本文専用CSSを追加する**

`growth-tools-comp.css`には`.growth-map`、`.growth-map li`、`.tools-grid`、`.tool-resource-card`と各幅のグリッド規則だけを置く。`:root`、`.comp-*`、`.site-nav__*`、`.sticky-cta*`、`.v3-button*`は置かない。

- [ ] **Step 4: GREENを確認してコミットする**

Run:

```powershell
node .\v2\tests\lower-pages-v3-contract.mjs
node .\v2\tests\lower-pages-v3-browser.mjs
git add -- v2/growth.html v2/tools.html v2/growth-tools-comp.css
git diff --cached --check
git commit -m "feat: v3成長段階とツールページを追加"
```

Expected: 新設2ページが確定本文、共通UI、診断URL、全幅ブラウザ契約を満たす。

### Task 7: TOPの承認済みCTAを復活させる

**Files:**
- Modify: `v2/index.html`
- Modify: `v2/tests/top-comp-contract.mjs`
- Test: `v2/tests/lower-pages-v3-contract.mjs`

- [ ] **Step 1: growth CTAを追加する**

```html
<a class="text-link" href="./growth.html">成長段階の考え方をくわしく見る</a>
```

- [ ] **Step 2: tools CTAを追加する**

```html
<a class="text-link" href="./tools.html">ツールの一覧を見る</a>
```

- [ ] **Step 3: TOP契約を追加してGREENを確認する**

`top-comp-contract.mjs`へ、各文言の出現回数1、href値、リンク先存在の検証を追加する。

Run:

```powershell
node .\v2\tests\top-comp-contract.mjs
node .\v2\tests\lower-pages-v3-contract.mjs
git add -- v2/index.html v2/tests/top-comp-contract.mjs
git diff --cached --check
git commit -m "feat: v3TOPから成長段階とツールへ導線を追加"
```

Expected: 2 CTAはリンク切れなく存在し、静的契約が通る。

### Task 8: QA対象を15ページへ拡張し、全回帰を通す

**Files:**
- Modify: `v2/tests/qa-cross-browser.mjs`
- Modify: `v2/tests/qa-axe.mjs`
- Modify: `v2/tests/qa-lighthouse.mjs`
- Test: `v2/tests/verify-v2.mjs`
- Test: `v2/tests/v3-top-page-browser.mjs`
- Test: `v2/tests/lower-pages-v3-browser.mjs`

- [ ] **Step 1: 3つのQAを15ページループへ変更する**

`qa-cross-browser.mjs`はChromium、Firefox、WebKitの各ブラウザで375/768/1280pxを実行する。`qa-axe.mjs`は各ページのmobile/desktopとimmediate/settledを実行する。`qa-lighthouse.mjs`は各ページのmobile/defaultとdesktop/presetを各2回実行する。

- [ ] **Step 2: REDを確認する**

Run:

```powershell
npm run qa:cross-browser
npm run qa:axe
npm run qa:lighthouse
```

Expected: 新設ページ未実装または共通UI未移行の時点で、該当ページのHTTP 200・操作・アクセシビリティ・スコア契約が失敗する。

- [ ] **Step 3: GREENを確認してコミットする**

外部診断URLには遷移せずhref属性を確認する。HTTP 200、横スクロールなし、操作可能なheader/dropdown/sticky CTA、axe違反0、Lighthouse全4指標0.90以上を満たす。

Run:

```powershell
node .\v2\tests\top-comp-contract.mjs
node .\v2\tests\verify-v2.mjs
node .\v2\tests\services-comp-contract.mjs
node .\v2\tests\works-profile-comp-contract.mjs
node .\v2\tests\faq-contact-comp-contract.mjs
node .\v2\tests\legal-status-comp-contract.mjs
node .\v2\tests\lower-pages-v3-contract.mjs
node .\v2\tests\lower-pages-v3-browser.mjs
npm run qa
git add -- v2/tests/qa-cross-browser.mjs v2/tests/qa-axe.mjs v2/tests/qa-lighthouse.mjs
git diff --cached --check
git commit -m "test: v3下層ページの品質ゲートを拡張"
```

Expected: 全コマンドが終了コード0で完了する。

### Task 9: 最適化、スクリーンショット、Pull Request

**Files:**
- Modify: `v2/qa-screenshots/growth/320.png`, `v2/qa-screenshots/growth/375.png`, `v2/qa-screenshots/growth/768.png`, `v2/qa-screenshots/growth/1280.png`
- Modify: `v2/qa-screenshots/tools/320.png`, `v2/qa-screenshots/tools/375.png`, `v2/qa-screenshots/tools/768.png`, `v2/qa-screenshots/tools/1280.png`
- Modify: `v2/qa-screenshots/index/diff-notes.md`

- [ ] **Step 1: 最適化を確認する**

全変更ファイルに使い捨て`console.log`、`alert`、`confirm`、`prompt`、インラインstyle、コメントアウト死にコード、秘密情報露出がないことを確認する。`nav.js`の設計済み操作処理とQAの診断出力は削除しない。

- [ ] **Step 2: スクリーンショットを取得して目視確認する**

Run:

```powershell
node .\v2\tests\lower-pages-v3-browser.mjs
node .\v2\tests\v3-top-page-browser.mjs
```

Expected: growth/toolsの320/375/768/1280px画像とTOP比較画像があり、横スクロール、固定CTAの重なり、モバイルナビのはみ出し、フォント読み込み失敗がない。

- [ ] **Step 3: 差分を限定してPull Requestを作成する**

Run:

```powershell
git diff --check origin/main...HEAD
git diff --name-only origin/main...HEAD
git push -u origin codex/v3-lower-pages
gh pr create --base main --head codex/v3-lower-pages --title "feat: v3下層ページの共通UIを移行" --body "V3共通UI・growth/tools・診断委譲を実装。全回帰、3ブラウザ×3幅、axe、Lighthouseを実行。外部診断実通信と本番昇格は未実施。"
```

Expected: submodule `main`宛てに1本だけPull Requestが作成される。Pull Requestをmergeしない。

## 実行後の受入確認

- [ ] 受入基準1〜8が対応タスクで全て確認済みである。
- [ ] `v3-top-page.css`に共通CSSセレクタの重複がない。
- [ ] 15ページのmeta値と診断アンカー委譲が静的契約で確認済みである。
- [ ] 全既存回帰、3ブラウザ・3幅、axe、Lighthouseが終了コード0である。
- [ ] 承認PNGが未提供なら元ファイルの提供依頼だけを行い、画像生成・本番昇格をしていない。
- [ ] 親リポジトリのgitlink更新を含めていない。
