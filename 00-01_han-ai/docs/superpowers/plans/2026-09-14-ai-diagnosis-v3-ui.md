# AI活用準備度診断 V3 UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** AI活用準備度診断の質問・回答・判定・料金・送信契約を変えず、現行ざつね屋V3に沿う読みやすいヘッダー、診断画面、結果画面、フッターへ整える。

**Architecture:** 公開6ページの共通ヘッダー／フッターは既存DOMを維持して共有CSSで整え、診断本体は `diagnosis-simple.html` と `style.css` の余白・幅・タイポグラフィだけを変更する。`diagnosis-simple.js` は既存の画面遷移へフォーカス管理とARIA状態同期のみ加え、計算ロジックとNetlify Functionsには触れない。

**Tech Stack:** Static HTML/CSS/JavaScript, Node.js 18, Netlify, Playwright, axe-core

---

### Task 1: 診断契約をテストで固定

**Files:**
- Create: `13_ai-diagnosis-tool/tests/diagnosis-contract.mjs`
- Create: `13_ai-diagnosis-tool/tests/diagnosis-browser.mjs`
- Create: `13_ai-diagnosis-tool/tests/qa-server.mjs`
- Modify: `13_ai-diagnosis-tool/package.json`
- Modify: `13_ai-diagnosis-tool/package-lock.json`

- [x] 静的契約で12問、各選択肢の点数、ステージ境界、質問文、料金文言、Functions送信先の不変を検査する。
- [x] Playwright契約で全最小回答0点／準備期、全最大回答100点／推進期、戻る・再回答、API 503時fallbackを検査する。
- [x] 変更前にUI要件テストを実行し、ヘッダー／フッター・ARIAの期待が失敗することを確認する。

### Task 2: V3共通装丁と診断画面を局所調整

**Files:**
- Modify: `13_ai-diagnosis-tool/nav-header-footer.css`
- Modify: `13_ai-diagnosis-tool/style.css`
- Modify: `13_ai-diagnosis-tool/diagnosis-simple.html`
- Modify: `13_ai-diagnosis-tool/diagnosis-simple.js`
- Verify: `13_ai-diagnosis-tool/{detail,prices,curriculum,estimate,request}.html`

- [x] 現行HTMLの有効URLとロゴ文字を保持し、ヘッダー／フッターをV3の余白、2列SP sitemap、44px操作域へ揃える。
- [x] 設問の読みやすい640px幅は維持し、結果のみPC最大720px、本文行間1.7、カード余白・影・角丸をV3トークンへ整える。
- [x] 進捗へprogress semantics、回答へ `aria-pressed`、画面遷移へ見出しフォーカス、`:focus-visible` を追加する。
- [x] `progressBar.style.width` と `btnBack.style.visibility` をdata属性／状態classへ置換し、診断ロジックは変えない。

### Task 3: レスポンシブ・アクセシビリティ検証

**Files:**
- Update: `13_ai-diagnosis-tool/tests/diagnosis-browser.mjs`
- Create artifacts: `13_ai-diagnosis-tool/qa-screenshots/diagnosis-v3/*.png`

- [x] Chromiumで375/1280pxの設問・結果を撮影し、横溢れ、SP footer、タップ域、長文折返しを実測する。
- [x] Chromium／Firefox／WebKitの375/768/1280pxで開始・回答・結果・戻るを確認する。
- [x] axeで開始・設問・全4ステージ結果のWCAG A/AA違反0件を確認する。

### Task 4: 差分点検とレビュー待機

**Files:**
- Modify if needed: `13_ai-diagnosis-tool/README.md`
- Record later: related Obsidian note

- [x] `git diff --check` と最適化項目を確認し、Functions・質問・スコア・送信先が無変更であることを証明する。料金は表示文字列の静的契約でも固定した。
- [x] 375/1280px画像、テスト終了コード、変更統計をrootへ渡し、独立目視レビューを待つ。
- [x] root最終目視承認を取得し、commit/push/PR/Obsidian記録へ進む。

### 検証・最適化結果

- 最終関連QA: logic 23 + UI 26 + browser 117 = 166 checks PASS。診断本体の375 / 768 / 1280px、Chromium / Firefox / WebKit、全4ステージのaxeに加え、共通装丁を使う残り5ページの375 / 1280pxスモークを含む。
- 使い捨てproduction `console.log`、`alert` / `confirm` / `prompt`、秘密情報露出、コメントアウト死にコードは追加なし。
- 簡易診断の動的inline style 2件はdata属性／状態classへ移した。詳細診断に以前からあるinline styleと `.style` 操作は今回の共通装丁・簡易診断UIの範囲外で未変更。
- API機能と返り値は変更していないため、返り値形式の改修は非該当。Functions実通信は未検証で、ブラウザQAでは503に置換した。
- npm install時点で既存依存を含む監査警告6件（moderate 5 / high 1）が表示された。UIタスク内で破壊的な `npm audit fix` は実施していない。

### 2026-09-15 最終最適化監査

- productionの使い捨てconsole、dialog API、秘密値、コメントアウト死にコードは0件。QAのconsoleは終了結果とローカルserver URLを示す意図的出力。
- 簡易診断ではinline style 0件。詳細診断の既存inline style 1件／`.style` 3件は本UI変更前から存在し、詳細診断ロジックを変えない制約によりscope外として維持。
- 追加UI内の未使用DOM cache `progressBar` と未使用CSS token 4件を削除。重複selectorはSP override／footer mark overrideとして必要なもののみ。
- `npm audit` は全依存・production限定とも6件で一致し、base `8fa22c0` と6packageのversionも一致。今回追加したdev QA依存に起因しない。
- `npm audit fix --dry-run` で非major更新と確認できたtransitive `qs` のみ `6.15.3 → 6.16.0` へ更新し、監査警告は6件から5件（moderate 4 / high 1）へ減少。
- 残るGoogle APIs系4件とNodemailer 1件はdirect dependencyのmajor更新を要するため、本UIタスクでは変更しない。Functions実通信の正常・異常系回帰を用意する別タスクが必要。
- 最終 `npm test`: 166 checks PASS。API返り値は機能変更がなく非該当、本番Functions実通信は未検証。

### 既知の内容不整合（今回のUI変更対象外）

`detail.html` の全コースセット表記（5名／10名＋⑤グループ）と、`prices.html` の⑤「グループMAX3名」は条件の読み方が一致していない。また旧HPにあった20,900円というセット単位には、現行ファイル内で根拠を確認できない。料金・業務条件は確認なしに変更せず、別途正本確定が必要。
