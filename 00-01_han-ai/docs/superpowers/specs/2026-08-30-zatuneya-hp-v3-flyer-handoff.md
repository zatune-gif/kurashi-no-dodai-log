# ざつね屋 v3 チラシ 引き継ぎ（別セッション用）

- 日付: 2026-08-30
- 状態: チラシは HP 本体とは別セッションで進行。GPT にデザインカンプ作成を依頼済み（ユーザー操作）
- デザインの正本: `2026-08-30-zatuneya-hp-v3-henkakuya-design.md`（Codex版・確定仕様。§2 ブランド確定事項／§5 デザインシステム）。**HP・チラシのデザインは Codex 版を正とする（ユーザー指示 2026-08-30）**
- チラシ要件・名刺要件は本引き継ぎ文の該当ブロックが正本。意思決定の全体像は Obsidian `01_Projects/zatuneya-hp/HP-v3-要件定義_2026-08-30.md`（決定事項1〜19）

---

## 引き継ぎ文（別セッションにそのまま貼る）

```
【引き継ぎ】ざつね屋 v3 チラシ（地域企業の小さな業務変革屋）の制作

■ 目的・現在地
- ざつね屋HPを「地域企業の小さな業務変革屋」へ全面改訂する v3 プロジェクトの一環。
  HP本体は別セッションで進行中（GPTカンプ → Codexが実装計画作成中 → Claude Codeが実装・検証・統合）。
- このセッションは「チラシ」だけを担当する。名刺（後述）も同じ土台なので必要なら一緒に扱ってよい。
- GPT に既にチラシのデザインカンプ作成を依頼済み（ユーザー操作）。カンプが返ってきたら実装工程に入る。
- リポジトリ: C:\Users\ooto\work\ClaudeCode\kurashi-no-dodai-log（GitHub: zatune-gif/kurashi-no-dodai-log、main。作業前に git pull）

■ セッション開始時にやること
1. 下記「参照すべきソース」を全件読む（特に要件定義書 §2 ブランド基盤 と §4 チラシ要件）
2. Obsidian vault を「ざつね屋」「チラシ」「v3」で検索し、関連ノートを確認
3. ListAgents で稼働中のピアセッションを確認し、ダッシュボード更新前に状況を照会

■ 参照すべきソース（全件読む）
- 00-01_han-ai/docs/superpowers/specs/2026-08-30-zatuneya-hp-v3-henkakuya-design.md  ← Codex版・デザインの正本（HP・チラシのデザインは Codex版を正とする）。§2 ブランド確定事項・§5 デザインシステム
- Obsidian 01_Projects/zatuneya-hp/HP-v3-要件定義_2026-08-30.md  ← 意思決定の全体像（決定事項1〜19）。チラシ要件・名刺要件は本引き継ぎ文が正本
- 00-01_han-ai/docs/superpowers/specs/2026-08-30-zatuneya-hp-v3-top-page-copy.md   ← コピーのトーン・言い回しの正本
- 00-01_han-ai/docs/superpowers/specs/2026-08-30-zatuneya-hp-v3-gpt-comp-brief.md  ← GPTに渡した確定仕様（デザイン制約の書き方の参考）
- 00-01_han-ai/design-comps/zatuneya-hp/                                          ← 承認済みデザインカンプ（視覚の正本）
- メモリ: project_zatuneya_hp.md（v3の経緯・状態）／ project_revenue_standard.md（価格の正本）
- Obsidian: 01_Projects/zatuneya-hp/HP-v3-要件定義_2026-08-30.md（セッション記録版）

■ チラシ要件（確定）
- サイズ: A4・両面
- 配布経路: 商工会議所・交流会での手渡し（名刺とセット）
- 目的: 「何をしている人か」を伝え、HP・無料診断へ誘導する。読ませすぎない
- 掲載内容（優先順）:
  1. 肩書「地域企業の小さな業務変革屋」＋標語「AIを入れることより、仕事がよくなることから。」
  2. どんな困りごとに応えるか（数十名規模の地域企業向け・2〜3点。例：人手不足で改善に手が回らない／属人化／同じ作業の繰り返し）
  3. 主力＝AI経営改善パッケージ（360,000円／3か月）の要点（3か月で一つの業務を手順ごと入れ替える、等）
  4. 次の一歩＝QRを2つ（① 無料診断 https://han-ai-diagnosis.netlify.app/  ② HP https://zatune-gif.github.io/zatuneya-hp/ ）
  5. 屋号「ざつね屋」・氏名「大音 晃司（おおと こうじ）」・連絡先 zatuneya@gmail.com・© 2026 ざつね屋
- 3サービス（AI実務研修／個別業務設計／AI活用伴走）は名前だけ触れてよいが、詳細はHPへ誘導
- 掲載しないもの: 助成金・補助金、農業、移住、モニター割引、研修②〜⑤の個別価格、克明にできない実績数値
- 入稿: ネット印刷前提（塗り足し3mm・CMYK・フォントアウトライン化。仕上がりA4=210×297mm、塗り足し込み216×303mm）

■ デザインシステム（GPTカンプ・実装ともに厳守。HPと共通）
- カラー3色: 地 #EFF4F5 ／ ティール #5BBDC8 ／ オレンジ #F8981D。CTA帯は濃ティール #173F46 可
- フォント: 本文 Noto Sans JP＋Roboto（数字英字）、見出しに明朝（Noto Serif JP / Shippori Mincho）
- WCAG AA相当のコントラスト（オレンジ地×白文字は不可）
- アイコンは絵文字禁止、モノラインSVG。写真を使うなら顔が判別できない構図
- 4pxグリッド。字間0.02em、本文行間1.6以上、見出し1.3
- Bootstrap/Material的な「いかにもデフォルト」を避ける

■ 制作ワークフローと成果物
1. GPT がデザインカンプを作成（依頼済み・返却待ち）
2. カンプが来たら実装方式を決める：
   - 案A: HTML＋印刷用CSS（@page A4、塗り足し、trim marks）→ ヘッドレスChromeでPDF化
   - 案B: SVG入稿（Illustrator互換）
   → 非デザイナーが増刷・微修正しやすい案Aを推奨
3. Claude Code が印刷入稿用PDF（A4両面・塗り足し3mm・CMYK考慮・アウトライン）を作成
4. 検証: 幅を変えての表示確認ではなく「実寸PDFで文字切れ・塗り足し・解像度(画像350dpi相当)・QR読み取り」をチェック。QRは実機スキャンで遷移先を確認
5. 置き場所（提案）: 00-01_han-ai/flyer-henkakuya/  ※このリポ内。zatuneya-hpサブモジュールには入れない
6. commit + push、Obsidianに記録

■ 他セッション・ダッシュボードとの調整
- HP v3本体は別セッション（Codex実装計画進行中、Claude Codeがレビュー済み）。デザインシステムの解釈がずれないよう、迷ったら要件定義書§2.11に従い、HP側セッションに SendMessage で確認
- 案件ダッシュボード: 正Artifact URL https://claude.ai/code/artifact/34257a38-5ce4-4e4a-9e7a-49dc7698f73a
  ソース C:\Users\ooto\work\ClaudeCode\dashboard\案件ダッシュボード.html（別リポ zatuneya-ops。github.com/zatune-gif/zatuneya-ops）
  更新手順: ①zatuneya-ops を git pull ②同セッションで Artifact(action:"read", url:上記) を先に実行 ③ソース編集 ④Artifact(action:"publish", file_path:上記, url:上記, favicon渡さない, force禁止) ⑤zatuneya-ops を commit+push
  既存カード「Codex生成の事業計画・ポジショニング提案（レビュー用）→ ざつね屋HP v3」（id: han-ai-codex-proposal、半AI＞ざつね屋＞HP案件配下）が v3 全体を代表している。チラシは別カード新設ではなく、まず ListAgents でダッシュボード担当セッションに確認してから、このカードの next に「チラシ制作」を1行足すか、サブ行を作るか相談する

■ 未決・注意点
- 実績の匿名事例（元ネタ）はユーザー未提供。チラシは実績に依存しない構成なので影響は小さいが、実績を載せるなら元ネタが来るまで保留
- HP v3 はまだ本番未公開。HPのQRは公開URL（https://zatune-gif.github.io/zatuneya-hp/）で固定してよいが、v3公開前に増刷すると旧サイトに飛ぶ点をユーザーに一言確認する。無料診断QR（Netlify）は安定
- 名刺（要件定義書§5）も未着手。両面・表＝氏名/屋号/肩書/メール/HP URL、裏＝標語＋できること3点＋無料診断QR。チラシと同じ入稿ワークフローなので、このセッションで続けて扱ってよい

■ モデル
定型的なコーディング・レイアウト実装・PDF化が中心なので sonnet-worker で十分。新規デザイン判断が必要な局面のみ Opus を検討。
```
