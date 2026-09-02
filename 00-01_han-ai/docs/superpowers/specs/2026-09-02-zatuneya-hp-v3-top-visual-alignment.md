# v3 TOP 視覚アライメント 指示書（カンプに寄せる）

- 日付: 2026-09-02
- 視覚の正本: `00-01_han-ai/design-comps/zatuneya-hp/v3-top-page-comp.png`（1枚に PC版＝左75%・SP版＝右25%）
- 文言の正本: `2026-08-30-zatuneya-hp-v3-top-page-copy.md`（**カンプ側の言い回しは非採用。コピーは正本の文言を維持**）
- 対象: `zatuneya-hp/v2/index.html` と `zatuneya-hp/v2/v3-top-page.css`（共通部の CSS 一本化は下層移行タスクの Task 3 と統合）
- 前提: DOM 契約・診断URL委譲・システムフォント・仮素材構造・契約テスト緑 は維持（Codex統合指示のガードレール参照）

現行 HTML は構造的にほぼカンプ準拠。差は「CSS の意匠・余白・連結表現」と「数か所の HTML 微修正」。以下を実施する。

---

## A. HTML の微修正（`v2/index.html`）

| # | 箇所 | 現行 | 修正 |
|---|---|---|---|
| A1 | Hero h1（L40） | `<h1 id="hero-title">AIを入れることより、仕事がよくなることから。</h1>` | 読点で改行を固定：`AIを入れることより、<br>仕事がよくなることから。`（CSS 側でも `text-wrap: balance` と最大幅で単語途中折れを防止） |
| A2 | 強みの人物画像（L103） | `src="./assets/profile-portrait-2.jpg"`（v1由来の色鉛筆風イラスト＝「中小企業の底力をアップデート」の文字が焼き込まれている） | 中立のグレー・プレースホルダに差し替え。新規 `assets/representative-portrait-placeholder.jpg`（またはCSSで `background: var(--ph)` の空figure）。カンプはモノクロ写真の頭像。**正式素材はユーザー提供後に src だけ差し替え**（data-asset-role="representative-portrait" は維持） |
| A3 | 実績セクションの装飾写真（L107） | `<figure class="cases-figure">…band-training.jpg…</figure>` | **削除**。カンプの実績は3カードのみ（見出し＋開示文＋3カード＋「ほかの事例を見る」） |
| A4 | 最終CTA の写真（L124） | `<figure class="final-cta__image">…band-together.jpg…</figure>` | **削除**。カンプの最終CTAは写真なしの濃ティール単色帯 |
| A5 | 3サービスカード（L88-90） | 各 `service-card` に画像なし | 各カード先頭に `<figure class="service-card__media v3-media"><img data-asset-role="service-…" alt="…" loading="lazy"></figure>` を追加（仮素材：`assets/band-training.jpg`／`band-onsite.jpg`／`band-together.jpg` を割り当て。カンプは各カード上部に写真） |
| A6 | 業務変革屋の仕事の写真（L61） | `value-figure`（hero-photo.jpg） | 残すが CSS で小さめ・セクション右上に配置（カンプ準拠）。画像交換で成立する構造は維持 |

A2/A3/A4/A5 で画像を増減した場合、`v2/tests/top-comp-contract.mjs` の `data-asset-role` 画像個数の assert と `v2/tests/verify-v2.mjs` のローカル参照存在チェックを同PRで更新する。

---

## B. CSS（`v2/v3-top-page.css`）をカンプに寄せる

### B0. 共通カードコンポーネント（最重要）
カンプは全セクションで一貫した白カード。現行は枠が薄い/無く詰まっている。次を基準に統一：

```
.problem-card, .service-card, .case-card, .tool-card, .value-pillar {
  background: #fff;
  border: 1px solid var(--card-line, #E1EEF0);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 2px rgba(23,63,70,.04);
}
```
- アイコン（`.v3-line-icon`）は径 40px、stroke ティール（`#5BBDC8` 系）、stroke-width 2、round cap/join で統一。
- カード見出し `h3` は 16–18px / bold、本文 14px / line-height 1.7、色は本文トークン。

### B1. セクション余白リズム
- PC：セクション上下 `padding-block: 96px`（章間が広い）。見出し `.section-title` と本文の間 24–32px、本文とグリッドの間 40px。
- SP：`padding-block: 56–64px`、コンテナ左右 20px。
- `.section-title` は中央寄せ、フォント 28–34px（明朝）、下に短いティールのアンダーライン（カンプの見出し装飾）。

### B2. Hero（`#hero`）
- PC：2カラム `grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr)`、`gap: 48px`、`align-items: center`、`min-height: 520–560px`。
- h1：42–52px、明朝、`line-height: 1.35`、`text-wrap: balance`、`max-width: 18em`。em の下にマーカー風の帯は付けない（カンプは素）。
- 写真 `.v3-media--hero`：`aspect-ratio: 967 / 780`、`border-radius: 16px`、`object-fit: cover`。カンプは付箋の載った机の俯瞰が主役なので大きく見せる（右カラムいっぱい）。
- 地域拠点のマイクロコピー（`.v3-microcopy` / L43）は、カンプでは写真の下に小さな情報カード（ティール枠・アイコン付き）として置かれている。`.hero-locale-note { border: 1px solid var(--teal-line); border-radius: 10px; padding: 12px 16px; display: flex; gap: 8px; }` にして写真下 or CTA下に。
- CTA 行：主＝オレンジ塗り（`--orange-ink` 文字）、従＝白地＋ティール枠。SP は縦積み・全幅。

### B3. お悩み（`#problems`）
- PC：`.problem-grid { grid-template-columns: repeat(4, 1fr); gap: 20px; }`。SP：2列 →（375px）1列。
- 各カード：アイコン → h3 → 1–2行。B0 のカード意匠。
- `.section-closing`（「どれも、ツールを増やせば…」）はグリッド下に中央寄せ・やや大きめ。

### B4. 業務変革屋の仕事（`#value`）
- PC：見出し＋リード（左）／写真（右上・`aspect-ratio: 16/10`・角丸・幅 40% 程度）／その下に3ピラー横並び `repeat(3, 1fr)`。
- ピラー：`<span>01</span>` はティールの丸数字（28px 円・白文字 or ティール文字）、h3、本文。B0 準拠。

### B5. 成長段階（`#growth`）
- カンプは「知る → わかる → できる → 教える → 内製化」を**連結した5ステップ**。
- PC：`.growth-steps { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; }`、各 `li` の間に `>` を `::after`（`content: "›"`、絶対配置 or flex）で連結。各 `li` は薄ティール地の小カード、`strong`（段階名・ティール）＋ `span`（説明・小）。
- SP：縦1列、左に番号バッジ、`>` は下向き。

### B6. 主力パッケージ（`#package`）― カンプで最も主役
- セクション全体を**枠つきパネル**に：`.package-layout { border: 1px solid var(--teal); border-radius: 16px; background: var(--ground, #EFF4F5); padding: 40px; }`。
- 写真 `.package-figure` は**インセット**（幅 40–45%・右上・角丸）。現行のように支配させない。
- `.package-price`（「AI経営改善パッケージ ／ 360,000円（3か月）」）は見出し直下で目立たせる（ティール太字・18–20px、360,000円は Roboto）。
- `.package-detail { grid-template-columns: repeat(3, 1fr); gap: 24px; }`。各 `.package-column` は白カード（B0）、h3＝ティール小見出し、`.package-steps li` は `STEP 1｜` を太字、`ul li` は `::before` にティールのチェック。
- 末尾のオレンジ CTA「パッケージの内容をくわしく見る」は右寄せ or 中央、目立つ塗り。

### B7. 3サービス（`#services`）
- PC：`.service-grid { grid-template-columns: repeat(3, 1fr); gap: 24px; }`。SP：1列。
- 各 `.service-card`：A5 の写真（上・`aspect-ratio: 16/10`・角丸）→ `01` 番号 → h3 → lead → 「向いている場面」→ 価格 → text-link。B0 準拠。

### B8. 支援の進め方（`#journey`）
- カンプは**円形アイコン5個を `>` で連結した横並び**（ラベル＋1行）。薄い地の帯の上。
- PC：`.journey-steps { display: grid; grid-template-columns: repeat(5, 1fr); }`、各 `li` はアイコン円（56–64px・ティール枠・中にモノラインSVG）→ `strong`（工程名）→ `span`（説明）。`li` 間に `>` を `::after`。
- 現行の `strong` は「無料診断｜」と縦棒付き。カンプに合わせ縦棒は外し、工程名のみ太字＋改行して説明。
- SP：縦1列、番号 or アイコンを左、`>` は省略 or 下向き。

### B9. なぜざつね屋か（`#why-us`）
- カンプ：左に**モノクロ写真の頭像**（`aspect-ratio: 4/5`・角丸・グレースケール気味）＋「代表プロフィール」ラベル・氏名・短文、右に「ざつね屋の強み」見出し＋強み3点（アイコン＋h3＋1行）。
- 現行 `why-us-layout` は copy(左)＋representative-card(右)。**左右を入れ替え**：`grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr)`、1列目＝`representative-card`、2列目＝`why-us-copy`。
- `representative-card img`：`filter: grayscale(1) contrast(1.02)`（正式写真が来たら外すか判断）、`aspect-ratio: 4/5`、`object-fit: cover`、`border-radius: 12px`。
- `why-us-points article`：アイコン（左）＋ h3 ＋ 1行。B0 のカードにせず、区切り線 or 余白で3項目を並べる（カンプは枠なしの箇条）。

### B10. 実績（`#cases`）
- A3 で装飾写真を削除済み。
- `.case-grid { grid-template-columns: repeat(3, 1fr); gap: 24px; }`。各 `.case-card` は B0 の白カード、上部に小さな建物アイコン（モノライン）、`<span>` の見出し（業種・規模）を太字、続く本文2行。カンプのタグ（「業務整理・仕組み化」等）は現状コピーに無いので追加しない。
- `.v3-case-disclosure`（開示文）は見出し直下、`font-size: 13px`、`color: var(--muted)`、`background: var(--warn-soft)` の細い帯でも可。

### B11. 無料ツール（`#tools`）
- `.tool-grid { grid-template-columns: repeat(2, 1fr); gap: 24px; }`。各カードは B0、アイコン → h3 →説明 → ボタン（診断＝オレンジ塗り＝`data-diagnosis-link` 委譲のまま、ライブラリ＝白地ティール枠）。

### B12. FAQ（`#faq`）
- カンプ：Q 行がアコーディオン、`+` の開閉記号。`.faq-item` は下罫線区切り、`.faq-trigger` は左に Q. ・右に `+`/`−`（`aria-expanded` と同期。JS は既存 nav.js が持つ想定＝変更不可なら CSS の `[aria-expanded="true"]` で記号切替）。タップ行 44px 以上。
- PC は1カラム（`faq-layout` の2カラムは廃止 or 見出し左・リスト右でも可、カンプは縦1列）。

### B13. 最終CTA（`#final-cta`）
- A4 で写真削除済み。
- `.final-cta { background: var(--ink, #173F46); color: #fff; padding-block: 64px; }`、`.final-cta__inner` は中央寄せ、h2（白・明朝）＋本文（白 82%）＋ CTA 2つ（主＝オレンジ塗り＝`data-diagnosis-link`、従＝白枠 `--inverse`）。オレンジ地×白文字は使わない（オレンジボタンの文字は `--orange-ink`）。

### B14. ヘッダー / フッター / スティッキーCTA
- カンプのヘッダー：ロゴ左（アイコン＋「ざつね屋」＋小さく肩書）、ナビ中央〜右、右端にオレンジ「無料で診断する」＋「お問い合わせ」。現行の並び（トップ/サービス/知る▼/無料診断/無料で相談する）はカンプと概ね一致。オレンジ CTA を pill・強調に。
- フッター：濃ティール地、ロゴ＋肩書、サイトマップ、`© 2026 ざつね屋`。カンプ準拠。
- スティッキーCTA：画面下・濃ティール地・「まずは無料診断から」＋「診断する」＋×。カンプの SP 版に合わせる。`#sticky-cta` / `#sticky-cta-close` の DOM は維持。

---

## C. 受け入れ（Claude Code が完成PRで確認）
1. `v3-top-page-comp.png` の PC版↔1280px / SP版↔375px と、構図・カード意匠・余白リズム・写真の扱い（枠の有無・サイズ）が一致
2. 本文・見出し・セクション順が top-page-copy.md と逐語一致（アライメントで崩していない）
3. DOM契約・診断URL委譲・システムフォント・仮素材構造 維持
4. 追加/削除した画像に合わせ `top-comp-contract.mjs` / `verify-v2.mjs` の該当 assert を更新、QAスイート全緑（qa-axe 違反0／qa-lighthouse 4指標90+）
5. インラインstyle・絵文字・alert系・死にコードゼロ、`© 2026 ざつね屋`
6. 本番未昇格（ルート index.html 未変更）
