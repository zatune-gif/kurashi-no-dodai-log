# Codex 実装計画レビュー：v3 TOPページ

- 日付: 2026-08-30
- レビュー対象: `2026-08-30-zatuneya-hp-v3-top-page.md`（Codex 生成・未完成ドラフト）
- レビュー者: Claude Code (Sonnet)
- 基準: `2026-08-30-zatuneya-hp-v3-henkakuya-design.md`（要件定義書）／ `zatuneya-hp/AGENTS.md`
- ※本レビュー中の『要件定義書 §3.2 / §3.1 / §10 …』は 2fb59a5 以前の版の章番号。現行の Codex版（同ファイル名）では章立てが変わったため、該当内容は Obsidian『HP-v3-要件定義_2026-08-30.md』の決定事項および AGENTS.md を参照。

## 総評

骨格は良好。TDD（契約テスト RED → 実装 GREEN → CSS → スクショ → 最適化）、`nav.js` の DOM 契約維持、プレースホルダ実績の `data-case-status="placeholder"` ＋開示文、インラインstyle/絵文字/alert 禁止アサート、オレンジ地×白文字禁止のCSS＋アサート、HTTPサーバー経由のブラウザ検証、二段階Git同期、証拠付き完了報告 — 要件定義書と AGENTS.md の主要点を押さえている。`data-asset-role` で画像を `src` 差し替えだけで回せる設計も良い。

セクションID（hero/problems/value/growth/package/services/journey/why-us/cases/tools/faq/final-cta）は本文正本 §1〜§12 と順序一致。`requiredCopy` の見出し13件も本文正本と一致（入れ子鉤括弧の修正版と整合）。

## 指摘（優先度順）

### HIGH

1. **作業ブランチが無い。** Task 6 は `git -C zatuneya-hp commit` を直接叩き、チェックアウト中ブランチ（＝main想定）にコミットする読み。v3 は AGENTS.md の「大規模変更（ブランド・打ち出しを変える）」に該当 → `codex/v3-henkakuya` ブランチ（または worktree）で作業し、Claude Code が差分を確認してから main へ統合。冒頭に `git -C zatuneya-hp checkout -b codex/v3-henkakuya`、末尾は「直接 push で完了」ではなく「レビュー用 push → Claude Code が統合判断」。
2. **axe と Lighthouse が無い。** AGENTS.md の検証必須：axe（アクセシビリティ）と Lighthouse 4指標（Performance / Accessibility / Best Practices / SEO）各90以上を測定（対象 `v2/index.html`）。Task 4 か Task 6 に追加。
3. **クロスブラウザが Chromium のみ。** AGENTS.md「レイアウト・ナビ変更時は Chromium / Firefox / WebKit」。全面レイアウト変更なので3ブラウザで横スクロール・ナビ開閉を確認。
4. **OGP／meta description の更新が計画に無い。** ポジショニングが根本から変わるのに head は「既存 favicon・fonts・CSS を残す」だけ。`<meta name="description">`・`og:title`・`og:description`・`og:url`（v2 canonical）・`og:image` を新ポジショニングに更新する手順を明記。AGENTS.md 検証にも「メタタグ・OGP」あり。
5. **診断URLの当面値と差し替え方法を確定。** 当面のCTA遷移先は稼働中の `https://ai-shindan-zatuneya.netlify.app/` とし、最終URLは独自ドメイン取得後に確定する。実装は `v2/index.html` の `<meta name="zatuneya:diagnosis-url">` を唯一の値の保持場所とし、5本の `data-diagnosis-link` を `nav.js` がHTTPS検証後に有効化する。後日の切替はmetaの`content`を1箇所差し替えるだけで完了する。

### MEDIUM

5. **視覚の正本がローカルにしか無い。** `C:\Users\ooto\OneDrive\Desktop\Codex 画像 …png` と `C:\Users\ooto\.codex\attachments\…\pasted-text.txt` はリポ外。レビュアー・次セッションが参照できない。参考カンプをリポジトリに取り込む（`00-01_han-ai/design-comps/zatuneya-hp/` か `zatuneya-hp/v2/qa-screenshots/`）。
6. **本番置き換えの経路が未言及。** 要件定義書 §3.2：v3 は最終的に本番（ルート `index.html`）を置き換え、`index-v2.html` 廃止、`codex/zatuneya-hp-v2` ブランチ削除。今回のスコープ（TOP を /v2/ 内で作る）は妥当だが、この3つを「後続タスク」として計画に残す。さらに「実績プレースホルダを差し替えるまで /v2/ TOP を本番昇格しない」を明記。
7. **契約テストが見出しだけ。** 計画自身が「本文を一字ずつ参照する正本」と言っている（入れ子鉤括弧の揺れも実際に発生済み）。`requiredCopy` に Heroリード全文・お悩み4カード見出し・3本柱見出し・成長段階5ラベル・進め方5ラベル・FAQ3問・スティッキーCTA文言・各マイクロコピーの逐語を加え、言い換えを機械的に弾く。
8. **`.fade-in` の基底 animation 定義が CSS スニペットに無い。** reduced-motion アサート（`animationDuration === '0.01s'`）が意味を持つには基底で animation が宣言されている必要がある。かつ新TOPの `.fade-in` が既存 `nav.js` の IntersectionObserver（threshold 0.1・一度きり）で発火することも確認項目に。

### LOW

- アイコン寸法が `40px` / `44px` の生値。`--space-*` トークン運用と不整合（`--space-40` あり）。
- 見出し明朝が `Noto Serif JP` のみで Shippori Mincho を落としている（要件は「または」なので可。念のため記載）。
- 開示文「以下は仮データです。事実確認済みの匿名事例に差し替え予定です。」は計画で新規に作った文。本文正本 §9 の「方針」メモと表現を揃えるか、正本側に追記。
- 折返し下の画像に `width`/`height` 属性が無く CLS 懸念（Lighthouse を入れれば検出可）。

## 次アクション

- Codex に上記を反映依頼（要約は Obsidian ノート `HP-v3-要件定義_2026-08-30.md` の関連セクション、および本セッションのチャット参照）。
- Codex の改訂版が出たら、HIGH 4点が解消されているかを再チェックしてから実装フェーズ（Claude Code）へ。
