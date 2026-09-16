# AI診断メール依存更新 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 診断Functionsのメール送信仕様を変えず、Nodemailerのhigh脆弱性を解消するための承認可能な最小更新案を定める。

**Architecture:** `nodemailer 6.10.1 → 10.0.10` と、NetlifyのビルドNode `18 → 22` を一組で扱う。Google APIs系4件は別のmajor更新として保留し、秘密情報やGmailへ接続せずlocalhost SMTPで互換性を検証する。

**Tech Stack:** Netlify Functions (CommonJS), Node.js 22/24, Nodemailer 10.0.10, Node `net` localhost SMTP mock

---

## 現状と判断

- PR #13 HEAD `45f4dd9bacef00ac589a035eb175eb425f4fb977`、作業ツリーはクリーン。
- `npm audit --omit=dev` は5件（high 1 / moderate 4）。highは直接依存Nodemailer、moderate 4件はGoogle APIs系の推移依存。
- Nodemailer 10はNode.js 20以上が必須で、CommonJS `require()` を引き続き提供する。現行の `service: 'gmail'` + App Password方式も公式サポート範囲。
- Netlifyの `NODE_VERSION` はビルドNodeを指定する。Functionsは通常ビルドNodeに追随するが、`AWS_LAMBDA_JS_RUNTIME` がUI／CLI／API側に設定されていれば別ランタイムとなり、これは `netlify.toml` では設定できない。したがって、`netlify.toml` の変更だけをFunctions実行時Node 22の証拠にはしない。
- Google APIs系の修正は `googleapis 144 → 181` のmajor更新とNode 22以上を伴う。現行で確認した`uuid`経路は `v4()` のみで、該当GHSAの supplied-buffer を使う `v3/v5/v6` 経路ではないため、本変更には混ぜない。

## 外部連携の事前設計（A-1〜A-4）

| 表 | 今回の決定 |
|---|---|
| A-1 エラー | 入力不正400は現状維持。localhost SMTPの接続／SMTP応答失敗はテストをFAILさせる。Gmail `EAUTH`、送信制限、Netlify runtime不一致は実環境確認事項とし、自動リトライを追加しない。 |
| A-2 寿命 | Gmail App Passwordは2段階認証無効化／失効時に人手更新が必要。Node majorと依存監査は公開前に再確認する。 |
| A-3 配布 | branch → PR → Deploy Preview確認 → 承認後merge → Netlify本番、の順。本計画作成時点ではmerge／deploy／本番設定変更をしない。 |
| A-4 テスト | Node 22/24で既存251 checks、localhost SMTPで2通のenvelope/header/body、異常入力でSMTP接続0回、`npm audit --omit=dev`を確認。実Gmail、実Google Sheets、本番Netlifyは別の手動確認として明記する。 |

## 承認後の最小実装

### Task 1: REDテストを追加

**Files:**
- Create: `00-01_han-ai/13_ai-diagnosis-tool/tests/nodemailer-smtp-contract.mjs`
- Modify: `00-01_han-ai/13_ai-diagnosis-tool/tests/save-inquiry-contract.mjs`
- Modify: `00-01_han-ai/13_ai-diagnosis-tool/package.json`

- [x] Node標準`net`でlocalhost SMTPを起動し、外部通信なしで2通の `MAIL FROM` / `RCPT TO` / `DATA` と本文を捕捉するテストを書く。
- [x] 不正emailではSMTP接続が0回である既存契約を維持する。
- [x] Nodemailer 6のままテストを実行してbaselineを保存する。

### Task 2: NodeとNodemailerを更新

**Files:**
- Modify: `00-01_han-ai/13_ai-diagnosis-tool/package.json`
- Modify: `00-01_han-ai/13_ai-diagnosis-tool/package-lock.json`
- Modify: `00-01_han-ai/13_ai-diagnosis-tool/netlify.toml`
- Modify only if injection is required by the RED test: `00-01_han-ai/13_ai-diagnosis-tool/netlify/functions/save-inquiry.js`

- [x] `engines.node`を`>=22`、`nodemailer`を`10.0.10`、`NODE_VERSION`を`22`へ変更する。
- [x] productionのGmail transport設定、送信先、本文、Google Sheets処理は変更しない。
- [x] `npm audit --omit=dev`でhighが0、moderateが4以下であることを確認する。数字は実行結果を記録し、予測値を実績扱いしない。

### Task 3: ローカル回帰とNetlify確認

**Files:**
- Update: `00-01_han-ai/13_ai-diagnosis-tool/README.md`（必要なNode要件と未検証範囲のみ）
- Update: `00-01_han-ai/docs/superpowers/plans/2026-09-16-ai-diagnosis-nodemailer-node22.md`（実測結果）

- [x] Node 22と24で `npm test` およびlocalhost SMTP契約を実行する。
- [ ] Netlify UI／CLIで `AWS_LAMBDA_JS_RUNTIME` の有無を確認する。未確認なら、Functions runtimeは「未確認」のままにする。
- [ ] Deploy Previewのbuild logでNode 22を確認する。Functions実行時Nodeは、Netlify側のruntime表示または許可された診断ログで別に確認する。
- [ ] 実GmailのApp Password認証、From書換え、到達性、送信上限と、実Google Sheets appendは未検証として公開前確認へ残す。

## 保留・非対象

- `googleapis 181`／Google APIs系moderate 4件：major更新、localhost Sheets API模擬、実Sheets appendの別計画が必要。
- 公開POSTの頻度制限／CAPTCHA：外部設定・運用判断が必要で、本依存更新には追加しない。
- 価格、診断質問／スコア、送信先、掲載文、main merge、Netlify本番deployは変更しない。

## 公式根拠

- Netlify build Node / Functions追随: https://docs.netlify.com/build/configure-builds/manage-dependencies/#node-js-and-javascript
- Netlify Functions runtime（`AWS_LAMBDA_JS_RUNTIME` はUI／CLI／APIで設定し、`netlify.toml`不可）: https://docs.netlify.com/build/functions/configuration/#runtime-settings
- Nodemailer supported runtimes / CommonJS: https://github.com/nodemailer/nodemailer
- Nodemailer 10 changelog: https://github.com/nodemailer/nodemailer/blob/master/CHANGELOG.md
- Gmail App Passwordと制約: https://nodemailer.com/guides/using-gmail
- Nodemailer addressparser advisory: https://github.com/advisories/GHSA-2x7j-588g-ccc2

## 承認ゲート

承認対象は「Node 22 + Nodemailer 10.0.10 + localhost SMTP契約テスト」のみ。Google APIs major更新、本番設定、実Gmail送信は含めない。

## 実装・検証結果（2026-09-16）

- `nodemailer 6.10.1 → 10.0.10`、`engines.node >=22`、Netlify build `NODE_VERSION 18 → 22` を実装した。Google APIs系のversionは変更していない。
- `sendEmails` にmodule内部のtransport factory既定引数を追加した。HTTP handlerは従来どおり`data`だけを渡すため、requestからtransport／認証設定を制御できない。production既定値の `service: 'gmail'`、認証環境変数、申込者／固定オーナー宛先、Fromを28件のSMTP契約内で固定した。
- localhostへ実socket接続し、2通のMAIL FROM／RCPT TO／DATA、日本語件名・本文、254文字email、SMTP 550拒否、不正email時の接続0回、既存partial-success応答を確認した。Gmail／Google Sheetsへの外部通信はしていない。
- 公式Node.js 22.23.2（公式SHA256一致）とNode.js 24.16.0の両方で、logic 20 + UI 37 + inquiry 36 + SMTP 28 + browser 158 = **279 checks PASS**。Chromium／Firefox／WebKitとfocus contrast最小4.63:1を含む。
- `npm audit --omit=dev` は **high 0 / moderate 4 / total 4**。残りは `googleapis`／`googleapis-common`／`gaxios`／`uuid`で、修正候補 `googleapis 181` はmajorのため保留した。
- 証拠ログ：`qa-artifacts/diagnosis-node22/node22-final.log`、`node24-final.log`、`npm-audit-omit-dev.json`（QA領域、リポジトリ外）。
- 未検証：実Gmail App Password認証、GmailのFrom書換え／到達性／送信上限、実Google Sheets append、Netlify UIの`AWS_LAMBDA_JS_RUNTIME`、Deploy PreviewとFunctions実行時Node。main merge／本番deployは未実施。
