# ざつね屋 v3 事業改善仕様 ― 13番診断ツール・14番提案書生成・研修設計 変更提案書

- 日付: 2026-08-31
- ステータス: **確定版（D-2〜D-7 ユーザー承認済み 2026-08-31 / 下流編集セッションの着手用）**
- 種別: 変更提案のみ。本書に基づくコード編集は下流セッションが別途実施する。本書作成時点でコード編集は一切していない。

---

## 1. 概要

### 1.1 目的

広告物（HP v3・チラシ）で確定した「地域企業の小さな業務変革屋」への再ポジショニング（以下 v3 正本）を、**13番 AI活用診断ツール**・**14番 提案書生成アプリ**・**研修設計資料（`00-01_han-ai/training-materials/`）** の 3 領域に整合させるための変更提案。下流の編集セッションが本書だけを見て着手できる粒度でまとめる。

- 略語の初出定義: AI = 人工知能 / OM = オーダーメイド / KPI = 重要業績評価指標 / CTA = 行動喚起導線（Call To Action） / PDF = Portable Document Format / SEO = 検索エンジン最適化 / DX = デジタルトランスフォーメーション。
- 「Codex 版（旧）」= 中小企業向けAI活用支援を掲げていた既存の記述群。「v3 正本（新）」= 下記 1.2 の正本文書で確定した記述。

### 1.2 正本ソース（本書が根拠にした文書）

| 略号 | ファイル / 場所 | 用途 |
|---|---|---|
| spec | `00-01_han-ai/docs/superpowers/specs/2026-08-30-zatuneya-hp-v3-henkakuya-design.md` §2 ほか | Codex 確定仕様。ブランド確定事項 |
| copy | `00-01_han-ai/docs/superpowers/specs/2026-08-30-zatuneya-hp-v3-top-page-copy.md` | 対外文言の正本（TOPページ本文） |
| handoff | `00-01_han-ai/docs/superpowers/specs/2026-08-30-zatuneya-hp-v3-downstream-alignment-handoff.md`（commit 019515f、その後 0bcceea で診断URL方針を反映） | 下流整合の親指示。分担境界の正 |
| 決定 | Obsidian `01_Projects/zatuneya-hp/HP-v3-要件定義_2026-08-30.md` の「決定事項 1〜19」 | 意思決定の全体像 |
| business_plan | メモリ `project_business_plan.md`（2026-08-24） | 内部数値の正（月商 保守27万／目標50万／楽観86万） |

### 1.3 前提条件（本書作成中にユーザー方針が確定した事項）

- **P-a. 診断ツールの当面URL**: AI活用準備度診断ツール（13番）の最終公開URLは、レンタルサーバ契約・独自ドメイン取得の時点で確定する。それまでの当面のCTA遷移先・正規URL（canonical）は、13番が実際に稼働している `https://ai-shindan-zatuneya.netlify.app/` とする。`han-ai-diagnosis.netlify.app` は稼働未確認のため使わない（当初 spec・copy・決定14 は `han-ai-diagnosis.netlify.app` を挙げていたが、別セッションが commit 0bcceea で handoff 項目12ほかを `ai-shindan-zatuneya.netlify.app` 当面運用に修正済み・push済み）。この方針は旧ドラフトの A-12・C-6・D-1 を上書きする。
- **P-b. 移住日**: 2026-08-18 で確定。**対外物（HP・チラシ・名刺・提案書PDF等）には移住日を載せない。** 行政・内部資料でのみ使用してよい。13番・14番・研修資料を確認した範囲では移住日の記載箇所は見当たらなかったが、下流編集時に発見した場合は対外物からは除去する。
- **P-c. 実績の匿名事例**: 具体の差し替え元ネタはユーザー保留中。データ構造だけ整え、文面の確定差し替えは対象外（handoff スコープ境界）。

### 1.4 別セッションとの分担

本提案書の対象は **13番 / 14番 / `training-materials/` の 3 領域に限定**する。次は本書の対象外（担当を明記）。

| 対象外 | 担当 | 根拠 |
|---|---|---|
| リポジトリ**ルート直下**の `han-ai.html` / `index.html`（GitHub Pages 公開サイト本体） | 下流整合セッション自身（本書とは別作業として実施）。**HP v3（`zatuneya-hp` サブモジュール）セッションの担当ではない** | handoff §A |
| `00-01_han-ai/zatuneya-hp/` 配下すべて（v3 TOP 実装・下層ページ） | HP v3 セッション | handoff スコープ境界 |
| チラシ・名刺の制作物（`00-01_han-ai/flyer-henkakuya/` ほか） | チラシセッション | handoff スコープ境界 |
| `00-01_han-ai/zatuneya-business-plan-draft.md` / `.html` の数値・経歴更新 | 別タスク | handoff §D、決定16 |
| メモリ `project_revenue_standard.md` 本文の内部数値書き換え・6コース化、`project_service_design.md` / `project_service_roadmap.md` / `project_training_course1〜5.md` / `project_subsidy_strategy.md` | 別セッション | handoff §E |
| 案件ダッシュボードの該当カード更新 | 別セッション | handoff §E |
| 契約書ひな型（`contract_om.md` / `contract_banso.md` 等。リポジトリ内に現存せず、Obsidian 移行済みの可能性） | 別途（本書 D-2 に留置） | ― |
| 実績の匿名事例の具体文面 | ユーザー保留中 | handoff スコープ境界 |

### 1.5 handoff との関係

handoff §B・§C・§F が「13番・14番・研修資料の変更点洗い出し＋提案ドラフトを 6e が先行中。その成果を入力にする」と記している。**本提案書がその「6e の成果＝下流編集セッションの入力」に当たる。** handoff がすでに決めた事項（サービス名称・6コース体系・モニター/助成金の対外扱い・経歴表記・内部数値・診断URL）は本書では「確定」として扱い、当初の D 節（要ユーザー判断）からは除外した。その D 節に残していた D-2〜D-7 も 2026-08-31 にユーザー承認で確定し、本書は確定版になった。handoff と重複する別セッション担当分（1.4 の表）は本書の変更提案（C 節）からも除外した。

---

## 2. A. 変更点一覧（Codex 版〔旧〕→ v3 正本〔新〕）

> handoff により確定済みの項目は「確定」列に ✓。当初 D 節へ送った論点（D-2〜D-7）も 2026-08-31 にユーザー承認で確定済み。

| # | カテゴリ | Codex 版（旧） | v3 正本（新） | 根拠 | 確定 |
|---|---|---|---|---|---|
| A-1 | ポジショニング／肩書 | 「中小企業向けAI活用支援のざつね屋」「中小企業の業務改善パートナー」 | 屋号「ざつね屋」＋肩書「地域企業の小さな業務変革屋」を併記 | spec §2、copy §1、決定1、handoff(1) | ✓ |
| A-2 | 標語（新規追加） | なし | 「AIを入れることより、仕事がよくなることから。」（copy の H1）。13番・14番の見出し/メタ/前文にキャッチコピー相当があれば差し替え候補 | copy §「1. ヒーロー」、handoff(2) | ✓ |
| A-3 | ターゲット／地域 | 「中小企業」「広島県東部の中小企業」「広島県福山市近郊」 | 「数十名規模の地域企業の管理職・実務責任者」。拠点は「広島県府中市を拠点に、近隣の地域企業を訪問して支援」 | spec §2、copy §1/§8/§11、決定3、handoff(3) | ✓ |
| A-4 | 主力サービス | 明確な主力なし（研修＝入口、3本柱＋パッケージが横並び） | **AI経営改善パッケージ 360,000円／3か月** を中心に据える | spec §2/§5、決定4、handoff(4) | ✓ |
| A-5 | 経営改善パッケージの価格表示 | 圧縮版 270,000／標準版 360,000／拡張版 540,000 の3プラン表＋専門家謝金単価（25,000／20,000／15,000円）＋「補助率2/3で実質120,000円」 | 対外は **360,000円（3か月・16時間）単一表示**。謝金単価表・補助率注記は対外に出さない | copy §5、決定5・決定8、handoff(4)(8) | ✓（14番の 1:1 見積では圧縮版270,000／拡張版540,000を内部オプションとして温存＝D-6 確定。対外PDF・`prices.html` は標準版360,000円のみ） |
| A-6 | 3サービスの呼称 | 研修サービス／AI業務改善オーダーメイドサービス／AI開発伴走サービス | **AI実務研修／個別業務設計／AI活用伴走**（＋上位に主力パッケージ） | spec §2、copy §6、handoff(5) | ✓ |
| A-7 | 3サービスの価格表示 | 研修 各コース価格明示、OM の S/M 各 50,000〜110,000円明示、伴走 月 60,000／100,000円明示 | AI実務研修「5名 60,000円〜（コースにより異なる）」、個別業務設計「内容に応じてお見積もり」、AI活用伴走「内容に応じてお見積もり」 | copy §6、handoff(5)(6) | ✓ |
| A-8 | 研修コース体系 | 5コース（⑤＝Claude Code 特化） | **6コース**（⑤＝AI活用ルール運用定着編／⑥＝Claude Code 特化）。`curriculum.html` は先行して6コース化済み（下流編集時に行番号を現物確認） | 決定5、handoff(6) | ✓ |
| A-9 | 研修コースの対外表示範囲 | ①〜⑤すべて価格公開（モニター価格併記） | 確定分のみ公開：①5名 60,000円〜／⑥個別 80,000円・グループ 180,000円／10時間パッケージ 400,000〜560,000円。②〜⑤は「要お問い合わせ」表示・`value` 空で残す（削除しない） | copy §6、決定5、handoff(6) | ✓（②〜⑤は「要お問い合わせ」・`value` 空で温存＝D-3 確定。全コースセット価格は v3 正本の 400,000〜560,000円に統一し旧 459,000／578,000 を置換＝D-3 確定） |
| A-10 | モニター割引 | `prices.html` に「モニター募集中（先着3社）30%引き」バナー＋専用価格テーブル、`detail.html`／`detail.js`／`generate-library.js` が全コース「（モニターXX円）」併記、14番 `e-monitor` トグル（×0.7） | **対外広告物では廃止。** 低額入口サービス（無料診断→小さなお試し改善）に置換。入口価格は工数検証後・当面未表示。内部の価格根拠としてのみ保持 | spec §2、決定6、handoff(7) | ✓（対外）。14番の 1:1 見積書 PDF ではモニター機構を内部「特別価格」レバーとして温存・既定OFF・ラベル変更＝D-2 確定 |
| A-11 | 助成金の対外掲載 | `prices.html` にヒーローバナー＋計6カ所の注記＋「補助率2/3で実質120,000円」＋「助成金の申請サポートも対応」、`detail.js` の推薦理由文2件、14番 `e-subsidy` 既定ON＋PDF「公的支援（助成金・補助金）について」ブロック＋提案書脚注 | **広告物では一切触れない**（料金注記・FAQ 含む）。個人事業主は教育訓練機関要件を満たせず「75%助成」表記は撤回承認済み。※経歴として「補助金の申請書作成支援の経験がある」旨を添えるのは可（copy §8）。助成金を使った価格訴求は不可 | spec §2、決定8、handoff(8) | ✓（対外）。14番の 1:1 提案書／見積書 PDF でも助成金注記は完全削除＝D-2 確定 |
| A-12 | AI活用準備度診断のURL | 13番の canonical（全ページ）・`sitemap.xml`・`robots.txt` は既に `https://ai-shindan-zatuneya.netlify.app/*`。`save-inquiry.js` の `SITE_URL` のみ `https://zatune-gif.github.io/kurashi-no-dodai-log/han-ai.html`（GitHub Pages 版）。README は GitHub Pages 併記 | **当面 `https://ai-shindan-zatuneya.netlify.app/` に統一**（前提 P-a）。13番の canonical／sitemap／robots は既に一致＝原則変更不要。ずれているのは `save-inquiry.js` の `SITE_URL` と README のみ。最終URLはドメイン取得時に一括再置換 | spec §4、決定14、handoff(12)（commit 0bcceea で当面運用へ修正）、前提 P-a | ✓ |
| A-13 | 経歴・実績表記 | 14番提案書PDF「広島県福山市近郊の中小企業・小規模事業者に特化」等。実績は本文プレースホルダ | 経歴は業種を出さず「現場でのデジタル化推進経験」。誤りの「製造業のDX」は不使用（正しくは建設業・ウェブ制作業での現場のデジタル化推進経験）。固有名「豊高組」不使用。拠点は府中市。実績は匿名化（業種・規模・やったこと・結果）で、根拠を示せない数値は使わない | spec §2、copy §8/§9/§11、決定7/9、handoff(2)(9)(10) | ✓（具体の匿名事例文面はユーザー保留＝P-c） |
| A-14 | 事業説明の軸（プロンプト内ペルソナ等） | 「AIを導入することが目的ではない／現場の業務を整理し利益を生む」／ペルソナ「中小企業向けAI活用コンサルタント」 | 「業務整理から入る／教えられる実装者／現場目線の伴走」の3本柱。「研修会社でもシステム開発会社でもない」。ペルソナ・事業説明を v3 トーン（地域企業の小さな業務変革屋）へ | copy §3、handoff(1) | ✓ |
| A-15 | 内部月商数値 | ― | 13番・14番に月商・年商の記載は**なし**＝変更不要。参考として、内部の正は月商 保守27万／目標50万／楽観86万（business_plan 2026-08-24）に一本化。Codex の「年間354〜528万」は初年度ランプアップ計画として別掲扱い | 決定16、handoff(11) | ✓（指摘のみ、コード変更なし） |
| A-16 | 著作権表記 | ― | 「© 2026 ざつね屋」に統一。13番各HTMLの footer は確認済みで**既に「© 2026 ざつね屋」**＝変更不要。14番 PDF テンプレも「© 2026 ざつね屋」で一致。ずれを発見した場合のみ修正 | spec §2、handoff(5〔著作権〕)、CLAUDE.md ルール7 | ✓（確認済み・原則変更不要） |

---

## 3. B. 波及先ファイル一覧

> 行番号は 2026-08-31 時点の現物で確認したもの（P1 の before/after 箇所は裏取り済み）。下流編集時に差分が生じている可能性があるため、着手時に再確認すること。パスはリポジトリルート `c:\Users\ooto\work\ClaudeCode\kurashi-no-dodai-log\` からの相対。

### B-1. 13番 AI活用診断ツール（`00-01_han-ai/13_ai-diagnosis-tool/`）

| ファイル | 行 | 現状値 | あるべき値（v3） | 対応 C 案 |
|---|---|---|---|---|
| `prices.html` | 63–69 | `subsidy-banner`（研修は助成金の対象となり得ます…） | ブロックごと削除 | C-1 |
| `prices.html` | 136–140 | `monitor-alert`「モニター募集中（先着3社）／30%引き」 | ブロックごと削除。跡地に低額入口導線（価格未記載） | C-2 |
| `prices.html` | 143–145 | `hook-box`「10名で受講すると…／人材開発支援助成金など公的支援の対象…」 | 助成金の一文を削除し、人数メリットの記述のみ残す | C-1 |
| `prices.html` | 308–327 | `section-card`「モニター価格（先着3社・30%引き）」＋モニター価格テーブル（① AI活用知識編〜⑤ Claude Code） | ブロックごと削除 | C-2 |
| `prices.html` | 311 | `<span class="monitor-title">モニター価格（先着3社・30%引き）</span>` | （308–327 削除に含む） | C-2 |
| `prices.html` | 332 | `<span>セット価格（税別・モニター適用なし）</span>` | 「セット価格（税別）」 | C-2 |
| `prices.html` | 332 直後のセット価格テーブル金額セル（下流編集時に行番号を現物確認） | 全コースセット「5名 459,000円／10名 578,000円」 | v3 正本の「10時間パッケージ 400,000〜560,000円」に置換（レンジ表記は v3 正本に合わせる）＝D-3 確定 | C-2 / C-8 |
| `prices.html` | 432 | `choice-guide-footer`「…研修サービスは人材開発支援助成金など公的支援の対象となり得ます（要件確認が必要です）。」 | 助成金の一文を削除し、「10名集めると1人あたりの受講料をさらに抑えられます。」のみ残す | C-1 |
| `prices.html` | 436–490 | SERVICE 02「AI経営改善パッケージ」節：圧縮版/標準版/拡張版 3行表（447–458）＋専門家謝金単価表（475–487）＋補助率2/3・実質120,000円の `plan-note`（489） | 「360,000円（3か月・16時間）」単一表示。3プラン表 → 1行。謝金単価表（475–487）→ 削除し、数値は `C:\Users\ooto\work\中小企業向けAI活用支援事業\` 配下の内部資料（非公開・リポジトリ外）へ退避＝D-7 確定（退避完了までは削除保留可）。`plan-note`（489）削除 | C-8 |
| `prices.html` | 489 | `plan-note`「補助金・助成金について：…補助率2/3…実質負担額は約120,000円…」 | 削除 | C-1 / C-8 |
| `prices.html` | 633 | `cta-sub`「まずはお気軽にお問い合わせください。<br>助成金の申請サポートも対応します。」 | 「助成金の申請サポートも対応します。」を削除 | C-1 |
| `prices.html` | 640–644 | `price-notes` 内 642 行「※ 人材開発支援助成金など公的支援の対象となり得ます（…要件確認が必要です。詳細はお問い合わせください）」 | 642 行を削除。641・643 行（税別／10名超は別日程）は残す | C-1 |
| `prices.html` | 18 | `site-logo__pre`「中小企業向けAI活用支援の」 | v3 肩書へ（例：「地域企業の小さな業務変革屋」）。※全13番HTML共通（下記） | C-10 |
| `prices.html` | 78–82, 94–115 | `quick-nav`／`choice-guide` のサービス名「研修ワークショップ」「業務改善オーダーメイド」「開発伴走」「AI研修ワークショップ」「AI業務改善オーダーメイド」「AI活用伴走サービス」 | 「AI実務研修」「個別業務設計」「AI活用伴走」へ | C-9 |
| `prices.html` | 133, 439–440, 496, 573 | `section-head` の `title`「研修ワークショップ」「AI経営改善パッケージ」「AI業務改善オーダーメイドサービス」「AI開発伴走サービス」 | 「AI実務研修」「AI経営改善パッケージ」「個別業務設計」「AI活用伴走」へ | C-9 |
| `prices.html` | 652 | `site-footer__tagline`「広島県東部の中小企業に<br>AI活用支援を届ける」 | v3 表現（例：「地域企業の小さな業務変革を、府中市から」等。文言はユーザー確認可） | C-10 |
| `prices.html` | 7 | canonical `https://ai-shindan-zatuneya.netlify.app/prices.html` | 変更不要（前提 P-a と一致） | C-6 |
| `detail.html` | 236–266 | パターン3 見積プルダウン | 下記の通り改修 | C-4 |
| `detail.html` | 237 | `<optgroup label="研修（モニター価格あり・先着3社）">` | `label="AI実務研修"` | C-4 |
| `detail.html` | 238–247 | 各 `option` 表示「①AI活用知識編（5名）｜60,000円」等＋`value` 内「（モニターXX円）」 | ①と⑥（Claude Code）は残し表示・value から「（モニターXX円）」除去。②③④＋旧⑤（＝新②〜⑤）は削除せず「要お問い合わせ」表示・`value=""` で残す（value 空により見積金額計算に載らない）＝D-3 確定 | C-4 |
| `detail.html` | 246–247 | 「⑤Claude Code・個別」「⑤Claude Code・グループ」 | 番号を⑥へ（「⑥Claude Code・個別」「⑥Claude Code・グループ」） | C-4 / C-7 |
| `detail.html` | 249 | `<optgroup label="AI開発伴走サービス（月額）">` | `label="AI活用伴走"`、option テキストも「AI活用伴走・月1MTGプラン」等へ | C-9 |
| `detail.html` | 253 | `<optgroup label="AI業務改善オーダーメイドサービス">` | `label="個別業務設計"`、option テキストも「個別業務設計・Sプラン」等へ | C-9 |
| `detail.html` | 259 | `<optgroup label="セット価格（モニター適用なし）">` | 「セット価格」 | C-2 |
| `detail.html` | 16, 283 ほか | `site-logo__pre`「中小企業向けAI活用支援の」／footer ロゴ | v3 肩書へ | C-10 |
| `detail.html` | 321 | `site-footer__copy`「© 2026 ざつね屋」 | 変更不要（確認済み） | ― |
| `detail.js` | 9 | 業種選択肢 `options: ['製造業', …]` | **変更不要**（クライアントの業種選択肢であり、ざつね屋の経歴表記ではない） | ― |
| `detail.js` | 246–263 | `FALLBACK_RECOMMENDATIONS`（準備期／導入期／活用期／推進期の推薦） | price から「（モニターXX円）」除去、service 名を新体系へ、reason の助成金文言（257・261）除去、活用期・推進期の rank1 に「AI経営改善パッケージ（360,000円・3か月）」を追加 | C-3 |
| `detail.js` | 248, 261 | 「全5コースの入口として…」「全5コースで組織全体の…」 | 「全6コース」 | C-3 / C-7 |
| `detail.js` | 261 | 「全コースセット（①②③④+⑤グループ・5名）」 | 「①②③④+⑥グループ」へ（番号繰り下げ）。セット構成は維持。全コースセット価格は v3 正本の 400,000〜560,000円に統一（旧 459,000／578,000 を置換）＝D-3 確定 | C-3 / C-7 |
| `netlify/functions/generate-library.js` | 37–64 | `servicesCatalog`（「広島県福山市近郊版」／研修モニター価格／⑤ Claude Code） | 「福山市近郊版」→「府中市近郊」等、モニター価格全削除、⑤=AI活用ルール運用定着編・⑥=Claude Code に改番、AI経営改善パッケージ 360,000円/3か月 を追加 | C-5 |
| `netlify/functions/generate-library.js` | 66 | プロンプト「あなたは中小企業向けAI活用コンサルタントです。」 | v3 トーンのペルソナ（例：「あなたは地域企業の業務改善に伴走する実務家です。」）。事業説明を A-14 の3本柱へ | C-5 |
| `netlify/functions/generate-library.js` | 97–107 | 推薦ルール（準備期→①／導入期→②／活用期→OM・S／推進期→OM・M、set は入門/実践/全コース） | v3 体系で再設計（下記 C-5）。②〜⑤の直接推薦を避け、①／⑥／AI経営改善パッケージ／個別業務設計へ寄せる | C-5 |
| `netlify/functions/generate-comment.js` | 20 付近 | ペルソナ「中小企業向けAI活用コンサルタント」相当 | v3 トーンへ（generate-library.js と揃える） | C-5 |
| `netlify/functions/save-inquiry.js` | 6 | `const SITE_URL = 'https://zatune-gif.github.io/kurashi-no-dodai-log/han-ai.html';` | `process.env.SITE_URL || process.env.URL || 'https://ai-shindan-zatuneya.netlify.app'`（環境変数フォールバック） | C-5 / C-6 |
| `sitemap.xml` | 3–20（6 `<loc>`） | 全て `https://ai-shindan-zatuneya.netlify.app/*` | 変更不要（前提 P-a と一致）。ドメイン確定時に一括置換 | C-6 |
| `robots.txt` | ― | `Sitemap:` 行（現物で確認） | 変更不要（前提 P-a と一致） | C-6 |
| `index.html`（13番ツール内） | canonical ほか | （下流編集時に現物確認） | canonical は ai-shindan-zatuneya で一致想定。肩書・サービス名は C-9/C-10 に準ずる | C-9 / C-10 |
| `diagnosis-simple.html` / `estimate.html` / `request.html` | 7（canonical）、logo、footer、サービス名 | canonical は ai-shindan-zatuneya で一致。`site-logo__pre`「中小企業向けAI活用支援の」、nav/footer のサービス名は旧称 | C-9 / C-10 |
| `curriculum.html` | 607・672・1289 ほか（logo）、615–619・1296–1300（サービス名リンク） | `site-logo__pre` 旧称、nav/footer サービス名旧称。※コース本文は6コース化済み（L1269「全6コース」・下流編集時に行番号確認） | C-9 / C-10（コース体系は対応済み） |
| `README.md` | 9「12問」／13「prices.html 料金案内」／42–45 バックエンド説明 | 「12問」は実装（`diagnosis-simple.js`）と一致＝変更不要。6コース・Netlify 本番前提・診断URL（当面 ai-shindan-zatuneya）を反映 | C-13 |

> 補足: handoff §B は「services.html」を挙げているが、13番ディレクトリに `services.html` は存在しない（現存は `index.html` / `diagnosis-simple.html` / `detail.html` / `curriculum.html` / `estimate.html` / `request.html` / `prices.html`）。

### B-2. 14番 提案書生成アプリ（`00-01_han-ai/14_proposal-generator/`）

| ファイル | 行 | 現状値 | あるべき値（v3） | 対応 C 案 |
|---|---|---|---|---|
| `main.js` | 70–145 `getServiceDeliverables()` | サービス名マッチ文字列が旧称（「AI業務改善オーダーメイド」76／「AI開発伴走」86 ほか）。⑤分岐（125・128）が Claude Code 成果物 | マッチ文字列に新称を追加（「個別業務設計」「AI活用伴走」「AI実務研修」）＝**13番 `generate-library.js` の推薦 `service` 文字列と一致必須**。⑤分岐を⑥へ、新⑤（AI活用ルール運用定着編）の成果物定義を新設 | C-9 / C-11 |
| `main.js` | 132–141 | AI経営改善パッケージの成果物。133 行コメント「圧縮版（2か月・270,000円）・標準版（3か月・16h・360,000円）・拡張版（4か月・540,000円）」 | 3プラン選択（圧縮版・標準版・拡張版）は内部見積オプションとして維持（既定＝標準版360,000円/3か月）。**PDF 出力時の対外表記は標準版のみ**＝D-6 確定。コメントは「対外は標準版のみ／圧縮・拡張は内部見積オプション」と明記。成果物名を `prices.html` L470–473（組織改善計画書／実装マニュアル／KPI設計書）と突合 | C-8 |
| `main.js` | 164 | プロンプト「あなたはざつね屋（広島県福山市近郊の中小企業向けAI活用支援専門家）のコンサルタントです。」 | 「広島県府中市を拠点に地域企業のAI活用に伴走する実務家」トーンへ。「教えられる実装者」を含める | C-10 |
| `main.js` | 469 | 見積書PDF `${estimateData.applyMonitor ? '<div…>※ モニター価格適用（30%引き）</div>' : ''}` | 「※ モニター価格適用（30%引き）」→「※ 特別価格適用」に変更。`applyMonitor` 分岐・割引率は内部レバーとして温存、既定OFF＝D-2 確定 | D-2 |
| `main.js` | 471–475 | 見積書PDF `${estimateData.applySubsidy ? … '🎁 公的支援（助成金・補助金）について' … : ''}`（473 行に絵文字） | ブロックごと削除（絵文字🎁含む）。助成金注記は完全削除＝D-2 確定 | D-2 |
| `main.js` | 560 | 提案書PDF 脚注「※ご利用いただくサービスは、要件を満たす場合に人材開発支援助成金・IT導入補助金など…」 | 脚注ごと削除＝D-2 確定 | D-2 |
| `main.js` | 566–573 | 提案書PDF スケジュール表：`svc.includes('AI経営改善パッケージ')` 分岐で「3か月目（標準版）」「4か月目（拡張版）」 | 対外PDF表示は標準版（360,000円・3か月）のみ＝D-6 確定。標準版選択時は「（標準版）」表記と 4か月目行を出力しない。圧縮版・拡張版の分岐は内部見積オプションとして温存 | C-8 |
| `main.js` | 587 | 提案書PDF「広島県福山市近郊の中小企業・小規模事業者に特化したAI活用支援の専門家です」 | 「広島県府中市を拠点に、近隣の地域企業のAI活用に伴走します」等（copy §8 準拠）。588 行「教えること（研修）／作ること（制作）／一緒に開発すること（伴走）」のサービス名も新称へ | C-10 |
| `main.js` | 587 付近 | 「製造業」の語 | 現物確認した範囲では 14番に「製造業のDX」等の自己紹介文言はなし。発見時は「建設業・ウェブ制作業での現場のデジタル化推進経験」へ | C-10 |
| `renderer/index.html` | 121 | `<label class="toggle"><input id="e-monitor" type="checkbox"><span>適用する（30%引き）</span></label>` | `<span>` ラベルを「特別価格を適用する」に変更。トグルは温存、既定 OFF（現状 `checked` なし＝維持）。割引率は内部設定値＝D-2 確定 | D-2 |
| `renderer/index.html` | 124–125 | `<input id="e-subsidy" type="checkbox" checked>`＋「表示する（公的支援の対象となり得ます）」 | UI ごと削除（label・input・説明テキスト）。助成金注記は完全削除＝D-2 確定 | D-2 |
| `renderer/index.html` | 143–145 | `e-subsidy-preview`「研修サービスは人材開発支援助成金など公的支援の対象となり得ます…」 | プレビュー文ごと削除＝D-2 確定 | D-2 |
| `renderer/app.js` | 349–351 付近 | モニター係数 `×0.7` の計算 | `×0.7`（割引率）計算は温存＝「特別価格」適用時の内部レバー。既定 OFF なので通常は非適用＝D-2 確定。145 行付近 `parsePriceStr` は先頭数値を取るため、13番側で「（モニターXX円）」が除去されれば混入対策は不要 | D-2 |
| `DEVELOPMENT_STATUS.md` | 21–22（旧価格の修正履歴）／38–39（価格マスタ分散の課題） | ― | 価格マスタを JSON 1ファイルに集約する改善候補の優先度を上げる旨を追記 | C-12 |
| （表紙・前文） | `buildEstimateHtml` / `buildProposalHtml` の見出し | 「AI活用支援 ご提案書」等 | v3 標語（A-2）をサブコピーに使うか、少なくとも「AI活用支援専門家」表現を「地域企業の業務変革」寄りに。文言はユーザー確認可 | C-10（任意） |

### B-3. 研修設計資料（`00-01_han-ai/training-materials/`）

| ファイル | 行 | 現状値 | あるべき値（v3） | 対応 C 案 |
|---|---|---|---|---|
| `notice_template.md` | 117 | 「### コース⑤：実践編（Claude Code特化）」 | 「コース⑥：実践編（Claude Code特化）」 | C-7 |
| `survey_template.md` | 133 | 「### コース⑤：実践編（Claude Code特化）」 | 「コース⑥：…」 | C-7 |
| `survey_template.md` | 62 | 「個別の業務改善相談をしてみたい（AI業務改善オーダーメイドサービス）」 | 「（個別業務設計）」 | C-9 |
| `script_course05.md` | 全体 | ファイル全体がコース⑤＝Claude Code の台本 | ファイル名 `script_course05.md` → `script_course06.md` にリネーム＝D-4 確定（内容は⑥として維持し、見出し・本文の「コース⑤」表記を⑥へ） | C-7 |
| （新規）新⑤用 台本・notice・survey | ― | 新⑤「AI活用ルール・運用定着編」の台本・受講案内・アンケートは未整備 | 新規作成は本提案書の対象外＝別タスク＝D-4 確定 | D-4（対象外） |
| `generate_courses_02_05.py` | 749・763・768 | 「#  コース⑤：実践編（Claude Code特化）」「実践編（Claude Code特化）」定員表記 | コース⑥へ改番。※出力済み PDF/PPTX（`course05_jissen_claude_code.*`）の⑥としての再生成・リネーム要否は別タスクで判断＝D-4 確定 | C-7 |
| `generate_courses_02_05.py` | 980 | 「月1回プラン：60,000円/月」（伴走の価格） | サービス名を「AI活用伴走」へ。価格自体は内部値として維持可（対外表示ではない） | C-9 |
| `generate_courses_02_05.py` | 181・184・387・390・742 ほか | スライド内「AI業務改善オーダーメイド」「AI開発伴走」 | 「個別業務設計」「AI活用伴走」へ（handoff §F「必要な範囲」） | C-9 |
| `generate_course01.py` | 655・658 | 「実践編（文書・画像・動画・Claude Code）」「AI業務改善オーダーメイド・AI開発伴走」 | サービス名を新称へ。コース列挙は6コース前提の文言に | C-7 / C-9 |
| `curriculum.html`（13番内・参考） | 646–1327 | 6コース体系（⑤ルール運用定着編／⑥Claude Code、L1269「全6コース」） | **対応済み。他ファイルを合わせる基準**（下流編集時に行番号を現物確認） | ― |

---

## 4. C. 変更提案（優先度・実施順）

> 優先度の目安 ― P1: v3 正本に対して明確に矛盾し、対外的に露出している（広告物としての整合性・法的表現リスク）。P2: 用語・体系の統一で、放置すると混乱するが即時リスクは低い。P3: 内部ドキュメント・将来の保守性。
> **前提**: 本 C 節は 13番／14番／`training-materials/` に限定する（1.4 の対象外は含まない）。`prices.html` の実体は `00-01_han-ai/13_ai-diagnosis-tool/prices.html`（リポジトリルート直下に `prices.html` は存在しない）。

### P1（高）

#### C-1. 13番 `prices.html` から助成金表記を全削除

- 対象: L63–69（`subsidy-banner` ブロック削除）／L143–145（`hook-box` は受講料メリットの記述のみ残す）／L432（`choice-guide-footer` は人数メリットのみ残す）／L489（`plan-note` 削除）／L633（`cta-sub` から「助成金の申請サポートも対応します。」を削除）／L642（`price-notes` の助成金注記行を削除）。
- 根拠: spec §2「広告物には…助成金…を載せない」、決定8、handoff(8)。
- before / after（L63–69）:
  ```
  before:
    <div class="subsidy-banner">
      <p class="subsidy-eyebrow">研修サービスは人材開発支援助成金など公的支援の対象となり得ます</p>
      <p class="subsidy-main">適用には雇用保険の適用状況・訓練内容などの要件確認が必要です</p>
      <div class="subsidy-chips"><span class="subsidy-chip">詳細はお問い合わせください</span></div>
    </div>
  after:
    （ブロックごと削除。跡地に要素を足さない）
  ```
- before / after（L633）:
  ```
  before: <p class="cta-sub">まずはお気軽にお問い合わせください。<br>助成金の申請サポートも対応します。</p>
  after:  <p class="cta-sub">まずはお気軽にお問い合わせください。</p>
  ```
- 注意: `prices.css` に `subsidy-banner` / `subsidy-eyebrow` / `subsidy-chip` / `hook-box` などのセレクタが残っても機能上の害はない。CLAUDE.md「コメントアウトされた死にコードの削除」に沿い、未使用になった CSS ルールは同じ変更内でまとめて削除するのが望ましい（削除範囲はレビューで確認）。

#### C-2. 13番 `prices.html` のモニター表記を削除し、低額入口導線に置換

- 対象: L136–140（`monitor-alert` 削除）／L308–327（モニター価格 `section-card` 削除）／L332（見出しから「・モニター適用なし」を除去）。
- 跡地の導線（価格未記載、決定6「入口商品価格は当面未表示」）:
  ```
  after（L136–140 の跡地に、SERVICE 01 見出し直下の案内として）:
    <div class="entry-note">
      まずは無料の「AI活用準備度診断」と、小さなお試し改善からご案内できます。
      <a href="diagnosis-simple.html" class="entry-note-link">無料診断を受ける →</a>
    </div>
  ```
  - `entry-note` の余白・サイズは `prices.css` にクラスで定義する（CLAUDE.md ルール3「インライン style 禁止」。必要に応じて `!important` を用いる指針は CLAUDE.md「最適化の中身」に準拠）。
- before / after（L332）:
  ```
  before: <span>セット価格（税別・モニター適用なし）</span>
  after:  <span>セット価格（税別）</span>
  ```
- 根拠: spec §2、決定6、handoff(7)。

#### C-3. 13番 `detail.js` `FALLBACK_RECOMMENDATIONS` を確定価格・6コース・パッケージ前提に改修

- 対象: L246–263。
- 変更内容:
  1. すべての `price` から「（モニターXX円）」を除去（例 L248 `'60,000円（モニター42,000円）'` → `'60,000円'`）。
  2. `service` 名を新体系へ（例「①AI活用知識編（5名）」→「AI実務研修 ①AI活用知識編（5名）」）。②〜⑤は対外価格非公開のため rank1 に据えず、導入期の rank1 は「AI実務研修 ①」または「AI経営改善パッケージ」に寄せる。②〜⑤に言及する場合は `price` を「要お問い合わせ」とする（D-3 確定）。
  3. `reason` から助成金文言を除去（L257・L261 の「人材開発支援助成金など公的支援の対象となり得ます（要件確認が必要）。」を削除）。
  4. 活用期・推進期の rank1 に「AI経営改善パッケージ（360,000円・3か月）」を第1候補として追加。
  5. L248・L261 の「全5コース」→「全6コース」。
  6. 全コースセット（①②③④＋⑥グループ）の `price` を v3 正本の「400,000〜560,000円」に統一（旧 459,000／578,000 を置換）＝D-3 確定。
- before / after（L248）:
  ```
  before: { rank: 1, type: 'standalone', service: '①AI活用知識編（5名）', price: '60,000円（モニター42,000円）', reason: 'AIの基礎をチーム全員で学べます。全5コースの入口として、最も負担なく始められる研修です。' },
  after:  { rank: 1, type: 'standalone', service: 'AI実務研修 ①AI活用知識編（5名）', price: '60,000円', reason: 'AIの基礎をチーム全員で学べます。全6コースの入口として、最も負担なく始められる研修です。' },
  ```
- 実装注意: `service` 文字列は 14番 `main.js` `getServiceDeliverables()` のマッチキーと**一致させる**（→ 実装時の注意 6-1）。「AI実務研修 ①…」に `①` が含まれれば 14番 L113 の `n.includes('①')` は現状のまま通る。
- 根拠: 決定4/5/8、handoff(4)(6)(7)(8)。

#### C-4. 13番 `detail.html` 見積プルダウンの改修

- 対象: L236–266。
- 変更内容:
  1. L237 `<optgroup label="研修（モニター価格あり・先着3社）">` → `label="AI実務研修"`。
  2. L238–247 の各 `option`：`value` と表示テキストから「（モニターXX円）」を除去。①（L238–239）と Claude Code（L246–247、番号は⑥へ）は残す。②③④＋旧⑤（L240–245）は削除せず、表示「② 実践編（文書系）｜要お問い合わせ」＋`value=""` で残す（D-3 確定。`value` 空により見積金額計算に載らない）。
  3. L249 `label="AI開発伴走サービス（月額）"` → `label="AI活用伴走"`、option テキストも「AI活用伴走・月1MTGプラン」等（C-9）。
  4. L253 `label="AI業務改善オーダーメイドサービス"` → `label="個別業務設計"`（C-9）。
  5. L259 `label="セット価格（モニター適用なし）"` → `label="セット価格"`。
- before / after（L237–240）:
  ```
  before:
    <optgroup label="研修（モニター価格あり・先着3社）">
      <option value="①AI活用知識編（5名）|60,000円（モニター42,000円）">①AI活用知識編（5名）｜60,000円</option>
      <option value="①AI活用知識編（10名）|80,000円（モニター56,000円）">①AI活用知識編（10名）｜80,000円</option>
      <option value="②実践編・文書系（5名）|100,000円（モニター70,000円）">②実践編・文書系（5名）｜100,000円</option>
  after:
    <optgroup label="AI実務研修">
      <option value="①AI活用知識編（5名）|60,000円">①AI活用知識編（5名）｜60,000円</option>
      <option value="①AI活用知識編（10名）|80,000円">①AI活用知識編（10名）｜80,000円</option>
      <option value="">②実践編（文書系）｜要お問い合わせ</option>  ← `value=""` で残す（D-3 確定・見積計算に載らない）
  ```
- セット価格 optgroup（L259–）内の全コースセット金額は v3 正本の「400,000〜560,000円」に置換する（旧 459,000／578,000。C-8 と整合）＝D-3 確定。
- 根拠: 決定5/6、handoff(6)(7)。

#### C-5. 13番 Netlify Functions の整合

- 対象: `netlify/functions/generate-library.js`（L37–64 カタログ、L66 ペルソナ、L97–107 推薦ルール）、`netlify/functions/generate-comment.js`（L20 付近ペルソナ）、`netlify/functions/save-inquiry.js`（L6 `SITE_URL`）。
- 変更内容:
  1. `servicesCatalog`（L37–64）: 見出し「（税別・広島県福山市近郊版）」→「（税別・広島県府中市近郊）」。研修各行の「（モニターXX円）」を全削除。⑤を「AI活用ルール運用定着編」、Claude Code を⑥へ改番。冒頭に「AI経営改善パッケージ（3か月・16時間）360,000円」を追加。②〜⑤の行は残すが価格は「要お問い合わせ」に（D-3 確定）。全コースセット価格は v3 正本の「400,000〜560,000円」に統一（旧 459,000／578,000）。
  2. ペルソナ（generate-library.js L66 / generate-comment.js L20）: 「あなたは中小企業向けAI活用コンサルタントです。」→ v3 トーン。**この2案の最終選択はブロッカーではない。下流セッションが1案を提示しユーザー確認のうえ確定する**（→ 6-8）。参考2案:
     - 案 a: 「あなたは地域企業の業務改善に伴走する実務家です。AI導入そのものではなく、現場の業務整理から入り、社内の人が自分で回せる形にすることを重視します。」（copy §3 の3本柱に忠実）
     - 案 b: 現行の簡潔さを保ち「あなたは地域企業向けのAI活用アドバイザーです。」に留める（変更を最小化）。
     根拠: copy §3、handoff(1)。案 a は v3 メッセージとの一致度が高い一方プロンプトが長くなる。案 b は差分最小。
  3. 推薦ルール（L97–107）: v3 体系へ。案として（ユーザー確認可）:
     - 準備期 → standalone: AI実務研修 ①AI活用知識編（5名）／set: 入門セット
     - 導入期 → standalone: AI実務研修 ①または②相当（②を対外非表示にするなら「AI実務研修（コースはご相談）」）／set: 実践セット
     - 活用期 → standalone: **AI経営改善パッケージ（360,000円・3か月）**／set: 個別業務設計・Sプラン
     - 推進期 → standalone: **AI経営改善パッケージ** または 個別業務設計・Mプラン／set: 全コースセット相当
     - スキル「高い」→ ⑥Claude Code・個別 または 個別業務設計を優先
  4. `save-inquiry.js` L6: `const SITE_URL = process.env.SITE_URL || process.env.URL || 'https://ai-shindan-zatuneya.netlify.app';`（Netlify は `process.env.URL` に本番URLを注入する）。
- before / after（save-inquiry.js L6）:
  ```
  before: const SITE_URL     = 'https://zatune-gif.github.io/kurashi-no-dodai-log/han-ai.html';
  after:  const SITE_URL     = process.env.SITE_URL || process.env.URL || 'https://ai-shindan-zatuneya.netlify.app';
  ```
- 根拠: spec §2/§4、決定4/5/6、handoff(1)(4)(6)(7)(12)、前提 P-a。

#### C-6. 13番 診断URLの当面統一（ブロッカー解除済み）

- 前提 P-a により**着手可**。当面ターゲット = `https://ai-shindan-zatuneya.netlify.app/`。
- 現状確認の結果:
  - canonical（`prices.html` L7、`detail.html` L7、`curriculum.html` L7、`diagnosis-simple.html` L7、`estimate.html` L7、`request.html` の同位置）＝**既に `ai-shindan-zatuneya.netlify.app`。変更不要**。
  - `sitemap.xml` L3–20（6 `<loc>`）＝**既に `ai-shindan-zatuneya.netlify.app`。変更不要**。
  - `robots.txt` の `Sitemap:` 行＝同上（下流編集時に現物確認）。
  - 実際にずれているのは `save-inquiry.js` L6（GitHub Pages `han-ai.html` を指す）と `README.md`（GitHub Pages 併記）のみ → C-5・C-13 で対応。
- **明記事項**: レンタルサーバ契約・独自ドメイン取得が完了した時点で、canonical／sitemap／robots／`save-inquiry.js` フォールバック値／README を**最終URLへ一括再置換**する作業が別途発生する。C-6 は「当面値での整合」であり、恒久対応ではない。
- 根拠: 前提 P-a、handoff(12)（commit 0bcceea）。

### P2（中）

#### C-7. 研修コース番号の6コース化

- 対象: `training-materials/notice_template.md` L117、`survey_template.md` L133、`script_course05.md` 本文の「コース⑤」表記、`generate_courses_02_05.py` L749・L763・L768、`generate_course01.py` L655 付近、`detail.js` L248・L261、`detail.html` L246–247。
- 変更内容: Claude Code 特化コースを **⑤ → ⑥** に改番。新⑤「AI活用ルール・運用定着編」は 6コース体系上の存在として言及（対外価格は「お問い合わせ」）。
- `script_course05.md` のファイル名リネーム（→ `script_course06.md`）と新⑤台本の新規作成は D-4。
- 根拠: 決定5、handoff(6)、`curriculum.html`（先行対応済み・基準）。

#### C-8. 13番 `prices.html` の AI経営改善パッケージ節を単一プラン表示に

- 対象: L436–490。
- 変更内容:
  1. L447–458 の 3プラン表（圧縮版/標準版/拡張版）→ 「360,000円（3か月・16時間）」1行、または表を廃し `plan-detail` 記述へ。
  2. L475–487 の「専門家謝金単価（公表用）」表 → `prices.html` から削除。数値（A 経営改善指導 25,000円／B 業務改善指導 20,000円／C 技術指導 15,000円）は `C:\Users\ooto\work\中小企業向けAI活用支援事業\` 配下の内部資料（**非公開・リポジトリ外**）へ退避する＝D-7 確定。退避作業自体は下流セッションまたはユーザーが実施し、**退避が完了するまでは `prices.html` からの当該表の削除を保留してよい**（数値の逸失防止）。
  3. L489 の `plan-note`（補助率2/3・実質120,000円）→ 削除（C-1 と重複）。
  4. 成果物名（L468–473「組織改善計画書／実装マニュアル／KPI設計書」）を 14番 `main.js` L135–140（「現状診断レポート／KPI設計書／体制設計書（組織改善計画）／実装マニュアル」）と突合し、**両者で表記を統一**（どちらの表現に寄せるかはユーザー確認。「組織改善計画書」か「体制設計書（組織改善計画）」か等）。
- before / after（L452–456）:
  ```
  before:
    <tr><td>圧縮版</td><td>2か月</td><td>—</td><td>270,000円</td></tr>
    <tr><td>標準版</td><td>3か月</td><td>16時間</td><td>360,000円</td></tr>
    <tr><td>拡張版</td><td>4か月</td><td>—</td><td>540,000円</td></tr>
  after（`prices.html` 対外表示。14番の内部見積オプションとは独立）:
    <tr><td>期間</td><td>3か月</td></tr>
    <tr><td>時間</td><td>16時間</td></tr>
    <tr><td>料金（税別）</td><td>360,000円</td></tr>
  ```
- 根拠: 決定4/5、copy §5、handoff(4)。`prices.html`（対外）は 360,000円 単一表示で確定。14番の 1:1 見積では圧縮版270,000／拡張版540,000を内部オプションとして温存する＝D-6 確定。

#### C-9. サービス名称の対外表記統一

- 対象（13番）: `prices.html` の `quick-nav`（L78–82）・`choice-guide`（L94–115・L407–430）・`section-head` の `title`（L133・L496・L573）・footer（L659–662）、`detail.html`（nav ドロップダウン・footer・見積 optgroup）、`curriculum.html`（nav・footer）、`diagnosis-simple.html` / `estimate.html` / `request.html`（nav・footer）、`detail.js` の `reason` 文、`generate-library.js` カタログ、`generate-comment.js`。
- 対象（14番）: `main.js` L76–141 `getServiceDeliverables()` のマッチ文字列、L588 の説明文。
- 対象（研修）: `survey_template.md` L62、`generate_courses_02_05.py` / `generate_course01.py` のスライド文字列。
- 変更マップ:
  | 旧称 | 新称 |
  |---|---|
  | 研修サービス／研修ワークショップ／AI研修ワークショップ | **AI実務研修** |
  | AI業務改善オーダーメイドサービス／AI業務改善オーダーメイド／オーダーメイドサービス | **個別業務設計** |
  | AI開発伴走サービス／AI活用伴走サービス | **AI活用伴走** |
  | （主力） | **AI経営改善パッケージ**（名称変更なし） |
- 注意: nav / footer のサービスリンクは `href` が `https://zatune-gif.github.io/zatuneya-hp/service-*.html`（HP 下層ページ）を指す。**リンク先ページ自体は本書の対象外（HP v3 セッション）**。本 C-9 で変更するのは 13番内の**リンクテキスト**と見出し・カタログ文字列のみ。`href` の値は現状維持（HP 側のページ改名が済んだら別途追随）。
- 実装注意: 14番 `getServiceDeliverables()` のマッチキーと 13番 `generate-library.js` の推薦 `service` 文字列は**同時に変更**する（→ 6-1）。
- 根拠: spec §2、copy §6、handoff(5)。名称そのものは確定（D 送りにしない）。契約書ひな型・メモリへの伝播は 1.4 の通り対象外／D-2 留置。

#### C-10. 肩書・地域表記の統一

- 対象（13番・全HTML共通）: `site-logo__pre`「中小企業向け<span>AI</span>活用支援の」（`prices.html` L18、`detail.html` L16、`curriculum.html` L607、`diagnosis-simple.html` L18、`estimate.html` L19、`index.html`・`request.html` の同位置）、`prices.html` footer tagline（L652）。
- 対象（14番）: `main.js` L164（プロンプト内自己紹介）、L587（提案書PDF「4. ざつね屋について」）。
- 変更内容:
  - `site-logo__pre` → v3 肩書。案（ユーザー確認可）: (a)「地域企業の小さな業務変革屋」 (b) ロゴ近傍が長くなるのを避けるなら「業務変革屋」の短縮も可。spec §2 は「肩書＝地域企業の小さな業務変革屋」なので (a) を第一候補とする。
  - footer tagline（L652「広島県東部の中小企業に／AI活用支援を届ける」）→ 例「地域企業の業務変革を、広島県府中市から。」（文言はユーザー確認）。
  - 14番 L164 / L587 の「広島県福山市近郊の中小企業（・小規模事業者）に特化」→「広島県府中市を拠点に、近隣の地域企業のAI活用に伴走」（copy §8 準拠）。経歴に業種を出す表現があれば「建設業・ウェブ制作業での現場のデジタル化推進経験」に統一（誤りの「製造業のDX」は使わない）。
- 根拠: spec §2、copy §1/§8/§11、決定3/7、handoff(2)(3)(9)。

#### C-11. 14番 `getServiceDeliverables()` に⑥分岐と新⑤成果物定義を追加

- 対象: `main.js` L112–130。
- 変更内容: 現行 L125–129 の Claude Code 分岐は「⑥」に対応する形へ（`n.includes('⑥')` を追加、`n.includes('⑤')` は新⑤へ）。新⑤「AI活用ルール・運用定着編」の成果物を新設（案: 「社内AI活用ガイドライン（禁止事項・確認フロー含む）」「運用チェックリスト」「定着度セルフ点検シート」。内容は D-4 の新⑤設計と整合させる）。
- 根拠: 決定5、handoff(6)。新⑤の成果物確定は D-4 依存のため、本項目は D-4 の後に実施推奨。

#### C-12. 14番 `DEVELOPMENT_STATUS.md` の価格マスタ集約課題を格上げ

- 対象: `DEVELOPMENT_STATUS.md` L21–22・L38–39。
- 変更内容: 「価格・サービス名が `main.js` / `renderer` / 13番エクスポート JSON に分散しており、v3 改訂で複数ファイルの同時修正が必要になった」経緯を追記し、価格・サービス名マスタを 1つの JSON（例 `14_proposal-generator/data/service-master.json`）へ集約する改善を次期対応候補として明記。
- 根拠: CLAUDE.md「ドキュメント更新」、今回の横断修正コスト。実装（集約そのもの）は別タスク。

#### C-13. 13番 `README.md` の更新

- 対象: `README.md` L9・L13・L42–45。
- 変更内容: L9「12問」は `diagnosis-simple.js` 実装と一致＝**変更しない**。診断ツールの公開先を「Netlify 本番（当面 `https://ai-shindan-zatuneya.netlify.app/`、最終URLはドメイン取得時に確定）」と明記。研修は6コース体系。`save-inquiry.js` の `SITE_URL` が環境変数化された旨をバックエンド説明に反映。
- 根拠: 前提 P-a、決定5、CLAUDE.md「ドキュメント更新」。

#### C-14. 診断URLの参照集約（保守性向上・新規提案）

- 背景: 前提 P-a により、最終URLはドメイン取得時に再度一括置換が必要。現状、診断URLは 13番 HTML 群・`save-inquiry.js`・14番 `main.js`・（参考として）v3 HP 側にハードコードで分散している。
- 提案（案。ユーザー確認可）:
  - 13番: 診断URLを参照する箇所を、共通スクリプト（例 `13_ai-diagnosis-tool/config.js` に `window.ZATUNEYA_DIAGNOSIS_URL = 'https://ai-shindan-zatuneya.netlify.app/';`）または各HTML冒頭の1定数に集約し、CTA の `href` を生成/差し替え可能にする。SEO 上重要な canonical はビルド不要の静的値で残しつつ、**変更箇所の一覧を README に明記**する運用でも可（過剰なJS化を避ける）。
  - Netlify Functions: `save-inquiry.js` は C-5 で `process.env` 化。他 Function が診断URLを参照する場合も同方針。
  - 14番: `main.js` 内の診断/サイトURLを先頭の定数（例 `const DIAGNOSIS_URL = ...`）に集約。
- 断定を避けた注記: 「全面的な設定ファイル化」は小規模ツールには過剰になりうる。最小案は「参照箇所を README の1セクションに列挙し、ドメイン確定時のチェックリストにする」こと。どこまで仕組み化するかはユーザー判断。
- 根拠: 前提 P-a、handoff(12)、CLAUDE.md「最適化の中身」。

### P3（低）

#### C-15. 標語・メタ情報の反映（任意）

- 対象: 13番各HTMLの `<meta name="description">`（現状の有無を下流編集時に確認）、`<title>`、ヒーロー見出し（`prices.html` L60「料金案内」等の実務見出しは維持）。14番 PDF テンプレの表紙サブコピー。
- 変更内容: メタディスクリプションがあれば v3 ポジショニング（地域企業の小さな業務変革屋／「AIを入れることより、仕事がよくなることから。」）へ。なければ追加は任意。13番は実務ページ（診断・料金）であり、標語の押し出しは HP 本体側の役割。ここでは「旧ポジショニング（中小企業向けAI活用支援）の語をメタ・タイトルから消す」ことを主眼にする。
- 根拠: copy §「1. ヒーロー」、handoff(2)。

#### C-16. 著作権表記の確認（是正は発見時のみ）

- 対象: 13番各HTMLの `site-footer__copy`、14番 PDF の `footer`。
- 現状確認: 13番（`detail.html` L321、`curriculum.html` L1327、`diagnosis-simple.html` L244 ほか）・14番（`main.js` L486・L534 相当）とも**既に「© 2026 ざつね屋」**。
- 対応: 変更不要。下流編集で旧年号・旧表記を発見した場合のみ「© 2026 ざつね屋」へ是正。
- 根拠: spec §2、CLAUDE.md ルール7。

---

## 5. D. 確定した方針（ユーザー承認済み 2026-08-31）

> 本節は当初「要ユーザー判断の残論点」だった。2026-08-31 に D-2〜D-7 の全項目がユーザー承認により確定した。以下は確定内容の記録であり、下流編集セッションはこの方針で実装する。handoff で解消済みの論点（サービス名称・6コース体系・モニター/助成金の対外扱い・経歴表記・内部数値・診断ドメイン D-1・拠点表現）は当初から本節の対象外。実装時にユーザー確認する非ブロッカー項目（C-5 ペルソナ文言・C-9 optgroup ラベル・C-10 footer tagline）は 6-8 に置く。

### D-2. 14番が生成する 1:1 文書（見積書・提案書 PDF）でのモニター割引・助成金注記の扱い ＝ 確定

- 対象: `main.js` L469（モニター注記）・L471–475（助成金ブロック）・L560（助成金脚注）、`renderer/index.html` L121・L124–125・L143–145、`renderer/app.js` L349–351。
- **助成金注記＝完全削除。** 以下をすべて撤去する。
  - `renderer/index.html` L124–125 の `e-subsidy` トグル（label・input・説明テキスト）。
  - `renderer/index.html` L143–145 の `e-subsidy-preview` プレビュー文。
  - `main.js` L471–475 の見積書PDF「公的支援（助成金・補助金）について」ブロック（L473 の絵文字🎁 を含む）。
  - `main.js` L560 の提案書PDF 脚注（「※ご利用いただくサービスは、要件を満たす場合に人材開発支援助成金・IT導入補助金など…」）。
- **理由**: 個人事業主は教育訓練機関要件を満たせず、助成金による訴求根拠がない。1:1 文書であってもコンプライアンス上、助成金には触れない（決定8「撤回承認済み」と整合）。
- **モニター割引＝機構は残すが既定 OFF ＋ ラベル変更。**
  - `renderer/index.html` L121 の `e-monitor` トグルの表示（`<span>`）を「モニター価格適用（30%引き）」（現物の文言は「適用する（30%引き）」）から **「特別価格を適用する」** に変更する。
  - 見積書PDF（`main.js` L469）の「※ モニター価格適用（30%引き）」表記を **「※ 特別価格適用」** に変更する。
  - 割引率（`renderer/app.js` L349–351 付近の `×0.7`）は内部設定値として保持し、1:1 交渉の内部レバーとして温存する。
  - 既定は未チェック（OFF）。

### D-3. 対外非表示コース（②〜⑤）の見積プルダウン・推薦での扱いと、研修セット/パッケージ価格の整合 ＝ 確定

- **②〜⑤は削除しない。「要お問い合わせ」表示・`value` 空で残す。**
  - `detail.html` の見積プルダウン: ②③④＋新⑤を `option` として残し、表示は「② 実践編（文書系）｜要お問い合わせ」等、`value=""`。
  - `detail.js` の `FALLBACK_RECOMMENDATIONS`: ②〜⑤を rank1 に据えず、言及する場合は `price` を「要お問い合わせ」にする。
  - Netlify Functions（`generate-library.js` の `servicesCatalog` ほか）: ②〜⑤の行は残すが価格を「要お問い合わせ」に。
  - `value` 空により、`estimate.js` / 14番 `parsePriceStr` の見積金額計算には載らない。
- **価格は v3 正本の「10時間パッケージ 400,000〜560,000円」を正とする。**
  - 現行 `prices.html` の全コースセット価格「459,000円／578,000円」をこの数値（レンジ表記は v3 正本に合わせる）に置換する。
  - 提案書の A表（A-9）・B表（`detail.js` L261、`prices.html` セット価格行）・C案（C-3・C-4・C-8）の該当行を本改訂でこの数値に更新済み。

### D-4. 新コース⑤「AI活用ルール・運用定着編」の設計文書の新規作成 ＝ 確定（別タスクへ切り出し）

- **新⑤の台本・受講案内・アンケートの新規作成は本提案書の対象外。** 別タスクとして実施する。
- 本提案書がカバーする研修資料（`training-materials/`）対応は次の 2 点のみ:
  1. コース番号の **⑥への改番**（Claude Code 特化コースを ⑤ → ⑥）。
  2. **サービス名の是正**（旧称 → AI実務研修／個別業務設計／AI活用伴走）。
- 旧 `script_course05.md`（内容＝Claude Code 特化）は **`script_course06.md` にリネームする**（内容は⑥として維持し、見出し・本文の「コース⑤」表記を⑥へ）。
- 出力済みスライド `course05_jissen_claude_code.pdf` / `.pptx` を⑥として再生成・リネームするかは、別タスクで判断する。

### D-6. 14番「AI経営改善パッケージ」の圧縮版（270,000円）・拡張版（540,000円）の扱い ＝ 確定

- **14番の内部見積オプションとして残す。** 既定＝標準版（360,000円・3か月）。
  - `main.js` L132–141・L566–573 は 3プラン選択（圧縮版・標準版・拡張版）を内部的に維持する。
  - ただし **PDF 出力時の対外表記は標準版（360,000円）のみ** とする。提案書PDFのスケジュール表の「（標準版）」「（拡張版）」表記・4か月目行は、標準版選択時には出力しない。
- 対外提案書PDFの価格表示は単一（360,000円）。`prices.html`（対外）も 360,000円 単一表示で確定（C-8）。

### D-7. 助成金申請用に退避する内部資料の置き場所（C-8-2 関連）＝ 確定

- `prices.html` L475–487 の「専門家謝金単価」表は `prices.html` から **削除する**。
- 数値（A 経営改善指導 25,000円／B 業務改善指導 20,000円／C 技術指導 15,000円）は、`C:\Users\ooto\work\中小企業向けAI活用支援事業\` 配下の内部資料（**非公開・リポジトリ外**）へ退避する。
- 退避作業自体は下流セッションまたはユーザーが実施する。**退避が完了するまでは `prices.html` からの当該表の削除を保留してよい**（数値の逸失を防ぐため）。

> ※ 以下は本書のさらに前の初期ドラフトで採番されていた論点で、現行の D-2〜D-7 とは別物。初期ドラフト D-1（診断ドメイン）は前提 P-a で解決 → 1.3 へ移動。初期ドラフト D-5（旧 GitHub Pages 診断URL の撤去範囲）は、HP 側 CTA 差し替えが別セッション（handoff §A）、13番側は C-6（当面 ai-shindan-zatuneya で整合済み）に集約されるため、独立論点としては解消。ドメイン確定時の一括再置換タスクとして C-6 と C-14 に明記済み。初期ドラフトの「サービス名称リネームの伝播範囲」論点は名称が handoff(5) で確定したため解消。契約書ひな型（リポジトリ外）への伝播のみ 1.4 の対象外表に留置。初期ドラフトの「拠点表記」論点は copy §1「府中市を拠点に、近隣の地域企業を訪問して支援」で確定 → 解消。

---

## 6. 実装時の注意

### 6-1. 13番 Netlify Functions ↔ 14番の「サービス名称・推薦 service 文字列」は同時変更が必要

- 13番 `generate-library.js`（および `detail.js` `FALLBACK_RECOMMENDATIONS`）が出力する推薦の `service` 文字列は、そのままエクスポート JSON に入り、14番 `main.js` `getServiceDeliverables()` の `n.includes(...)` マッチキーになる。
- C-3・C-5（推薦ロジック改修）と C-9（名称リネーム）と C-11（⑥分岐追加）は**1つの変更セットとして扱い**、13番の出力文字列と 14番のマッチ文字列を突き合わせてから確定する。
- 検証: 13番で各ステージ（準備期/導入期/活用期/推進期）の診断 → エクスポート → 14番で読み込み → `getServiceDeliverables()` が `null`（対応不可）を返さないことを、4パターン全てで確認する。
- 特に「AI経営改善パッケージ」を新たに推薦に載せる場合、14番 L134 `n.includes('AI経営改善パッケージ')` は現状で通るが、`detail.js` / `generate-library.js` が出す文字列が完全一致するか要確認。

### 6-2. 診断URLは「当面値」であり、ドメイン確定時に再作業が発生する

- C-6 の統一先 `https://ai-shindan-zatuneya.netlify.app/` は暫定。レンタルサーバ契約・独自ドメイン取得後に、canonical（13番全HTML）・`sitemap.xml`・`robots.txt`・`save-inquiry.js` のフォールバック値・`README.md`・（別セッションで）HP v3 側の全 CTA を最終URLへ一括置換する。
- この再作業を軽くするため C-14（参照集約）を P2 で提案。最低限、README にドメイン確定時のチェックリスト（置換対象ファイル一覧）を残す。
- HP v3 側の正本（spec §4・copy）は文言上 `han-ai-diagnosis.netlify.app` のままだが、別セッションが commit 0bcceea で handoff を `ai-shindan-zatuneya` 当面運用に修正済み。**13番・14番の実装は `ai-shindan-zatuneya.netlify.app` を使う**（`han-ai-diagnosis` は稼働未確認のため使わない）。

### 6-3. CSS・UI のルール

- モニター/助成金ブロック削除で未使用になる CSS ルール（`prices.css` の `subsidy-*` / `monitor-*` / `hook-box` 等）は、同じ変更セット内でまとめて削除する（CLAUDE.md「コメントアウトされた死にコードの削除」「最適化の中身」）。削除範囲はレビューで確認。
- 跡地に追加する `entry-note`（C-2）等の余白・サイズは CSS クラスで定義する。`innerHTML` 動的生成要素を含め、インライン style を新規に足さない（CLAUDE.md ルール3）。
- `alert` / `confirm` / `prompt` を新規に足さない（CLAUDE.md ルール4）。

### 6-4. 14番の 1:1 文書のモニター/助成金要素（D-2 確定済み）

- handoff(7)(8) の「対外物では廃止／一切触れない」は広告物（HP・チラシ・名刺）に対する決定。14番が出す見積書・提案書 PDF は特定クライアント向けだが、D-2 の確定により次のとおり扱う。
  - **助成金注記は 1:1 文書でも完全削除**（`main.js` L471–475・L560、`renderer/index.html` L124–125・L143–145）。
  - **モニター割引は機構を内部レバーとして温存・既定OFF・ラベルを「特別価格」に変更**（`main.js` L469、`renderer/index.html` L121、`renderer/app.js` L349–351 の `×0.7` は保持）。
- 詳細は D-2 を参照。

### 6-5. 研修スライドの再生成

- `training-materials/*.py` はスライド（PDF/PPTX）生成スクリプト。コース番号・サービス名の定数を直しても、既存の `course05_jissen_claude_code.pdf` / `.pptx` は再生成しない限り古いまま。本提案書の対象はコース番号の⑥改番とサービス名是正まで（D-4 確定）。`script_course05.md` → `script_course06.md` のファイル名リネームは実施するが、スライド（PDF/PPTX）の⑥としての再生成・リネームは別タスクで判断・実施する。

### 6-6. 検証（下流編集セッション向け）

- 13番 HTML: 幅 375 / 768 / 1280px のスクリーンショットで表崩れ・横スクロールなし、削除ブロック跡地のレイアウト崩れなし、内部リンク切れなし。
- 13番 Functions: モック（ダミー API キー）でのローカル実行に加え、推薦 service 文字列と 14番マッチキーの突合（6-1）。
- 14番: Electron 統合テストのうちサービス名・成果物判定に関わる分。
- リポジトリごとに `git diff --check`（whitespace エラーなし）を通す。
- CLAUDE.md「『完了』の定義」に従い、検証結果（項目数・スクショ）を報告に載せる。

### 6-7. コミット境界（提案）

- 変更セット 1: 13番の助成金・モニター削除（C-1・C-2・C-8 の prices.html 部分）。
- 変更セット 2: 13番の推薦ロジック・Functions・サービス名（C-3・C-4・C-5・C-9・C-10 の 13番部分）＋ 14番のマッチ文字列（C-9・C-11 の 14番部分）＝ 6-1 の理由で同一コミット推奨。
- 変更セット 3: 研修資料の6コース化・サービス名（C-7・C-9 の training-materials 部分）。
- 変更セット 4: ドキュメント（C-12・C-13）。
- D-2・D-3・D-4・D-6・D-7 は 2026-08-31 に確定済み。各確定内容は変更セット 1〜4 に織り込んで実施する（D-4 の新⑤設計文書の新規作成のみ別タスク）。

### 6-8. 実装時にユーザー確認する非ブロッカー項目（C-5・C-9・C-10）

以下は D 節（確定方針）には含めない。**下流セッションが具体案を提示し、実装時にユーザー確認して確定する**もの。方針そのものは確定しており、これらは文言の詰めであってブロッカーではない。

- **C-5 のペルソナ文言**（`generate-library.js` L66 / `generate-comment.js` L20）: 案 a（copy §3 の3本柱に忠実な長め）／案 b（差分最小の簡潔版）のいずれかを下流が提示しユーザー確認。
- **C-9 の optgroup ラベル新表記**（`detail.html` の見積プルダウン等）: 新サービス名（AI実務研修／個別業務設計／AI活用伴走）を反映した具体的なラベル文字列・option テキストを下流が提示しユーザー確認。
- **C-10 の footer tagline 新文言**（`prices.html` L652 ほか）: 「地域企業の業務変革を、広島県府中市から。」等の候補から下流が提示しユーザー確認。

---

## 付録: 本書作成時に現物確認した行番号（裏取り済み）

| ファイル | 確認した箇所 | 結果 |
|---|---|---|
| `13_ai-diagnosis-tool/prices.html` | L63–69 subsidy-banner／L136–140 monitor-alert／L143–145 hook-box／L308–327 モニター価格table／L311 monitor-title／L332 見出し／L432 choice-guide-footer／L436–490 SERVICE 02／L475–487 謝金単価table／L489 plan-note／L633 cta-sub／L640–644 price-notes／L18 site-logo__pre／L652 footer tagline／L7 canonical | ドラフト記載と一致 |
| `13_ai-diagnosis-tool/detail.js` | L246–263 FALLBACK_RECOMMENDATIONS／L248・L261「全5コース」＋モニター価格／L257・L261 reason の助成金文言／L9 業種選択肢（製造業＝クライアント業種であり経歴ではない） | ドラフト記載と一致（L9 は除去不要と判断） |
| `13_ai-diagnosis-tool/detail.html` | L235–267 見積プルダウン／L237 optgroup「研修（モニター価格あり・先着3社）」／L238–247 option（モニター価格併記）／L246–247 ⑤ Claude Code／L249・L253・L259 他 optgroup ラベル／L321 footer copy「© 2026 ざつね屋」 | ドラフト記載と一致（他 optgroup ラベルの旧称を B-1 に追記） |
| `13_ai-diagnosis-tool/netlify/functions/generate-library.js` | L37–64 servicesCatalog（「広島県福山市近郊版」L38・モニター価格・⑤ Claude Code）／L66 ペルソナ「中小企業向けAI活用コンサルタント」／L97–107 推薦ルール | ドラフト記載と一致 |
| `13_ai-diagnosis-tool/netlify/functions/save-inquiry.js` | L6 `SITE_URL = 'https://zatune-gif.github.io/kurashi-no-dodai-log/han-ai.html'` | ドラフト記載と一致 |
| `13_ai-diagnosis-tool/sitemap.xml` | L3–20 の6 `<loc>` が全て `https://ai-shindan-zatuneya.netlify.app/*` | 既に当面ターゲットと一致（C-6 で変更不要） |
| `13_ai-diagnosis-tool/{detail,curriculum,diagnosis-simple,estimate}.html` | L7 canonical が全て `ai-shindan-zatuneya.netlify.app` ／ `site-logo__pre`「中小企業向けAI活用支援の」／footer copy「© 2026 ざつね屋」 | canonical・copy は変更不要、`site-logo__pre` は要変更（C-10） |
| `14_proposal-generator/main.js` | L70–145 getServiceDeliverables（L76・L86 旧称マッチ／L125–129 ⑤ Claude Code 分岐／L132–141 経営改善パッケージ・L133 コメント「圧縮版・標準版・拡張版」・L135–140 成果物）／L164 プロンプト「広島県福山市近郊の中小企業向けAI活用支援専門家」／L469 モニター注記／L471–475 助成金ブロック（L473 絵文字🎁）／L560 助成金脚注／L566–573 スケジュール表（標準版/拡張版）／L587「広島県福山市近郊の中小企業・小規模事業者に特化」 | ドラフト記載と一致 |
| `14_proposal-generator/renderer/index.html` | L121 e-monitor「適用する（30%引き）」／L124–125 e-subsidy `checked`／L143–145 subsidy-preview | ドラフト記載と一致 |
| `training-materials/` | `notice_template.md` L117・`survey_template.md` L133「コース⑤：実践編（Claude Code特化）」／`survey_template.md` L62「AI業務改善オーダーメイドサービス」／`script_course05.md` 全体が⑤=Claude Code／`generate_courses_02_05.py` L749・L763・L768・L980／`generate_course01.py` L655・L658 | ドラフト記載と一致（助成金・「福山」「製造業」の語は training-materials 内に検出されず） |

---

## 更新履歴

- 2026-08-31: 初版作成（提案・ユーザー承認前）。Codex 版→v3 正本の変更点 A-1〜A-16、波及先ファイル（13番／14番／`training-materials/`）、P1〜P3 の変更提案 C-1〜C-16、要ユーザー判断の残論点 D-2〜D-7。
- 2026-08-31: D-2〜D-7 ユーザー承認により確定版化。D 節を「D. 確定した方針（ユーザー承認済み 2026-08-31）」に改題し、A表（A-5・A-9・A-10・A-11）・B表（B-1 prices.html／B-2 14番／B-3 研修）・C案（C-3・C-4・C-5・C-8）の該当箇所を確定内容に更新。全コースセット価格を v3 正本の 400,000〜560,000円に統一（旧 459,000／578,000 を置換）。非ブロッカーの文言確認項目（C-5・C-9・C-10）を 6-8 に集約。
