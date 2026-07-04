# AI活用準備度診断ツール（ざつね屋）

中小企業向けAI活用支援サービスの入口となる診断ツール群。GitHub Pages（仮公開）で配信。

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
Netlify Functions。GitHub Pages仮公開中は動作しない（フォールバック表示で吸収）。本公開時に
Netlifyへ切り戻して稼働する。
