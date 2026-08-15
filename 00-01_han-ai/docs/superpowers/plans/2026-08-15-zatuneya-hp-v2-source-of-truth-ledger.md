# ざつね屋HP V2 正本台帳・ページ別実装指示

作成日: 2026-08-15
作成者: Claude Code（引き継ぎセッション）

## 背景（必読）

Codexが2026-08-15に一度V2を公開したが、TOPの視覚正本を`index-v2.html`と誤認していたことが判明した（Obsidian `01_Projects/zatuneya-hp/2026-08-15_codex-v2-implementation.md` 訂正追記参照）。
正しい正本は以下の2種類の**画像**のみである。HTML・計画書・過去実装は正本ではない。

- TOP: `C:\Users\ooto\AppData\Local\Temp\codex-clipboard-ee867c03-691a-4f5c-b29c-a9cee921d165.png`（1024×1536、左=Desktop、右=Mobile、1枚に併記）
- 下層5系統10枚: `00-01_han-ai/design-comps/zatuneya-hp/*.png`（Desktop 1440×1800、Mobile 390×1600）+ `00-01_han-ai/design-comps/zatuneya-hp/design-spec.md`

**実装者は、担当ページのカンプ画像を必ず自分のReadツールで直接開いて目視すること。** 本ドキュメントの文章説明はカンプの要約であり、正本そのものではない。文章と画像が食い違う場合は画像を優先する。

## 正本台帳

| ページ | PC/Mobile正本 | カンプパス | 実装ファイル | 対応URL | 担当 | 状態 |
|---|---|---|---|---|---|---|
| TOP | 併記1枚 | `%TEMP%\codex-clipboard-ee867c03-691a-4f5c-b29c-a9cee921d165.png` | `v2/index.html`, `v2/top-comp.css` | `/v2/` | Claude Code本体 | 未着手（既存は誤正本ベース） |
| services | services-desktop/mobile.png | `design-comps/zatuneya-hp/services-*.png` | `v2/services.html`, `v2/services-comp.css` | `/v2/services.html` | ワーカーA | 未着手 |
| service-training | service-detail-desktop/mobile.png | `design-comps/zatuneya-hp/service-detail-*.png` | `v2/service-training.html` | `/v2/service-training.html` | ワーカーA | 未着手 |
| service-order | 同上（同一テンプレート、コピーはオーダーメイド開発） | 同上 | `v2/service-order.html` | `/v2/service-order.html` | ワーカーA | 未着手 |
| service-management | 同上（コピーは業務改善・経営支援） | 同上 | `v2/service-management.html` | `/v2/service-management.html` | ワーカーA | 未着手 |
| service-banso | 同上（コピーは伴走サポート） | 同上 | `v2/service-banso.html` | `/v2/service-banso.html` | ワーカーA | 未着手 |
| works | works-profile-desktop/mobile.png（上段） | `design-comps/zatuneya-hp/works-profile-*.png` | `v2/works.html`, `v2/works-profile-comp.css` | `/v2/works.html` | ワーカーB | 未着手 |
| profile | works-profile-desktop/mobile.png（下段） | 同上 | `v2/profile.html` | `/v2/profile.html` | ワーカーB | 未着手 |
| faq | faq-contact-desktop/mobile.png（上段） | `design-comps/zatuneya-hp/faq-contact-*.png` | `v2/faq.html`, `v2/faq-contact-comp.css` | `/v2/faq.html` | ワーカーC | 未着手 |
| contact | faq-contact-desktop/mobile.png（下段） | 同上 | `v2/contact.html` | `/v2/contact.html` | ワーカーC | 未着手 |
| privacy | legal-status-desktop/mobile.png（上段プライバシー） | `design-comps/zatuneya-hp/legal-status-*.png` | `v2/privacy.html`, `v2/legal-status-comp.css` | `/v2/privacy.html` | ワーカーD | 未着手 |
| tokusho | legal-status-desktop/mobile.png（上段特商法） | 同上 | `v2/tokusho.html` | `/v2/tokusho.html` | ワーカーD | 未着手 |
| thank-you | legal-status-desktop/mobile.png（下段「送信が完了しました」カード＋濃色フッターCTA） | 同上 | `v2/thank-you.html` | `/v2/thank-you.html` | ワーカーD | 未着手 |
| 404 | legal-status-desktop/mobile.png（下段「404」カード＋濃色フッターCTA） | 同上 | `v2/404.html` | `/v2/404.html` | ワーカーD | 未着手 |

スクリーンショット保存先（各担当が作成）: `v2/qa-screenshots/<page>/<width>.png`（例: `v2/qa-screenshots/index/1280.png`）。カンプとの比較画像またはPNG突合結果は同ディレクトリに `<page>-diff-notes.md` として一言差分メモを残す。

## 共有基盤（Claude Code本体が先行整備・全ページ共通）

### デザイントークン（既存 `v2/style.css` の `:root` を流用可）

- 背景: `#EFF4F5` と白
- ティール: `#5BBDC8`（`--teal`）、濃ティール `#173F46`（本文用の見出し濃色として新規追加。既存 `--teal-text:#31747C` はサブテキスト用として維持）
- オレンジ: `#F8981D`（`--orange`）。オレンジ地に白文字は使わない（コントラスト2.21:1のため）。オレンジボタンの文字色は濃色（`#332211`など既存踏襲）。
- 見出し: 明朝（Noto Serif JP / Shippori Mincho）。本文: Noto Sans JP。
- 余白: 4pxグリッド。
- アイコン: 絵文字禁止。モノラインSVG（2px程度のストローク）で統一。

### 共通ヘッダー（全14ページで統一。TOPカンプの5項目に合わせる）

```
ロゴ（ざつね屋） | サービス | 無料ツール | 導入事例 | 代表プロフィール | 料金 | [無料で相談する]（オレンジCTA）
```

- 白背景、現在ページは下線＋`aria-current="page"`。
- モバイルはハンバーガーメニュー（既存 `#nav-hamburger` / `#site-nav` のDOM契約を流用）。
- 「無料ツール」は既存どおりドロップダウン（AI活用準備度診断／プロンプトライブラリ）を維持してよい（AGENTS.mdの「現行の有用リンクを維持」判断を踏襲）。視覚のみカンプへ合わせる。
- Claude Code本体がTOP実装時に確定版のヘッダーHTMLを`v2/index.html`に実装し、各ワーカーはそれをそのまま自分の担当ページにコピーして`aria-current`のみ切り替えること（ヘッダーの独自解釈・再設計をしない）。

### 共通フッター（濃ティール `#173F46` 系）

- カンプの各ページ最下部に共通で濃ティールの帯があり、その中に見出しコピー＋CTAボタン、下に脚注リンク列、著作権表記。
- 著作権表記は `© 2026 ざつね屋`。
- TOP実装時にClaude Code本体が確定版を作成し、各ワーカーはコピーする。

### 共通CTA

- 主CTA文言「AI活用診断（無料）」→ `https://han-ai-diagnosis.netlify.app/`
- 補助CTA文言「無料相談・お問い合わせ」→ `./contact.html`（V2内相対URL）
- お問い合わせフォームは既存のGoogle Formsを維持する（フォーム自体の差し替えはしない。見た目のみカンプへ）。

### 画像アセット

- TOPヒーロー写真: `v2/assets/hero-meeting-photo.jpg`（今回カンプから正本準拠でクロップ済み、967×780。低解像度の暫定素材である旨を台帳に残すこと）。
- TOP「強み」セクション左写真（手元・ノートPC）: 既存 `v2/assets/hero-photo.jpg` を流用可（内容がカンプの「顔が判別できない手元」指示に合致）。
- 下層5系統の写真プレースホルダーは、カンプ上「画像指示：顔が判別できない手元・後ろ姿」等のテキストのままにせず、既存 `v2/assets/`（`band-onsite.jpg`, `band-together.jpg`, `band-training.jpg`）から文脈に合う写真を選んで敷き込むこと。プロフィール本人写真のみ既存 `profile-portrait-2.jpg` を使用する。
- 新しい写真アセットを外部から取得しない（ライセンス不明な画像を追加しない）。

### 既存コピー資料（下層は「推測で作らない」。必ず既存ファイルから移植する）

- サービス各詳細の本文（AI研修・教育／オーダーメイド開発／業務改善・経営支援／伴走サポート）は、現行公開中の `v2/service-training.html`, `v2/service-order.html`, `v2/service-management.html`, `v2/service-banso.html` に既にある本文を正とし、レイアウトのみカンプ（service-detail系）へ合わせる。本文を創作しない。
- 導入事例（works）・プロフィール（profile）の本文も同様に現行 `v2/works.html`, `v2/profile.html` の内容を正とし、レイアウトのみカンプへ合わせる。社名・成果数値・代表者名・経歴は「モデルケース」「要確認」の既存の慎重な書き方を変更しない。
- 法務ページ（privacy, tokusho）は現行 `v2/privacy.html`, `v2/tokusho.html` の条文を一切変更せず、レイアウトのみカンプへ。
- FAQ・お問い合わせは現行 `v2/faq.html`, `v2/contact.html` のQ&A内容・フォーム項目を正とし、レイアウト（アコーディオン・エラー表示設計）をカンプへ。

## 実装ルール（全担当共通・再掲）

- V1（`zatuneya-hp/*.html`直下、`v2/`以外）は絶対変更しない。
- インラインstyle禁止、alert/confirm/prompt禁止、キーボードフォーカス可視化、reduced-motion対応、操作領域44px目安、320pxで横スクロールなし。
- 各担当は自分のページ専用CSSファイル（例: `services-comp.css`）を新規に持ち、既存共有`style.css`の**上書き・破壊的変更はしない**（トークン追加は可、既存クラスの意味変更は不可）。これにより並行作業時のコンフリクトを避ける。
- モバイルでカンプのテキストが要素からはみ出す・重なる箇所（既知: works-profile-mobile、legal-status-mobileでカンプ自体の文字切れを確認済み）は、文字を削らず、行間・要素幅・改行位置を調整してカンプの意図を再現すること。カンプの見た目上の文字切れをそのまま実装しない。

## TDD運用

1. 各担当は着手前に、自分のページ群に対する契約テスト（`v2/tests/<group>-comp-contract.mjs`）を先に書き、`node v2/tests/<group>-comp-contract.mjs` でREDを確認する。
2. 契約テストには最低限、セクション見出し文言の存在、カード数、CTA遷移先、画像altテキスト、canonical URL、inline style不使用を含める。
3. 実装後、Playwright（`zatuneya-hp/node_modules/.bin/playwright` または `npx playwright`、`package.json`はリポジトリ直下 `zatuneya-hp/package.json` に用意済み）で320/375/768/1280pxのスクリーンショットを撮り、`v2/qa-screenshots/`へ保存する。
4. スクリーンショットとカンプ画像を自分のReadツールで並べて目視し、差分があれば直す。差分ゼロを断定するのではなく、確認した項目（セクション順・文言・画像・色・余白・CTA・ヘッダー・フッター・横スクロール）を診断メモに書く。

## 完了報告フォーマット（各担当）

- 状態／完成済みファイル数・総数／テスト結果（PASS件数）／未検証項目／次の作業 を明記する。
- スクリーンショット比較の結果を必ず添える。「カンプ通りです」だけの報告は不可。
