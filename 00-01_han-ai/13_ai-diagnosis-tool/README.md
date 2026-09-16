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

## ローカル品質確認

Node.js 22以上を使用する。依存関係を `npm ci` で揃えた後、`npm test` を実行する。質問・点数・ステージ境界・料金表示・Functions送信先の静的契約に加え、375 / 768 / 1280px、Chromium / Firefox / WebKit、主要画面のaxe検査をまとめて確認する。ブラウザ検査中の生成コメントFunctionsはローカルで503応答へ置き換え、個人情報や回答を外部へ送信しない。

`qa:smtp` はNode標準のlocalhost SMTPサーバーへ実際にソケット接続し、申込者・オーナー向け2通のenvelope／本文、日本語の復号、254文字email、拒否応答、不正email時の接続0回を確認する。GmailやGoogle Sheetsへは接続せず、Gmail App Passwordの認証・From書換え・実到達性を確認するテストではない。

依存監査は `npm audit --omit=dev` でproduction依存を分けて確認する。major更新を要する指摘はFunctionsの実通信回帰を伴う別タスクとして扱い、`npm audit fix --force` は実行しない。

### 問い合わせメール入力ガード（PR #13）

`save-inquiry.js` は外部処理の前に、メールアドレスが文字列か、254文字以内か、単一の基本形式かを確認する。制御文字（CR/LFを含む）、表示名付き形式、複数宛先、連続ドット、不正なドメインラベルは400応答 `{ "ok": false, "error": "Invalid email" }` とし、Google Sheets・メール送信を呼ばない。

| 事前設計 | 今回の判断 |
|---|---|
| A-1 エラー対応 | JSON不正・必須項目不足は既存400を維持。メール形式不正だけを `Invalid email` の400として追加し、利用者が入力を修正できる分類にする。外部サービス由来エラーの扱いは変更しない。 |
| A-2 寿命 | セッション・認証情報・APIキーの寿命と更新方法は変更しない。入力検証は時刻に依存しない。 |
| A-3 配布経路 | feature branch → PRレビューまで。mainへのmergeとNetlify本番デプロイはこの作業に含めない。 |
| A-4 テスト | 正常形式、空、非文字列、255文字、CR/LF、複数宛先、表示名、不正形式、254文字境界を確認する。外部処理はテスト用関数へ差し替え、実通信・実送信を行わない。 |

結果画面の掲載文、価格・コース表記、診断質問・採点・ステージ境界は本ガードの対象外とし、公開前の本文確認でまとめて扱う。

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

### 公開前のNode／メール確認

- `package.json` はNode.js 22以上、`netlify.toml` はbuild Node 22を指定する。ただし、この2ファイルだけではNetlify Functionsの実行時Nodeを証明できない。
- Functions runtimeは通常build Nodeへ追随するが、Netlify UI／CLI／APIの `AWS_LAMBDA_JS_RUNTIME` で別設定にできる。公開前に同変数の有無、Deploy Previewのbuild log、Functionsの実行時証拠を個別に確認する。
- Gmail App Password認証、GmailによるFrom書換え、実配送、送信上限と、Google Sheetsへの実appendはローカルQAの対象外。権限のある本番確認で実施する。

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
