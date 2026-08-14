# ざつね屋HP共同運用の実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Claude CodeとCodexが同じざつね屋HPを安全に共同運用できるルールファイルとGit同期手順を整備する。

**Architecture:** `zatuneya-hp/AGENTS.md`を共同ルールの正本とし、`zatuneya-hp/CLAUDE.md`はClaude Codeが正本へ到達する最小入口とする。サイト本体は変更せず、サブモジュールのコミット・push後に親リポジトリのgitlinkをコミット・pushする二段階同期を使う。

**Tech Stack:** Markdown、Git submodule、PowerShell 5.1、GitHub Pages

---

## File Structure

- Create: `zatuneya-hp/AGENTS.md` — CodexとClaude Codeが共有するHP運用ルールの正本
- Create: `zatuneya-hp/CLAUDE.md` — Claude Code向けの入口。正本を重複記載しない
- Modify: 親リポジトリの`zatuneya-hp` gitlinkのみ
- Do not modify: `zatuneya-hp/`配下のHTML、CSS、JavaScript、画像、その他assets
- Protect: 親リポジトリ直下の未追跡`AGENTS.md`。追加・移動・削除・上書き・stagingをしない

### Task 1: 事前状態と対象ファイルを確認する

**Files:**
- Verify: 親リポジトリの状態
- Verify: `zatuneya-hp/`サブモジュールの状態

- [ ] **Step 1: 親リポジトリの変更を記録する**

Run: `git status --short --untracked-files=all`

Expected: 親直下の未追跡`AGENTS.md`を含む現在の一覧を記録し、以降そのファイルを操作しない。

- [ ] **Step 2: サブモジュールの変更を記録する**

Run: `git -C zatuneya-hp status --short`

Expected: サブモジュール内の既存変更一覧を記録し、既存変更を上書きしない。

- [ ] **Step 3: 作成対象の不存在を確認する**

Run: `Test-Path 'zatuneya-hp/AGENTS.md'; Test-Path 'zatuneya-hp/CLAUDE.md'`

Expected: 両方とも`False`。いずれかが`True`なら既存ファイルを変更せず停止して報告する。

### Task 2: 共同運用ルールファイルを作成する

**Files:**
- Create: `zatuneya-hp/AGENTS.md`
- Create: `zatuneya-hp/CLAUDE.md`

- [ ] **Step 1: `zatuneya-hp/AGENTS.md`を次の完全な本文で作成する**

```markdown
# ざつね屋HP 共同作業ルール

このサイトを扱うすべての作業では、利用者・関係者に配慮した敬語で記述してください。

## 役割

- Codexは、ざつね屋HPの開発・保守の主担当です。通常変更の実装、検証、Git履歴の記録を担当します。
- Claude Codeは、暮らしの土台およびざつね屋事業全体の統括を担当します。事業方針との整合、大規模変更、横断的な判断を確認します。
- ChatGPTは、デザイン検討、カンプ作成、全体ディレクションを担当します。

通常のHP実装はCodexが担当します。Claude Codeが直接変更する場合も、この文書とGit手順を守ってください。

## 作業場所と変更範囲

通常作業は`main`ブランチで行います。サービス、価格、ブランド、外部ツール接続、URL・公開方式、親リポジトリ構成を変更する大規模変更だけは、`codex/...`ブランチとworktreeを使います。

作業前に必ず`git status --short`を実行し、未コミット変更を上書きしないでください。既存の不整合は別タスクで扱い、この作業で新たな不整合を増やさないでください。

## 公開情報

- 公開正本は`index.html`です。`index-v2.html`は候補ファイルのため、変更前にどちらを扱うか判断してください。
- 公開URLは`https://zatune-gif.github.io/zatuneya-hp/`です。
- AI活用診断のURLは`https://han-ai-diagnosis.netlify.app/`です。

## デザインと実装の制約

- カラートークンは`#EFF4F5`、`#5BBDC8`、`#F8981D`を使い、書体はRobotoとNoto Sans JPを使います。
- インラインstyle、`alert`、`confirm`、`prompt`を使わないでください。
- SVGはモノラインで統一し、写真は顔を判別できないものを使ってください。
- 著作権表記は`© [年] ざつね屋`に統一してください。
- `nav.js`が参照する`#nav-hamburger`、`#site-nav`、`.site-nav__dropdown-trigger`、`.fade-in`、`#sticky-cta`を壊さないでください。
- ヘッダー、フッター、CTAを変更した場合は、15ページのHTMLを整合させてください。

## 検証

HTML、CSS、JavaScript、assetsに変更がある場合は、Playwrightで幅375px、768px、1280pxを確認し、外部リンク、canonical、sitemap、著作権表記を検証してください。

## 同期と記録

- サブモジュール内では、対象ファイルだけをcommitしてpushしてください。
- 次に親リポジトリでgitlinkだけをcommitしてpushしてください。
- 恒久的ルールは`AGENTS.md`、変更履歴はGit、設計判断はObsidianに記録してください。
```

Expected: 役割、作業場所、公開情報、デザイン制約、DOM契約、15ページ整合、検証範囲、二段階Git同期、記録先をすべて含む。

- [ ] **Step 2: `zatuneya-hp/CLAUDE.md`を次の完全な本文で作成する**

```markdown
# Claude Code向け案内

作業を始める前に、必ず`AGENTS.md`を読んでください。`AGENTS.md`がざつね屋HPの共通ルールの正本です。

Claude Codeは暮らしの土台およびざつね屋事業全体の統括を担当します。通常のざつね屋HP実装はCodexが担当します。

Claude CodeがHPを直接変更する場合も、`AGENTS.md`の変更範囲、事前のGit状態確認、検証、サブモジュールのcommit・push後に親リポジトリのgitlinkをcommit・pushする手順に従ってください。
```

Expected: `AGENTS.md`を最初に読むこと、Claude Codeの役割、通常実装の担当、直接変更時の遵守事項だけを記載し、正本本文を重複させない。

- [ ] **Step 3: サブモジュールの変更対象を確認する**

Run: `git -C zatuneya-hp diff --name-only; git -C zatuneya-hp status --short`

Expected: 新規対象は`AGENTS.md`と`CLAUDE.md`だけで、HTML、CSS、JavaScript、assetsの変更を混在させない。別ファイルの変更があれば停止して報告する。

### Task 3: 検証し、対象計画書だけをコミットする

**Files:**
- Verify: `00-01_han-ai/docs/superpowers/plans/2026-08-14-zatuneya-hp-agent-coordination.md`
- Commit: `00-01_han-ai/docs/superpowers/plans/2026-08-14-zatuneya-hp-agent-coordination.md`

- [ ] **Step 1: 計画書の要件を機械的に確認する**

Run: `rg -n 'For agentic workers|\*\*Goal:\*\*|\*\*Architecture:\*\*|\*\*Tech Stack:\*\*|zatuneya-hp/AGENTS\.md|zatuneya-hp/CLAUDE\.md|サイト本体|PowerShell 5\.1|Obsidian' '00-01_han-ai/docs/superpowers/plans/2026-08-14-zatuneya-hp-agent-coordination.md'`

Expected: writing-plans指定のheader、完全な`AGENTS.md`本文と`CLAUDE.md`本文、設計書末尾の共同運用要件、サイト本体変更禁止、PowerShell 5.1互換コマンドが本文にあることを目視でも確認する。

- [ ] **Step 2: 空白エラーを確認する**

Run: `git diff --check -- '00-01_han-ai/docs/superpowers/plans/2026-08-14-zatuneya-hp-agent-coordination.md'`

Expected: 出力なし、終了コード0。

- [ ] **Step 3: 計画書だけをstagingする**

Run: `git add -- 00-01_han-ai/docs/superpowers/plans/2026-08-14-zatuneya-hp-agent-coordination.md`

Expected: `git diff --cached --name-only`の出力が対象計画書1件だけで、親直下の未追跡`AGENTS.md`は含まれない。

- [ ] **Step 4: 指定メッセージでコミットする**

Run: `git commit -m "docs: ざつね屋HP共同運用の実装計画を追加"`

Expected: 対象計画書だけを含むコミットが作成される。pushは実行しない。

- [ ] **Step 5: コミット後の状態を確認する**

Run: `git status --short --untracked-files=all; git show --stat --oneline --summary HEAD`

Expected: HEADの直前コミットが指定メッセージで、コミット対象は計画書1件だけ。親直下の未追跡`AGENTS.md`は未追跡のまま残る。push結果は「未実行」と報告する。

## Completion Boundary

- この計画で変更するファイルは、親リポジトリの対象計画書だけとする。
- `zatuneya-hp/AGENTS.md`、`zatuneya-hp/CLAUDE.md`、サイト本体、その他の親リポジトリファイルは、この計画の実行時には変更しない。
- 親リポジトリ直下の未追跡`AGENTS.md`は保護し、stagingにも含めない。
- Gitの競合、push拒否、対象外変更、既存の対象ファイル発見時は履歴を書き換えず、状況を報告して停止する。
- 今回は計画書のみの変更なので、ブラウザ画面確認、サブモジュールcommit、サブモジュールpush、親gitlink更新、push、Obsidian書き込みは実行しない。

## Final Verification

- [ ] **Step 1: 変更ファイルを最終確認する**

Run: `git diff HEAD^ HEAD --name-only`

Expected: `00-01_han-ai/docs/superpowers/plans/2026-08-14-zatuneya-hp-agent-coordination.md`だけが表示される。

- [ ] **Step 2: 対象外変更とpush未実行を報告する**

Report: 修正有無、`git diff --check`の終了コードと出力、コミットhash、コミット対象ファイル、親直下の未追跡`AGENTS.md`を触っていないこと、push未実行、最終`git status --short --untracked-files=all`を記載する。

## Plan Quality Check

- すべてのタスクを、事前確認、本文作成、検証、対象計画書だけのcommitに分ける。
- PowerShell 5.1で実行できるコマンドだけを使う。
- 実装内容が特定できない保留表現や曖昧な指示を計画書に置かない。
- サイト本体の変更を計画せず、対象外変更があれば停止する。
- 予定する`AGENTS.md`と`CLAUDE.md`の本文を省略せず記載する。
- 設計書末尾の役割分担、正本と入口、Git運用、記録の役割、現状リスク、今回の範囲を各タスクまたは完了境界で扱う。
