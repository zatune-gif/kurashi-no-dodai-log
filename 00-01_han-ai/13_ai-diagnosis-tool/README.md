# AI活用準備度診断ツール（ざつね屋）

地域企業のAI活用支援サービス（ざつね屋「地域企業の小さな業務変革屋」）の入口となる診断ツール群。
本番は Netlify で配信する。当面の公開URLは `https://ai-shindan-zatuneya.netlify.app/`。
最終URLはレンタルサーバ契約・独自ドメイン取得の時点で確定し、その際に下記「ドメイン確定時の再置換対象」を一括で差し替える。

## ページ構成

| ファイル | 役割 | 対応JS |
|---|---|---|
| `diagnosis-simple.html` | 簡易診断（12問・約3〜5分・無料） | `diagnosis-simple.js` + `utils.js` |
| `detail.html` | 詳細診断（23問・約7分）＋ プロンプトライブラリ／サービス提案表示 | `detail.js` + `utils.js` |
| `request.html` | 資料請求フォーム | `request.js` + `utils.js` |
| `estimate.html` | 見積請求フォーム | `estimate.js` + `utils.js` |
| `prices.html` | 料金案内 | `prices.css`（専用スタイル） |
| `curriculum.html` | 研修カリキュラム タイムスケジュール | なし（静的ページ） |
| `index.html` | **リダイレクト専用スタブ**。`diagnosis-simple.html` へ即時転送 | なし |

`style.css` / `detail.css` は複数ページで共有する共通スタイル。`utils.js` は共有ユーティリティ関数。

## なぜ `index.html` がリダイレクトなのか

以前は簡易診断本体が `index.html` という名前だったが、`detail.html`（詳細診断）との対比で
「index = 簡易診断」という命名が第三者にとって分かりにくかったため、実体を `diagnosis-simple.html`
にリネームした（2026-07-04）。ただし `.../13_ai-diagnosis-tool/` というフォルダ直下URLは既に
TOPページ・研修時の口頭案内等で使われているため、後方互換のために `index.html` を薄い
リダイレクトスタブとして残している。

**新規にリンクを追加する場合は、必ず `diagnosis-simple.html` を直接指すこと。**
`index.html` 経由のリダイレクトは互換性維持のためだけに存在し、恒久的な参照先ではない。

## 画面遷移（詳細診断のモード）

`sessionStorage` の `zatune_mode` で遷移元を判定し、`detail.html` の挙動を切り替える。

| モード | 遷移元 | 挙動 |
|---|---|---|
| `inquiry` | `request.html`（資料請求から詳細診断へ進んだ場合） | サービス提案 → 相談CTA |
| `estimate` | `estimate.html` | 見積3パターン選択 → 見積請求 |
| `standalone` | `detail.html` へ直接アクセス | `inquiry` と同じ挙動 |

## バックエンド

`netlify/functions/` 配下（`save-inquiry.js` / `generate-comment.js` / `generate-library.js`）は
Netlify Functions。本番（Netlify）で稼働する。GitHub Pages 等 Functions が動かない環境では
フォールバック表示（`detail.js` の `FALLBACK_*` / `diagnosis-simple.js` の固定コメント）で吸収する。

- `save-inquiry.js`: 問い合わせを Google Sheets へ追記し、申込者・オーナーへメール送信する。
  自動返信メールに載せる診断ツールURL（`SITE_URL`）は環境変数フォールバック方式
  （`process.env.SITE_URL || process.env.URL || 'https://ai-shindan-zatuneya.netlify.app'`）。
  Netlify は本番URLを `process.env.URL` に自動注入するため、通常は追加設定不要。
- `generate-library.js` / `generate-comment.js`: Anthropic API を呼び、プロンプトライブラリ・
  推奨アクションを生成する。`ANTHROPIC_API_KEY` が必要。

## 研修コース体系

研修は全6コース（⑤＝AI活用ルール運用定着編／⑥＝Claude Code 特化）。
`curriculum.html` が6コース体系の正。②〜⑤は対外価格を非公開とし、`prices.html`・`detail.html` の
見積プルダウン・推薦では「要お問い合わせ」表示（見積計算には載せない）。

## ドメイン確定時の再置換対象

独自ドメイン取得時に、以下の当面URL（`https://ai-shindan-zatuneya.netlify.app`）を最終URLへ一括置換する。

| 対象 | 箇所 |
|---|---|
| 各HTMLの `<link rel="canonical">` | `diagnosis-simple.html` / `detail.html` / `curriculum.html` / `prices.html` / `estimate.html` / `request.html` / `index.html` の `<head>` |
| `sitemap.xml` | 全 `<loc>`（6件） |
| `robots.txt` | `Sitemap:` 行 |
| `netlify/functions/save-inquiry.js` | `SITE_URL` のフォールバック既定値（`process.env` 未設定時のみ効く） |
| 本 README | 冒頭の公開URL記述・本節 |

※ 14番（提案書生成アプリ）側の診断URL参照は 14番リポジトリ側の別チェックリストで管理する。
