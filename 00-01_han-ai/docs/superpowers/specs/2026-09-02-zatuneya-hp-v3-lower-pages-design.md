# ざつね屋HP v3 下層ページ移行・新設ページ 確定設計

> **状態：設計確定・実装禁止。** この文書は、ユーザー承認済みの案1を実装へ渡すための正本である。ここに書かれていない表示変更、公開切替、素材の推測による補完は行わない。

## 1. 承認案1と作業単位

### コミット境界

| 項目 | 実施場所 | ブランチとレビュー単位 | gitlinkの扱い |
| --- | --- | --- | --- |
| 1. この確定設計文書 | 親リポジトリ | `main`へ直接コミット | 変更を混在させない |
| 2. 既存13下層ページのv3共通部移行 | `zatuneya-hp` submodule | 新しい`codex/` branch、1本のPull Request | 親リポジトリでは変更しない |
| 3. `growth.html`と`tools.html`の新設、TOP CTA復活、テスト | `zatuneya-hp` submodule | 項目2と同じbranch・同じPull Request | 親リポジトリでは変更しない |
| 4. 承認済み設計の記録・レビュー結果の反映 | 親リポジトリ | `main`へ直接コミット | 変更を混在させない |

親リポジトリの項目1と項目4にsubmoduleのgitlink更新を混在させない。submoduleの変更は項目2と項目3を一つのPull Requestにまとめ、レビュー完了前にmergeしない。親リポジトリのgitlink更新、公開切替、旧branch削除は、この設計の実装範囲に含めない。

## 2. 対象と非目標

### 対象

- `v2/404.html`、`v2/contact.html`、`v2/faq.html`、`v2/privacy.html`、`v2/profile.html`、`v2/service-banso.html`、`v2/service-management.html`、`v2/service-order.html`、`v2/service-training.html`、`v2/services.html`、`v2/thank-you.html`、`v2/tokusho.html`、`v2/works.html`の13ページ。
- `v2/growth.html`と`v2/tools.html`の新設。
- V3 TOPと同じ共通ヘッダー、共通フッター、ナビゲーション、追従スティッキーCTAの移行。
- 既存V3 TOPの承認済みCTAを、リンク先作成後に復活させること。
- `v2/index.html`を含む15ページが、共通CSSとして`v2/top-comp.css`を読む構成へ統一すること。

### 非目標

- 13ページの本文、サービス内容、法務文言、事例文、既存の固有レイアウトを変更しない。
- 13ページの固有CSSをV3共通スタイルへ統合・削除・置換しない。
- ルートの`index.html`への本番昇格、`index-v2.html`削除、canonical・OGP・sitemapの本番切替を行わない。
- 外部診断サービスへの実通信、診断結果、外部遷移先の稼働を検証対象にしない。
- 承認カンプがない状態で写真・画像の配置を推測して変更しない。

## 3. 共通部の移行契約

13ページの本文DOMとページ固有CSSは維持する。変更してよい範囲は、各ページの`<head>`、共通ヘッダー、共通フッター、ナビゲーション、追従スティッキーCTA、およびそれらを支える共通CSS・JavaScriptだけである。

- 共通ヘッダーはV3 TOPのブランド、主要導線、モバイルメニュー、キーボード操作、フォーカス表示の契約に揃える。
- 共通フッターはV3 TOPの色・リンク構成・著作権表記の契約に揃える。
- `nav.js`は、モバイルメニュー、ドロップダウン、追従CTAの閉じる操作、再表示抑止を既存V3 TOPと同じ契約で扱う。
- 追従スティッキーCTAは、本文を覆わず、閉じるボタンを持ち、モバイル・タブレット・デスクトップで操作可能にする。
- 共有トークンは`top-comp.css`の濃ティール`#173F46`、ティール`#5BBDC8`、オレンジ`#F8981D`、地色`#EFF4F5`を使用する。オレンジ背景に白文字を常用しない。
- 共通CSSは`v2/top-comp.css`だけに一本化する。15ページ共通のトークン、リセット、コンテナ、skip link、header、footer、nav、ドロップダウン、V3共通ボタン、追従スティッキーCTA、レスポンシブ共通規則はここに置く。
- `v2/index.html`は`./top-comp.css`を先に読み、続けて`./v3-top-page.css`を読む。これはTOPを下層と同じ共通UI契約へ再ポイントする変更であり、TOP本文を下層用意匠へ戻す変更ではない。
- `v2/v3-top-page.css`はTOP本文専用に限定する。`:root`、`.comp-wrap`、`.skip-link`、`.comp-header`、`.header-inner`、`.brand`、`.comp-nav`、`.site-nav__*`、`.v3-button*`、`.sticky-cta*`、`.comp-footer`、`.footer-row`、それらのレスポンシブ定義を重複して持たない。
- ページ固有CSSと`v3-top-page.css`は、本文の余白、カード、表、フォーム、法務表示、サービス詳細、TOP本文の意匠だけを持つ。共通セレクタを再定義しない。

## 4. 診断URLとCTAの契約

全15ページ（既存13ページと新設2ページ）の`<head>`に、次のmetaタグを**ちょうど1個**置く。

```html
<meta name="zatuneya:diagnosis-url" content="https://ai-shindan-zatuneya.netlify.app/">
```

AI活用準備度診断へ向かうすべてのアンカーは、URLを直書きせず、次の属性で`nav.js`に委譲する。

```html
<a data-diagnosis-link aria-disabled="true">無料でAI活用準備度を診断する</a>
```

`nav.js`はmeta値をHTTPS URLとして検証した後だけ`href`を設定する。相談・お問い合わせ導線は診断CTAではないため、`contact.html`を維持する。既存13ページの旧URL `https://han-ai-diagnosis.netlify.app/` は、この移行対象の診断導線から除去する。

診断アンカーをページ本文、ヘッダー、フッター、追従CTAのどこに置くかは問わない。診断アンカーだけを`data-diagnosis-link`へ置換することは、本文DOM維持の許容例外である。本文の文言、順序、カード・表・フォーム・法務表示の構造を変えることは許容しない。

この当面URLは各HTMLで同じ一値を持つ。サイト全体でmetaを一つのファイルへ集約する変更は本作業に含めないため、URL変更時は全15ページを同一レビュー単位で更新し、値の不一致を契約テストで失敗させる。

## 5. growth.html と tools.html の正本

### growth.html

本文の正本は `docs/superpowers/specs/2026-08-30-zatuneya-hp-v3-top-page-copy.md` の「4. 成長段階の地図」である。

- 見出しは「知っている」から「自分たちで回せる」まで。
- 5段階は、知る、わかる、できる、教える、内製化の順序と説明を変えない。
- TOPで復活するCTAは「成長段階の考え方をくわしく見る」であり、遷移先は`./growth.html`とする。

### tools.html

本文の正本は同仕様書の「10. 無料で使えるツール」である。

- AI活用準備度診断は、診断URL契約に従う。
- プロンプトライブラリは `https://zatune-gif.github.io/kurashi-no-dodai-log/00-01_han-ai/15_prompt-library/` に遷移する。
- TOPで復活するCTAは「ツールの一覧を見る」であり、遷移先は`./tools.html`とする。

両ページは、`top-comp.css`、V3共通ヘッダー・フッター・`nav.js`を使い、本文だけを新しい用途限定CSSで構成する。サービス詳細、works/profile、faq/contact、法務ページの固有CSSを流用して内容を書き換えない。

## 6. テスト駆動の実装順序

1. `growth.html`、`tools.html`、13ページ共通部の期待DOMを検証する静的契約テストを先に追加し、未実装状態で失敗を確認する。
2. 15ページのmeta一意性、診断CTAの`data-diagnosis-link`属性、旧診断URL不在、header/footer/nav/sticky CTA、canonical、OGP、ローカルassets参照を静的契約へ追加する。
3. TOPの2 CTAについて、文言、`./growth.html`と`./tools.html`へのhref、リンク先存在を`top-comp-contract.mjs`で検証する。
4. 最小実装後に静的契約を通し、13ページの本文・固有CSS・既存URL参照が変更されていないことを差分レビューで確認する。
5. Chromium、Firefox、WebKitの各ブラウザで、375px、768px、1280pxの全幅を確認する。各新設ページでHTTP 200、横スクロールなし、モバイルメニュー、ドロップダウン、FAQがあるページの開閉、スティッキーCTAの閉じる操作を検証する。
6. axeでWCAG 2/2.1 A/AA違反0件、Lighthouseでperformance・accessibility・best-practices・SEOの全4指標90点以上を確認する。
7. `verify-v2.mjs`、既存の下層コンポーネント契約、下層13ページ×3幅のブラウザ回帰、`npm run qa`を全て再実行する。

## 7. 素材・本番昇格の禁止条件

- 元の承認カンプPNG `C:\Users\ooto\OneDrive\Desktop\Codex 画像 2026年8月30日 18_36_23.png` は現在不存在である。
- 元ファイルを取得できた場合だけ、`design-comps/zatuneya-hp/` に内容を表す安定名で保存する。再生成画像や推測した画像を承認カンプとして保存しない。
- 匿名実績がplaceholderのまま、またはHero以外の正式写真が未提供の間は、`/v2/` をルート`index.html`へ昇格しない。
- 承認PNGの再添付後に、デスクトップ・モバイルの厳密比較を行う。比較前に本番昇格、既存TOPの置換、`index-v2.html`削除を行わない。

## 8. 実装時の対象ファイル

### 新規

- `v2/growth.html`
- `v2/tools.html`
- `v2/growth-tools-comp.css`
- `v2/tests/lower-pages-v3-contract.mjs`
- `v2/tests/lower-pages-v3-browser.mjs`

### 更新

- `v2/index.html`
- `v2/404.html`
- `v2/contact.html`
- `v2/faq.html`
- `v2/privacy.html`
- `v2/profile.html`
- `v2/service-banso.html`
- `v2/service-management.html`
- `v2/service-order.html`
- `v2/service-training.html`
- `v2/services.html`
- `v2/thank-you.html`
- `v2/tokusho.html`
- `v2/works.html`
- `v2/top-comp.css`
- `v2/v3-top-page.css`
- `v2/tests/verify-v2.mjs`
- `v2/tests/top-comp-contract.mjs`
- `v2/tests/works-profile-comp-contract.mjs`
- `v2/tests/qa-cross-browser.mjs`
- `v2/tests/qa-axe.mjs`
- `v2/tests/qa-lighthouse.mjs`

上記13ページのHTML変更は、`<head>`、共通ヘッダー、共通フッター、ナビゲーション、追従スティッキーCTA、診断CTA属性に限る。ページ固有CSSは、本文・固有デザインを保持するため、差分レビューで変更理由を明示できる場合以外は変更しない。

`v2/nav.js`は、既存のHTTPS検証、`data-diagnosis-link`有効化、メニュー、ドロップダウン、スティッキーCTA、FAQの契約を満たすため、実装時の検証対象である。挙動を満たす現行実装は変更しない。

## 9. 自己レビュー結果

- 親リポジトリとsubmoduleの責務、branch、Pull Request、gitlink境界を分離した。
- 13ページ維持と共通部移行の範囲を分離した。
- 診断URLの当面値、各HTMLのmeta一意性、CTA属性、旧URL除去を明示した。
- `growth.html`と`tools.html`の本文正本、CTA文言、遷移先を明示した。
- TDD、全既存回帰、3ブラウザ・3幅、axe、Lighthouseの受入基準を明示した。
- 素材待ちと本番昇格禁止条件、非目標を明示した。
