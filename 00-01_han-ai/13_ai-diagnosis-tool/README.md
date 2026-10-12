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

`netlify/functions/` 配下の3ファイル（`save-inquiry.mjs` / `generate-comment.mjs` / `generate-library.mjs`）は
Netlify Functions（現行形式：Web 標準の Request / Response）。処理本体は `netlify/lib/` にある。
本番（Netlify）で稼働する。GitHub Pages 等 Functions が動かない環境では
フォールバック表示（`detail.js` の `FALLBACK_*` / `diagnosis-simple.js` の固定コメント）で吸収する。
ただし GitHub Pages では問い合わせ（save-inquiry）は保存もメール送信もされない。問い合わせの受付は必ず Netlify の URL で行うこと。

| 画面から呼ぶ URL | 役割 | 使うサービス |
|---|---|---|
| `POST /api/save-inquiry` | 問い合わせを Google Sheets へ追記し、担当者通知と申込者への自動返信メールを送る | Google Sheets API・Gmail（nodemailer） |
| `POST /api/generate-comment` | 簡易診断の推奨アクション3件を生成 | Anthropic API（既定 `claude-haiku-5-5`） |
| `POST /api/generate-library` | 詳細診断のプロンプトライブラリ・推奨アクション・サービス推薦を生成 | Anthropic API（既定 `claude-sonnet-5-5`） |

以前の `/.netlify/functions/...` の URL は使えなくなった（レート制限の設定に独自パスが必要なため `/api/...` に変更）。

応答は `{ ok: true, data }` または `{ ok: false, error: { code, message, detail } }` の形式。
`error.code` が原因の識別子（例：`RATE_LIMITED`・`UPSTREAM_OVERLOADED`・`ANTHROPIC_AUTH`・`SHEET_FORBIDDEN`・`MAIL_AUTH`）。
Netlify の関数ログには、エラー発生時に `{ fn, event, code, detail, at }` の1行 JSON が出る（API キー・入力内容は出さない）。

### 環境変数（Netlify の Site configuration → Environment variables）

| 名前 | 必須 | 内容 |
|---|---|---|
| `ANTHROPIC_API_KEY` | 必須 | Anthropic API キー（generate-comment / generate-library） |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | 必須 | サービスアカウントの JSON 全文（save-inquiry） |
| `GOOGLE_SHEET_ID` | 必須 | 書き込み先スプレッドシートの ID。タブ名は「問い合わせ一覧」固定 |
| `GMAIL_USER` / `GMAIL_APP_PASSWORD` | 必須 | 送信に使う Gmail アドレスとアプリパスワード |
| `SITE_URL` | 任意 | 自動返信メールの署名に載せる診断ツール URL。未設定なら Netlify が注入する `URL`、それも無ければ `https://ai-shindan-zatuneya.netlify.app` |
| `ANTHROPIC_MODEL_COMMENT` / `ANTHROPIC_MODEL_LIBRARY` | 任意 | 使うモデルを差し替える（コード変更なしで戻せる）。未設定なら既定値 |
| `ANTHROPIC_TIMEOUT_MS` | 任意 | generate-library の AI 応答待ち上限（ミリ秒、既定 55000） |

### 悪用・連続呼び出しへの対策

外部から誰でも叩ける URL なので、次を入れている。

| 対策 | 内容 |
|---|---|
| Netlify のレート制限 | `generate-library` と `save-inquiry` の `config.rateLimit`：同一 IP から 60 秒に 10 回まで。超えると Netlify が 429 を返す。`generate-comment` は1回あたりの費用が小さいため Netlify 側の制限は付けず、関数内の制限のみ（Netlify の無料プランは関数のレート制限ルールが 2 件までのため） |
| 関数内の制限（補助） | 同一 IP：10 分あたり generate-library 20 回・generate-comment 40 回・save-inquiry 20 回。全体：1 時間あたり 300 / 1000 / 200 回。save-inquiry は同じメールアドレス宛てを 1 時間 3 回まで。関数インスタンスごとのメモリで数えるため、Netlify のレート制限の補助として働く。制限に達した場合は Claude API を呼ばない |
| 入力の検証 | 項目ごとの型・文字数・件数の上限、本文サイズ上限（16〜32KB）、問い合わせ種別の許可リスト。メール宛先は 1 件だけを許可し（カンマ区切り・改行を拒否）、メール送信の踏み台化を防ぐ |
| ハニーポット | 画面に見えない項目（`website`）が埋まっていれば何も処理しない |

研修会場など同じ回線から多数が同時に使う場合に上限へ達するときは、`netlify/lib/*.mjs` の `createRateLimiter` の値と各 `netlify/functions/*.mjs` の `rateLimit` を調整する。

### 開発・テスト

- Node.js は 22 以上（`netlify.toml` では 24 を指定）。依存：`@anthropic-ai/sdk` 0.133 / `googleapis` 185 / `nodemailer` 10。
- `npm install` のあと `npm test`：外部サービスと通信しない最小テスト（手元の模擬サーバー含む）を実行する。

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
| `netlify/lib/save-inquiry.mjs` | `SITE_URL` のフォールバック既定値（環境変数未設定時のみ効く） |
| 本 README | 冒頭の公開URL記述・本節 |

※ 14番（提案書生成アプリ）側の診断URL参照は 14番リポジトリ側の別チェックリストで管理する。
