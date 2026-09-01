# ざつね屋 HP v3 TOPページ Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `zatuneya-hp` サブモジュールの `/v2/` TOPページを、地域企業の小さな業務変革屋として伝わる長尺LPへ全面改訂し、全導線・レスポンシブ・アクセシビリティを検証可能な状態にする。

**Architecture:** TOPだけを `v2/index.html` と専用の `v2/top-comp.css` で置き換え、下層ページと共有する `nav.js` の既存DOM契約を維持する。静的なHTMLはセクションIDと再利用クラスで役割を固定し、すべての画像枠は役割別の `data-asset-role` とCSSのアスペクト比指定を持たせるため、画像の `src` だけを差し替えてもレイアウトを保てる。既存の静的契約テストをv3要件へ更新し、PlaywrightのローカルHTTPサーバー検証で操作・viewport・モーション低減まで確認する。

**Tech Stack:** 静的HTML5、CSS3、既存JavaScript（`nav.js`）、Node.js標準ライブラリ、Playwright 1.47、PowerShell 5.1、Git。

---

## 実行ワークツリーとレビュー手順（2026-09-01更新）

実装対象は、次の既存サブモジュールワークツリーに限定する。親リポジトリ直下の `zatuneya-hp` は `main` 用の別ワークツリーなので、v3実装・検証・コミットには使わない。

```powershell
$v3Worktree = 'C:\Users\ooto\work\ClaudeCode\kurashi-no-dodai-log\00-01_han-ai\zatuneya-hp\.worktrees\v3-top-page'
git -C $v3Worktree status --short --branch
git -C $v3Worktree branch --show-current
git -C $v3Worktree rev-parse --abbrev-ref --symbolic-full-name '@{upstream}'
```

2026-09-01に、上記ワークツリーがクリーンで `codex/v3-top-page` と `origin/codex/v3-top-page` を確認したうえで、ローカルブランチを `codex/v3-henkakuya` に改名した。レビュー用の初回公開は次のコマンドで上流追跡を設定する。旧リモートブランチ `origin/codex/v3-top-page` は、この段階では削除しない。

```powershell
git -C $v3Worktree push -u origin codex/v3-henkakuya
```

実装コミット後は、(1) `git -C $v3Worktree push` でレビュー用ブランチを更新、(2) Claude が `origin/main...codex/v3-henkakuya` の差分を確認、(3) 指摘を同ブランチで修正して再push、(4) Claude の承認後にのみ、後続の本番昇格タスクへ進む。親リポジトリのgitlink・親main・公開サイトは、このレビュー段階では更新しない。

## レビュー受け入れゲートと本番昇格の条件

- v3 TOP実装は、匿名実績3件が `placeholder` のまま、またはHero以外の写真が正式素材ではない間は、本番のルート `index.html` へ昇格しない。
- 静的契約テストは、本文正本の `requiredCopy` 全文、逐語の開示文、トークン化したモノラインSVGアイコン、`IntersectionObserver` による `.fade-in` の発火を検査する。
- ブラウザ検証は Chromium、Firefox、WebKit の各エンジンで、モバイルとデスクトップの横スクロールおよびナビゲーション操作を確認する。
- axeのアクセシビリティ検査と、モバイル・デスクトップそれぞれのLighthouse 4指標（Performance、Accessibility、Best Practices、SEO）を実行し、各スコアが90以上であることを確認する。
- OGP、meta description、canonicalを新ポジショニングに合わせ、公開前に検査する。
- 承認後の別タスクでのみ、ルート `index.html` 置換、canonical／OGP／`sitemap.xml` 更新、`index-v2.html` 削除、旧 `codex/zatuneya-hp-v2` ブランチ削除を行う。順序はサブモジュールコミット→親gitlinkコミット→両方のpush→公開確認→Obsidian記録とする。

## 事前確認と変更境界

実装対象は親リポジトリではなく、ネストしたGitリポジトリ `zatuneya-hp` の既存v3ワークツリーである。以後、サブモジュール内のコマンドは必ず `git -C $v3Worktree ...` または `Set-Location $v3Worktree` で実行する。親リポジトリのサブモジュールgitlink更新は、Claudeの差分承認と本番昇格条件の充足後にのみ行う。

今回変更するのはTOPとそれを検証する資産だけであり、V1、`v2/` の下層HTML、共有 `style.css`、共有 `nav.js` を変更しない。現在の `nav.js` が参照する `#nav-hamburger`、`#site-nav`、`.site-nav__dropdown-trigger`、`.fade-in`、`#sticky-cta`、`#sticky-cta-close` は新しいTOPにも存在させる。

### ファイル責務（この分割を変更しない）

| ファイル | 変更種別 | 責務 |
| --- | --- | --- |
| `zatuneya-hp/v2/index.html` | 置換 | v3のセマンティックなTOP構造、全12セクション、ヘッダー・フッター・スティッキーCTA、正本本文、画像の役割名 |
| `zatuneya-hp/v2/top-comp.css` | 置換 | v3 TOP専用トークン、レイアウト、コンポーネント、レスポンシブ、フォーカス、reduced-motion。下層ページ用CSSを含めない |
| `zatuneya-hp/v2/tests/top-comp-contract.mjs` | 置換 | HTML/CSSを読む静的v3契約テスト。全セクション、リンク、DOM契約、仮データ、アクセシビリティ禁止事項を判定 |
| `zatuneya-hp/v2/tests/v3-top-page-browser.mjs` | 新規 | ローカルHTTPサーバーとPlaywrightを使うブラウザ操作・横スクロール・viewport・スクリーンショット検証 |
| `zatuneya-hp/v2/qa-screenshots/index/320.png` | 更新 | 320px回帰確認用の全ページPNG |
| `zatuneya-hp/v2/qa-screenshots/index/375.png` | 更新 | 必須モバイル幅の全ページPNG |
| `zatuneya-hp/v2/qa-screenshots/index/768.png` | 更新 | 必須タブレット幅の全ページPNG |
| `zatuneya-hp/v2/qa-screenshots/index/1280.png` | 更新 | 必須デスクトップ幅の全ページPNG |
| `zatuneya-hp/v2/qa-screenshots/index/diff-notes.md` | 更新 | 参考画像との目視確認項目と、カンプに含まれない正式素材・仮データを明示したQA記録 |

既存アセット `v2/assets/hero-meeting-photo.jpg`、`hero-photo.jpg`、`band-training.jpg`、`band-onsite.jpg`、`band-together.jpg`、`profile-portrait-2.jpg` を使用し、新規の外部画像は取得しない。`hero-meeting-photo.jpg` をHero専用に用い、それ以外は暫定画像として役割名を付ける。匿名実績は本文正本の3件のみを表示し、実データのような数値・会社名・固有名を追加しない。匿名実績とHero以外の正式写真が揃うまでは、`/v2/` の実装を本番へ昇格させない。

## 正本と実装上の固定値

- 本文を一字ずつ参照する正本: `docs/superpowers/specs/2026-08-30-zatuneya-hp-v3-top-page-copy.md`。
- 範囲・アクセシビリティ・デザインの正本: `docs/superpowers/specs/2026-08-30-zatuneya-hp-v3-henkakuya-design.md`。
- 視覚上の優先順位の元PNG `C:\Users\ooto\OneDrive\Desktop\Codex 画像 2026年8月30日 18_36_23.png` は2026-09-01に不存在を確認した。承認カンプPNGは `design-comps/zatuneya-hp/` へ再添付待ちであり、再添付までは写真の細部を視覚正本にせず、確定済みの情報優先順位（Hero→お悩み→主力パッケージ→3サービス→支援の流れ→強み→実績→無料ツール→FAQ→最終CTA）だけを採用する。
- 実装指示の正本: `design-comps/zatuneya-hp/v3-top-page-implementation-brief.txt`。これは `C:\Users\ooto\.codex\attachments\2246b744-0ae5-4478-8c49-e139b70c30ad\pasted-text.txt` から内容を変更せずコピーした追跡用成果物である。
- 全診断CTAの当面値は `https://ai-shindan-zatuneya.netlify.app/` とする。`v2/index.html` の `<meta name="zatuneya:diagnosis-url" content="…">` を唯一の保持場所とし、共有ナビ、Hero、ツールカード、最終CTA、スティッキーCTAの5本は `data-diagnosis-link` として `nav.js` がHTTPS URLを検証後に有効化する。独自ドメイン取得後は、このmetaの`content`だけを最終URLへ差し替える。相談・お問い合わせは `./contact.html`、パッケージは `./service-management.html`、プロンプトライブラリは `https://zatune-gif.github.io/kurashi-no-dodai-log/00-01_han-ai/15_prompt-library/` とする。`growth.html` と `tools.html` は未作成のため、対応するTOP CTAはリンク切れにせず一時的に非表示とする。
- 後続タスク: `growth.html` と `tools.html` を作成後、承認済みの「成長段階の考え方をくわしく見る」→ `./growth.html` と「ツールの一覧を見る」→ `./tools.html` をTOPへ復活する。同時に、両リンク先の存在を確認する静的契約と、リンク表示・遷移を確認するブラウザ契約を追加する。

## Task 1: v3の失敗する契約テストを先に定義する

**Files:**
- Modify: `zatuneya-hp/v2/tests/top-comp-contract.mjs`
- Test: `zatuneya-hp/v2/tests/top-comp-contract.mjs`

- [ ] **Step 1: 既存テストの旧v2コピー契約を、下記のv3契約へ置き換える**

  `index.html` をUTF-8で読み、順序付きID、主要コピー、診断リンク、既存DOM契約、画像枠、禁止事項を機械判定する。以下の値をそのまま使う。テスト内の`sectionIds`は本文正本の順序と一致するため、HTMLは同じIDを持つ`section`を同順で並べる。

  ```js
  const diagnosisUrl = 'https://ai-shindan-zatuneya.netlify.app/';
  const diagnosisMetaName = 'zatuneya:diagnosis-url';
  const sectionIds = [
    'hero', 'problems', 'value', 'growth', 'package', 'services',
    'journey', 'why-us', 'cases', 'tools', 'faq', 'final-cta'
  ];
  const requiredCopy = [
    'AIを入れることより、仕事がよくなることから。',
    'こんな詰まり方を、していませんか',
    '「業務変革屋」の仕事',
    '「知っている」から「自分たちで回せる」まで',
    'まず3か月、一つの業務を確実に変える',
    'AI経営改善パッケージ ／ 360,000円（3か月）',
    '必要なところから始められます', 'はじめてのご相談から',
    '「教えられる人」が、現場に入ります', 'これまでにお手伝いしたこと',
    'まず、無料のツールから', 'よくある質問', 'まず30分、話を聞かせてください'
  ];
  for (const id of sectionIds) check(html.includes(`<section id="${id}"`), `section exists: #${id}`);
  check(sectionIds.every((id, index) => index === 0 || html.indexOf(`id="${sectionIds[index - 1]}"`) < html.indexOf(`id="${id}"`)), 'section order is fixed');
  for (const copy of requiredCopy) check(html.includes(copy), `required copy: ${copy}`);
  const diagnosisMeta = [...html.matchAll(/<meta\b(?=[^>]*\bname="zatuneya:diagnosis-url")(?=[^>]*\bcontent="([^"]+)")[^>]*>/g)];
  check(diagnosisMeta.length === 1 && diagnosisMeta[0][1] === diagnosisUrl, 'diagnosis URL meta is the exact single source');
  const diagnosisLinks = [...html.matchAll(/<a\b([^>]*)>[\s\S]*?<\/a>/g)]
    .filter(([, attributes]) => /\bdata-diagnosis-link\b/.test(attributes));
  check(diagnosisLinks.length === 5, 'five diagnosis links are hydrated from the meta marker');
  diagnosisLinks.forEach(([, attributes]) => check(!/\bhref=/.test(attributes), 'static diagnosis links do not duplicate the URL'));
  ```

  加えて、次のassertを同じ`check`関数で置く。`<main id="main">`、`<h1>`、`#nav-hamburger`、`#site-nav`、`.site-nav__dropdown-trigger`、`.fade-in`、`#sticky-cta`、`#sticky-cta-close`、`aria-expanded`と`aria-controls`を持つFAQボタン3個、`data-case-status="placeholder"`を持つ事例3件、`data-asset-role`を持つ画像6個、`alt=""`ではないHero/代表画像、`© 2026 ざつね屋`、`top-comp.css`、`nav.js`、`prefers-reduced-motion`、`min-height:44px`、`:focus-visible`、`scroll-padding-bottom`、4pxトークン `--space-4:4px` と `--space-96:96px` を検査する。

  禁止assertも明示する。

  ```js
  check(!/style\s*=/.test(html), 'index has no inline styles');
  check(!/[😀-🙏]/u.test(html), 'TOP uses no emoji icons');
  check(!/ロボット|AIチップ|ホログラム|回路/.test(html), 'TOP avoids AI-symbol imagery copy');
  check(!/alert\(|confirm\(|prompt\(/.test(readFileSync(join(root, 'nav.js'), 'utf8')), 'shared script has no blocking dialog');
  check(!/color:\s*#fff[^}]*background:\s*var\(--orange\)/.test(css), 'orange backgrounds never use white text');
  ```

- [ ] **Step 2: REDを確認する**

  Run: `node "$v3Worktree/v2/tests/top-comp-contract.mjs"`

  Expected: `AssertionError` で失敗する。現行HTMLに `AIを入れることより、仕事がよくなることから。` と `section exists: #hero` が存在しないため、`PASS TOP v3 contract` は出力されない。

- [ ] **Step 3: 変更対象がテストだけであることを確認してコミットする**

  Run: `git -C $v3Worktree status --short`

  Expected: `v2/tests/top-comp-contract.mjs` だけが変更として表示される。実装をまだ含めないため、このREDコミットは作らず、Task 3のGREENコミットに含める。

## Task 2: ブラウザ検証ハーネスをREDで追加する

**Files:**
- Create: `zatuneya-hp/v2/tests/v3-top-page-browser.mjs`
- Test: `zatuneya-hp/v2/tests/v3-top-page-browser.mjs`

- [ ] **Step 1: ローカルHTTPサーバー、4 viewport、キーボード、reduced-motionを検査するスクリプトを書く**

  `file:` URLではなくHTTPで`nav.js`とsessionStorageを検証する。`root`は`resolve(import.meta.dirname, '..')`、スクリーンショット先は`join(root, 'qa-screenshots', 'index')`とする。テストは既存のPlaywright依存を`zatuneya-hp/node_modules/playwright`から解決するため、`import { chromium } from 'playwright'`を使用する。

  ```js
  const viewports = [
    { width: 320, height: 900 }, { width: 375, height: 900 },
    { width: 768, height: 1024 }, { width: 1280, height: 960 }
  ];
  const serve = createServer((request, response) => {
    const pathname = request.url === '/' ? '/index.html' : new URL(request.url, 'http://127.0.0.1').pathname;
    const target = resolve(root, `.${pathname}`);
    assert.ok(target.startsWith(root), 'server path stays inside v2 root');
    response.writeHead(200, { 'content-type': mime.get(extname(target)) ?? 'application/octet-stream' });
    response.end(readFileSync(target));
  });
  await new Promise((resolveListen) => serve.listen(4173, '127.0.0.1', resolveListen));
  try {
    for (const viewport of viewports) {
      const page = await browser.newPage({ viewport });
      await page.goto('http://127.0.0.1:4173/index.html', { waitUntil: 'networkidle' });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, `no horizontal scroll at ${viewport.width}px`);
      await page.screenshot({ path: join(screenshotDir, `${viewport.width}.png`), fullPage: true });
      await page.close();
    }
  } finally { await new Promise((done) => serve.close(done)); }
  ```

  375pxのページに対し、次の操作assertを続けて書く。FAQのボタンは`#faq button[aria-controls]`、閉じるボタンは`#sticky-cta-close`、ナビは`#nav-hamburger`で取得する。

  ```js
  await faqButtons.nth(0).focus();
  await page.keyboard.press('Enter');
  assert.equal(await faqButtons.nth(0).getAttribute('aria-expanded'), 'true');
  assert.equal(await page.locator(`#${await faqButtons.nth(0).getAttribute('aria-controls')}`).isHidden(), false);
  await page.locator('#sticky-cta-close').click();
  assert.equal(await page.locator('#sticky-cta').evaluate((el) => el.classList.contains('is-closed')), true);
  await page.reload({ waitUntil: 'networkidle' });
  assert.equal(await page.locator('#sticky-cta').evaluate((el) => el.classList.contains('is-closed')), true);
  await page.locator('#nav-hamburger').focus();
  await page.keyboard.press('Enter');
  assert.equal(await page.locator('#nav-hamburger').getAttribute('aria-expanded'), 'true');
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#nav-hamburger').getAttribute('aria-expanded'), 'false');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  assert.equal(await page.locator('.fade-in').first().evaluate((el) => getComputedStyle(el).animationDuration), '0.01s');
  ```

  成功時の最終行は `PASS v3 TOP browser checks: 4 viewports, keyboard, sticky CTA, reduced motion` とする。失敗時にも`finally`でbrowserとHTTPサーバーを閉じる。

- [ ] **Step 2: REDを確認する**

  Run: `node "$v3Worktree/v2/tests/v3-top-page-browser.mjs"`

  Expected: 現行TOPには`#sticky-cta-close`と`#faq`がないためlocatorの待機で失敗し、PNGは完了扱いにしない。

## Task 3: セマンティックなv3 TOP本文とDOM契約を実装してGREENにする

**Files:**
- Modify: `zatuneya-hp/v2/index.html`
- Modify: `zatuneya-hp/v2/tests/top-comp-contract.mjs`
- Modify: `zatuneya-hp/v2/tests/v3-top-page-browser.mjs`
- Test: `zatuneya-hp/v2/tests/top-comp-contract.mjs`
- Test: `zatuneya-hp/v2/tests/v3-top-page-browser.mjs`

- [ ] **Step 1: HTMLのhead、ヘッダー、Heroを置換する**

  `lang="ja"`、canonical `https://zatune-gif.github.io/zatuneya-hp/v2/`、既存favicon一式、Google Fonts（Noto Sans JP、Noto Serif JP、Roboto）と`./top-comp.css`を残す。本文の最初に`<a class="skip-link" href="#main">本文へ移動</a>`を置き、ヘッダーには`#site-nav`、`#nav-hamburger`、無料ツールドロップダウンの`.site-nav__dropdown-trigger`を含める。`button`の最小高さはCSSで44pxにし、ページ内遷移は`href`を用いる。

  Heroは次の骨組みと本文正本の全文を使う。診断CTAはこの完全URL、相談CTAは`./contact.html`以外にしない。

  ```html
  <main id="main">
    <section id="hero" class="v3-hero fade-in" aria-labelledby="hero-title">
      <div class="v3-container v3-hero__grid">
        <div class="v3-hero__copy">
          <p class="v3-eyebrow">地域企業の小さな業務変革屋 ／ ざつね屋</p>
          <h1 id="hero-title">AIを入れることより、仕事がよくなることから。</h1>
          <p class="v3-hero__lead">数十名規模の会社で、「人が足りない」「引き継ぎが回らない」「同じ説明を何度もしている」。その一つひとつを、現場に入って一緒にほどいていきます。ツールの導入は、そのあとの話です。</p>
          <div class="v3-action-row">
            <a class="v3-button v3-button--primary" data-diagnosis-link aria-disabled="true">無料でAI活用準備度を診断する</a>
            <a class="v3-button v3-button--secondary" href="./contact.html">まず30分、話を聞かせてください</a>
          </div>
          <p class="v3-microcopy">広島県府中市を拠点に、近隣の地域企業を訪問して支援しています。</p>
        </div>
        <figure class="v3-media v3-media--hero"><img src="./assets/hero-meeting-photo.jpg" data-asset-role="hero-meeting" alt="業務資料を囲み、二人で業務を整理する様子" width="967" height="780"></figure>
      </div>
    </section>
  ```

- [ ] **Step 2: Hero以降の11セクションを正本の順序・コピーで実装する**

  `#problems` は4つの`article.v3-problem-card`、`#value`は3つの`article.v3-pillar`、`#growth`は5つの`li.v3-growth-step`、`#package`は3つの`li.v3-package-step`・3つの受け取れるもの・2つの対象会社、`#services`は「3つのサービス」として3つの`article.v3-service-card`、`#journey`は5つの`li.v3-journey-step`、`#why-us`は3つの強みと代表情報、`#cases`は3つの`article.v3-case-card`、`#tools`は2つの`article.v3-tool-card`、`#faq`は3つのFAQ、`#final-cta`は診断・お問い合わせの2CTAに固定する。

  各カードのアイコンは以下の形式のインラインSVGだけを使う。Unicode絵文字、外部アイコンライブラリ、PNGアイコンは追加しない。

  ```html
  <svg class="v3-line-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M4 20V11M10 20V5M16 20v-6M4 20h16" />
  </svg>
  ```

  画像を含むサービス、代表、CTA帯は、次のように`data-asset-role`を画像自身へ付ける。CSSは親クラスで寸法を決めるので、正式素材へ変更するのは`src`、`alt`、必要時のみ`object-position`カスタムプロパティの3つで済む。

  ```html
  <figure class="v3-media v3-media--service"><img src="./assets/band-training.jpg" data-asset-role="service-training" alt="資料を見ながら業務の進め方を確認する手元" loading="lazy"></figure>
  <figure class="v3-media v3-media--profile"><img src="./assets/profile-portrait-2.jpg" data-asset-role="representative-portrait" alt="代表の大音晃司" loading="lazy"></figure>
  ```

  実績3件はそれぞれ`data-case-status="placeholder"`を付け、セクション冒頭に`<p class="v3-case-disclosure">以下は仮データです。事実確認済みの匿名事例に差し替え予定です。</p>`を表示する。本文正本にある`◯◯`を残し、根拠のない結果数値へ置換しない。

  FAQはbutton/answerをIDで一対一にする。

  ```html
  <article class="v3-faq-item">
    <h3><button class="faq-trigger" type="button" aria-expanded="false" aria-controls="faq-answer-ai">Q. AIのことがまったく分からなくても大丈夫ですか。</button></h3>
    <div id="faq-answer-ai" class="v3-faq-answer" hidden><p>A. はい。むしろ「触ったことはあるが続かなかった」という状態からのご相談が多いです。業務の中身をお聞きするところから始めます。</p></div>
  </article>
  ```

  `#final-cta`の診断リンクはURLを再利用し、相談・お問い合わせリンクは`./contact.html`にする。フッターに屋号、肩書、既存下層へのリンク、`© 2026 ざつね屋`を置く。末尾に`#sticky-cta`と`#sticky-cta-close`を置く。

  ```html
  <aside id="sticky-cta" class="sticky-cta" aria-label="無料診断へのご案内">
    <p class="sticky-cta__text">まずは無料診断から</p>
    <a class="sticky-cta__btn" data-diagnosis-link aria-disabled="true">診断する</a>
    <button id="sticky-cta-close" class="sticky-cta__close" type="button" aria-label="無料診断の案内を閉じる">×</button>
  </aside>
  <script src="./nav.js" defer></script>
  ```

- [ ] **Step 3: 静的テストをGREENにする**

  Run: `node "$v3Worktree/v2/tests/top-comp-contract.mjs"`

  Expected: 終端に `PASS TOP v3 contract` と、全`check`件数を表示する。旧v2コピー（`教えて、作って、`、`AI活用のステップに合わせた 4 つのサービス`、根拠を示せない実績数値）を要求するassertは残さない。

- [ ] **Step 4: ブラウザテストが要求するDOMに合わせ、失敗したselectorを修正してGREENにする**

  Run: `node "$v3Worktree/v2/tests/v3-top-page-browser.mjs"`

  Expected: `PASS v3 TOP browser checks: 4 viewports, keyboard, sticky CTA, reduced motion`。`qa-screenshots/index/320.png`、`375.png`、`768.png`、`1280.png`がいずれも更新される。

## Task 4: 参考画像の階層をCSSへ実装し、全幅で読みやすくする

**Files:**
- Modify: `zatuneya-hp/v2/top-comp.css`
- Test: `zatuneya-hp/v2/tests/top-comp-contract.mjs`
- Test: `zatuneya-hp/v2/tests/v3-top-page-browser.mjs`

- [ ] **Step 1: 専用CSSのトークンと共通部品を置換する**

  `:root` に次のトークンを定義し、すべての間隔に`--space-*`を用いる。4px単位でない17px、27px、53pxの余白は書かない。

  ```css
  :root {
    --ink: #173F46; --teal: #5BBDC8; --teal-dark: #31747C;
    --orange: #F8981D; --orange-ink: #332211; --surface: #FFFFFF; --ground: #EFF4F5;
    --space-4: 4px; --space-8: 8px; --space-12: 12px; --space-16: 16px;
    --space-24: 24px; --space-32: 32px; --space-40: 40px; --space-48: 48px;
    --space-64: 64px; --space-80: 80px; --space-96: 96px;
    --radius-card: 16px; --shadow-card: 0 12px 32px rgba(23, 63, 70, .10);
    --font-sans: 'Noto Sans JP', sans-serif; --font-serif: 'Noto Serif JP', serif;
  }
  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; scroll-padding-bottom: 104px; }
  body { margin: 0; color: var(--ink); background: var(--surface); font: 400 16px/1.7 var(--font-sans); letter-spacing: .02em; }
  .v3-container { width: min(100% - 64px, 1200px); margin-inline: auto; }
  .v3-button, .site-nav__dropdown-trigger, #nav-hamburger, .faq-trigger, .sticky-cta__close { min-height: 44px; }
  :focus-visible { outline: 3px solid var(--orange); outline-offset: 3px; }
  ```

  `v3-button--primary`はオレンジ背景＋`--orange-ink`、`v3-button--secondary`は白背景＋濃ティール境界線、濃ティール背景のCTA上の診断ボタンは白背景＋濃ティール文字とする。白文字を使うのは`--ink`または`--teal-dark`の背景だけに限定する。

  WCAG 2.1 AAとして、通常テキストの前景色と背景色は4.5:1以上、大きな見出しは3:1以上、境界線・アイコン・フォーカスリングなど非テキストUIは3:1以上を満たす組み合わせだけを使う。オレンジ地には`--orange-ink`、白地には`--ink`または`--teal-dark`を用いる。リンクのhoverだけで意味を伝えず、現在ページは下線、FAQ開閉は`aria-expanded`と開閉記号、キーボード操作は`:focus-visible`で判別可能にする。

- [ ] **Step 2: セクションの視線誘導と仮画像差し替え枠を実装する**

  HeroはPCでコピーと写真の2列、`aspect-ratio: 967 / 780`と`object-fit: cover`を持つ。主力パッケージは`background: var(--ground)`、広い上下余白、ティール枠、3つのSTEP・受取物・対象会社を3列内に配置して他サービスより大きく見せる。各`v3-media`はコンポーネント側でトリミングを決める。

  ```css
  .v3-section { padding-block: var(--space-96); }
  .v3-hero__grid { display: grid; grid-template-columns: minmax(0, .9fr) minmax(0, 1.1fr); align-items: center; gap: var(--space-48); min-height: 560px; }
  .v3-media { margin: 0; overflow: hidden; background: var(--ground); border-radius: var(--radius-card); }
  .v3-media img { width: 100%; height: 100%; object-fit: cover; object-position: var(--media-position, center); }
  .v3-media--hero { aspect-ratio: 967 / 780; --media-position: 50% 50%; }
  .v3-media--service { aspect-ratio: 16 / 10; }
  .v3-media--profile { aspect-ratio: 4 / 5; }
  .v3-package { border: 1px solid var(--teal); border-radius: var(--radius-card); background: var(--ground); padding: var(--space-48); }
  .v3-service-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--space-24); }
  .v3-growth-list, .v3-journey-list { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: var(--space-16); }
  .v3-line-icon { width: 40px; height: 40px; fill: none; stroke: var(--teal-dark); stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
  ```

  問題カード4枚はPCで4列、サービス3枚はPCで3列、ツール2枚はPCで2列、FAQは横2列にはせず縦1列、実績3枚は装飾を抑えた3列にする。`.sticky-cta`は`position: fixed; inset-inline: 0; bottom: 0; z-index: 50`、閉じた状態の`.sticky-cta.is-closed { display: none; }`、本文末尾は`padding-bottom: 112px`を持つためCTAが最終CTA/フッターを隠さない。

- [ ] **Step 3: 768px以下と400px以下を再構成する**

  768px以下ではコンテナを`width: min(100% - 48px, 720px)`、主要セクションを`padding-block: var(--space-64)`、Heroを1列、サービスを2列、問題カードを2列、成長段階・支援の流れを縦1列へ変更する。375px/320pxではコンテナを`width: min(100% - 40px, 480px)`、サービス・問題・実績・ツールを1列、CTAを`width:100%`、H1を`clamp(32px, 9vw, 36px)`、H2を`clamp(26px, 7vw, 30px)`、H3を`clamp(20px, 5.5vw, 22px)`にする。

  ```css
  @media (max-width: 768px) {
    .v3-container { width: min(100% - 48px, 720px); }
    .v3-section { padding-block: var(--space-64); }
    .v3-hero__grid, .v3-growth-list, .v3-journey-list { grid-template-columns: 1fr; }
    .v3-service-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .v3-problem-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
  @media (max-width: 400px) {
    html, body { max-width: 100%; overflow-x: hidden; }
    .v3-container { width: min(100% - 40px, 480px); }
    .v3-service-grid, .v3-problem-grid, .v3-case-grid, .v3-tool-grid { grid-template-columns: 1fr; }
    .v3-action-row { display: grid; grid-template-columns: 1fr; }
    .v3-action-row .v3-button { width: 100%; }
  }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation-duration: .01s !important; animation-iteration-count: 1 !important; scroll-behavior: auto !important; transition-duration: .01s !important; }
  }
  ```

- [ ] **Step 4: GREENと視覚回帰を確認する**

  Run: `node "$v3Worktree/v2/tests/top-comp-contract.mjs"; node "$v3Worktree/v2/tests/v3-top-page-browser.mjs"; node "$v3Worktree/v2/tests/verify-v2.mjs"`

  Expected: v3契約、4 viewportのブラウザ検証、既存V2静的検証が全てPASSする。`verify-v2.mjs`が旧TOPコピーを直接検証しないため、下層ページのcanonical・参照・インラインstyle規約も回帰しない。

## Task 5: スクリーンショットを目視確認し、QA記録を残す

**Files:**
- Modify: `zatuneya-hp/v2/qa-screenshots/index/320.png`
- Modify: `zatuneya-hp/v2/qa-screenshots/index/375.png`
- Modify: `zatuneya-hp/v2/qa-screenshots/index/768.png`
- Modify: `zatuneya-hp/v2/qa-screenshots/index/1280.png`
- Modify: `zatuneya-hp/v2/qa-screenshots/index/diff-notes.md`
- Test: `zatuneya-hp/v2/tests/v3-top-page-browser.mjs`

- [ ] **Step 1: 必須3幅を含むPNGを生成する**

  Run: `node "$v3Worktree/v2/tests/v3-top-page-browser.mjs"`

  Expected: `qa-screenshots/index/375.png`、`768.png`、`1280.png`が当回生成時刻で更新され、回帰確認用の`320.png`も更新される。各PNGは`fullPage: true`で、全12セクション・フッター・スティッキーCTAを含む。

- [ ] **Step 2: 参考画像と4枚のPNGを並べて目視確認する**

  1280pxでは、写真とコピーの2列Hero、4つのお悩み、主力パッケージの明確な強調、3サービス、5段階の支援の流れ、代表・実績・ツール・FAQ・濃ティール最終CTAの順序と強弱を確認する。768pxでは3サービスが2列以下、375px/320pxではカード・CTA・成長段階・支援の流れが1列となり、横方向の切れ・重なり・固定CTAによる隠れがないことを確認する。仮写真の人物や手指の形をカンプへの一致項目に含めない。元PNGは不存在のため、再添付されるまでPNGとの見た目比較を合格条件にせず、不存在と再添付待ちを `diff-notes.md` に記録する。

- [ ] **Step 3: `diff-notes.md`を次の固定書式で更新する**

  ```md
  # v3 TOP スクリーンショット確認（2026-08-30）

  - 確認幅: 320px / 375px / 768px / 1280px
  - 確認項目: 全12セクションの順序、H1と主力パッケージの視線誘導、CTAの用途別リンク、写真枠の比率、4px余白、ヘッダー、フッター、スティッキーCTA、横スクロール、重なり、キーボードフォーカス、reduced-motion
  - 結果: 4幅ともブラウザ検証で `document.documentElement.scrollWidth <= window.innerWidth` を確認。375px / 768px / 1280pxの目視では、参考画像の情報優先順位に沿うことを確認。
  - 差し替え対象: Hero以外の写真は暫定素材。`data-asset-role`を持つ画像の `src` と `alt` を事実確認済み素材へ差し替える。匿名実績は `data-case-status="placeholder"` の仮データであり、事実確認済みの匿名事例へ置換する。
  ```

## Task 6: 最適化・ドキュメント影響・最終検証・コミットを行う

**Files:**
- Modify: `zatuneya-hp/v2/index.html`
- Modify: `zatuneya-hp/v2/top-comp.css`
- Modify: `zatuneya-hp/v2/tests/top-comp-contract.mjs`
- Create: `zatuneya-hp/v2/tests/v3-top-page-browser.mjs`
- Modify: `zatuneya-hp/v2/qa-screenshots/index/320.png`
- Modify: `zatuneya-hp/v2/qa-screenshots/index/375.png`
- Modify: `zatuneya-hp/v2/qa-screenshots/index/768.png`
- Modify: `zatuneya-hp/v2/qa-screenshots/index/1280.png`
- Modify: `zatuneya-hp/v2/qa-screenshots/index/diff-notes.md`

- [ ] **Step 1: 最適化チェックを機械的に行う**

  Run: `rg -n 'console\.log|alert\(|confirm\(|prompt\(|style\s*=' "$v3Worktree/v2/index.html" "$v3Worktree/v2/top-comp.css" "$v3Worktree/v2/nav.js" "$v3Worktree/v2/tests"`

  Expected: `style=`、`alert(`、`confirm(`、`prompt(`は0件。テストの禁止assertに現れる文字列と、既存テストの成功ログ以外に`console.log`はない。使い捨てデバッグログ・コメントアウトされた死にコード・秘密情報は0件。静的サイトのためAPI返り値・認証処理は存在せず、APIキーも追加しない。

- [ ] **Step 2: ドキュメントへの影響を判定する**

  Run: `rg --files $v3Worktree | rg '(^|/|\\)(README|readme)(\.|$)'`

  Expected: 出力0件。サブモジュールにはREADMEがないため、更新対象のREADME・運用手順書は存在しない。親の3つのv3仕様書はすでに今回の確定事項を記載しており、実装で新URL・新操作・新配布物を増やさないため変更しない。`qa-screenshots/index/diff-notes.md`を今回の検証記録として更新する。

- [ ] **Step 3: 最終検証を順に実行する**

  Run: `node "$v3Worktree/v2/tests/top-comp-contract.mjs"; node "$v3Worktree/v2/tests/v3-top-page-browser.mjs"; node "$v3Worktree/v2/tests/verify-v2.mjs"; git -C $v3Worktree diff --check; git -C $v3Worktree status --short`

  Expected: 3つのNodeコマンドはすべてPASS、`git diff --check`は出力0件。`status --short`にはTask 6のファイル一覧だけが表示され、下層HTML・共有`style.css`・共有`nav.js`・V1ファイルは表示されない。外部の診断URLへの実通信は行わないため、診断アプリ自体の稼働は未検証と記録する。

- [ ] **Step 4: サブモジュールのレビュー用コミットを作成する**

  Run: `git -C $v3Worktree add -- v2/index.html v2/top-comp.css v2/tests/top-comp-contract.mjs v2/tests/v3-top-page-browser.mjs v2/qa-screenshots/index/320.png v2/qa-screenshots/index/375.png v2/qa-screenshots/index/768.png v2/qa-screenshots/index/1280.png v2/qa-screenshots/index/diff-notes.md; if ($?) { git -C $v3Worktree diff --cached --check }; if ($?) { git -C $v3Worktree commit -m "feat: v3トップページを業務変革屋として再設計" }`

  Expected: サブモジュール内で1コミットが作成され、ステージ済みのファイルは上記9ファイルだけである。

  親リポジトリのgitlinkをステージ・コミット・pushしない。Claudeの差分承認と、本番昇格条件の充足まではサブモジュールのレビュー用ブランチだけを更新する。

- [ ] **Step 5: レビュー用ブランチをpushし、Claudeの差分確認へ渡す**

  Run: `git -C $v3Worktree push`

  Expected: サブモジュールの実装コミットが `codex/v3-henkakuya` にpushされ、Claude が差分レビューできる。親のgitlinkを含む親mainへのcommit・push・公開は、このレビュー承認後の本番昇格タスクまで行わない。

## 後続Task: 本番昇格・公開・記録

このTaskは、Claudeの差分承認後、匿名実績3件が事実確認済みの匿名事例へ置換され、Hero以外の写真が正式素材へ置換された場合にのみ実施する。レビュー段階では開始しない。

- [ ] **Step 1: 本番対象の差分を再検証する**

  Run: `node "$v3Worktree/v2/tests/top-comp-contract.mjs"; node "$v3Worktree/v2/tests/v3-top-page-browser.mjs"; git -C $v3Worktree diff origin/main...HEAD --check`

  Expected: 本文正本の `requiredCopy` 全文、逐語の開示文、`IntersectionObserver` の `.fade-in` 発火、トークン化されたモノラインSVGアイコン、OGP・meta description・canonical、Chromium／Firefox／WebKitの横スクロールとナビゲーション、axe、モバイル・デスクトップのLighthouse 4指標がすべて受け入れ基準を満たす。

- [ ] **Step 2: 本番用ファイルと整理対象を限定して更新する**

  ルート `index.html` を承認済みv3 TOPで置換し、canonical／OGP／`sitemap.xml` を更新する。`index-v2.html` を削除し、旧 `codex/zatuneya-hp-v2` ブランチを削除する。対象を確認してから実行し、下層ページは変更しない。

- [ ] **Step 3: サブモジュール→親gitlink→公開→Obsidianの順で反映する**

  サブモジュールの本番コミットをpushしたあと、親リポジトリでgitlinkだけを含むコミットを作成してpushし、GitHub Pagesの公開状態を確認する。最後にObsidianの `01_Projects/zatuneya-hp/2026-08-30_v3-top-page-implementation.md` へ、実装範囲、テスト結果、両コミットhash、公開確認、外部診断実通信の未検証範囲、正式素材と匿名事例の確認根拠を記録する。

## レビュー実装時の報告に含める証拠

- 変更ファイル9件と、サブモジュールコミットhash・レビュー用push結果。親gitlinkコミット・親mainへのpush・公開確認は未実施であること。
- `top-comp-contract.mjs`、`v3-top-page-browser.mjs`、`verify-v2.mjs`のPASS出力。
- 375px / 768px / 1280px（および320px回帰幅）のスクリーンショット保存パスと、目視確認した項目。
- 最適化確認: インラインstyle、使い捨て`console.log`、`alert`/`confirm`/`prompt`、死にコード、秘密情報の全項目が問題なしだったこと。
- 外部診断アプリへの実通信は未検証であること、仮写真・匿名実績の差し替えが残ること、本番昇格条件が未充足であること。
