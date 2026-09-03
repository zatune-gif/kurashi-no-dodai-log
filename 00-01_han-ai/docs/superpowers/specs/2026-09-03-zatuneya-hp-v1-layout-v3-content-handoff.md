# 引き継ぎ：ざつね屋HP v1 の構図を維持し、掲載情報だけを v3 に合わせる

- 日付: 2026-09-03
- 状態: v3（業務変革屋のフルデザイン・zatuneya-hp/v2/）は**凍結**。代わりに v1 本番の構図のまま情報を v3 化する
- 実施: 別セッション（sonnet-worker 中心）

---

## 背景と方針

- 業務変革屋のフルデザイン（`zatuneya-hp/v2/` の v3。PR #1〜#3 マージ済み・`/v2/` で公開）は一旦凍結。
  `/v2/`・`index-v2.html`・`codex/v3-*` ブランチはそのまま残す（削除も本番昇格もしない）。
- 代わりに、現行本番サイト（`zatuneya-hp` のルート＝v1）の**レイアウト・デザイン・コンポーネント・スタイルは変えず、
  掲載情報だけを v3 の確定内容へ差し替える**。
- リポジトリ: git サブモジュール `zatuneya-hp`（github.com/zatune-gif/zatuneya-hp）。親 `kurashi-no-dodai-log` の
  `00-01_han-ai/zatuneya-hp`。公開 `https://zatune-gif.github.io/zatuneya-hp/`。
- `zatuneya-hp/AGENTS.md` を正本ルールとして遵守（大規模変更は `codex/...` ブランチ＋PR、二段階Git同期、検証、Obsidian記録）。

## セッション開始時

1. `zatuneya-hp` ルートの全ページを棚卸し（`index.html` / `services.html` / `service-*.html` / `profile.html` /
   `works.html` / `faq.html` / `contact.html` / `privacy.html` / `tokusho.html` / `thank-you.html` / `404.html` /
   `style.css` / `nav.js` / `sitemap.xml` / `robots.txt`）。`/v2/` 配下は対象外。
2. v3 の確定内容の正本を読む：
   - `00-01_han-ai/docs/superpowers/specs/2026-08-30-zatuneya-hp-v3-henkakuya-design.md`（§2 ブランド確定事項）
   - `00-01_han-ai/docs/superpowers/specs/2026-08-30-zatuneya-hp-v3-top-page-copy.md`（対外文言）
   - `00-01_han-ai/docs/superpowers/specs/2026-08-30-zatuneya-hp-v3-downstream-13-14-training-proposal.md`（研修/価格の確定方針）
   - Obsidian `01_Projects/zatuneya-hp/HP-v3-要件定義_2026-08-30.md`（決定事項1〜19）
   - メモリ `project_zatuneya_hp.md` / `project_revenue_standard.md`
3. 各ページの「現状 → 変更後 → 根拠」の変更点リストを作り、ユーザー承認を得てから編集。

## 掲載情報を v3 に合わせる（内容の差し替え。見た目・レイアウトは触らない）

1. **呼称**: 屋号ざつね屋 ＋ 肩書「地域企業の小さな業務変革屋」を併記。著作権表記は「© 2026 ざつね屋」
2. **キャッチ/H1**: v1 の見出しコンポーネントはそのままに、メッセージを「AIを入れることより、仕事がよくなることから。」系へ。
   ポジショニングは「AI活用支援」ではなく「地域企業の困りごと起点の業務変革の伴走」。事業説明も top-page-copy.md のトーンに
3. **ターゲット**: 数十名規模の地域企業の管理職・実務責任者。農業・移住は一切載せない
4. **サービス構成**: 3サービス＝AI実務研修／個別業務設計（旧オーダーメイド）／AI活用伴走。
   主力＝AI経営改善パッケージ 360,000円／3か月（常時表示）。旧「4サービス」表記があれば3へ
5. **研修**: 6コース体系。対外表示は確定分のみ（①5名60,000円〜／⑥個別80,000円・グループ180,000円／
   10時間パッケージ 400,000〜560,000円）、②〜⑤は「お問い合わせ」。10hパッケージ内訳は約570分（①②③④＋⑥）
6. **モニター割引**: 対外表記は削除。低額入口（無料診断→小さなお試し改善）に置換。入口商品の価格は当面未表示
7. **助成金**: 一切載せない（「助成金75%」の打ち消し価格・帯グラフ・注記・FAQ を全撤去）
8. **経歴**: 業種を出さず「現場でのデジタル化推進経験」。補助金申請書作成支援の経験は添えてよい。
   「製造業のDX」「トヨタグループ」は使わない。固有名「豊高組」も対外物では出さない
9. **実績**: 匿名（業種・規模・成果のみ）。固有名・克明にできない数値は不可。元ネタはユーザー保留中なので、
   当面は「業種・規模・やったこと」の匿名プレースホルダ＋「事実確認済みの事例に差し替え予定」の一文
10. **氏名・連絡先**: 大音 晃司（おおと こうじ）／ zatuneya@gmail.com ／ お問い合わせは既存フォーム維持
11. **診断ツールへのリンク/CTA**: すべて `https://ai-shindan-zatuneya.netlify.app/` に統一
    （旧 `han-ai-diagnosis.netlify.app` は実測404。使わない）。最終URLは独自ドメイン取得時に確定予定
12. **内部数値（月商・年商）**は対外ページに出さない。既に出ていれば削除
13. **sitemap.xml / robots.txt**: 綴り誤り（`tokusyou.html`→`tokusho.html`）や欠落ページがあれば修正。
    canonical は現行ドメインのまま（本番切替はしない）

## 変えないもの（v1 の資産を維持）

- レイアウト・グリッド・余白・コンポーネント（ヒーローのチップ、サービスカード、CVパネル、WHYバンド、フロー結線 等）、
  `style.css` のデザイントークン、フォント（v1 が Google Fonts を使っているなら維持。
  ※ v2/v3 の「Webフォント廃止」方針は `/v2/` 側の話で、ここでは適用しない）
- `nav.js` の DOM 契約（`#nav-hamburger` / `#site-nav` / `.site-nav__*` / `#sticky-cta` 等・あれば）
- 各ページの固有 `<style>`／固有 CSS の構造。インライン style は増やさない
- `privacy.html` / `tokusho.html` の法務文言（氏名・所在地・連絡先以外は創作しない）
- ルート `index.html` の役割（本番 TOP）。`/v2/` には手を出さない

## 検証（AGENTS.md 準拠）

- 変更した各ページを幅 375 / 768 / 1280px でスクリーンショット（表崩れ・横スクロールなし）
- 内部リンク切れなし、旧 `han-ai-diagnosis.netlify.app` 参照ゼロ、助成金関連の語ゼロ、「農業」「福山」「移住」ゼロ、
  著作権年、canonical/OGP
- axe（重大違反0）。Lighthouse は index＋変更ページで測れれば測る
- `git diff --check`

## コミット・Git

- `zatuneya-hp` の `codex/v1-v3-content`（等）ブランチで作業、1本の PR（base=main、merge しない）
- Claude Code が差分・検証を確認して統合。マージ後に親リポジトリの gitlink を単独コミットで更新
- 親リポジトリ側のドキュメント更新（記録）は別コミット、gitlink と混ぜない

## 進め方

1. ページ棚卸し＋正本読了 → 2. ページ別 変更点リスト → 3. ユーザー承認 → 4. 編集 →
5. 幅3種スクショで確認 → 6. リンク/禁止語チェック → 7. PR → 8. Claude Code レビュー → マージ → 親gitlink更新 → Obsidian記録

## モデル

複数ページ横断の内容差し替え・整合は sonnet-worker で十分。法務文言や不可逆判断が絡む箇所のみユーザー確認。
