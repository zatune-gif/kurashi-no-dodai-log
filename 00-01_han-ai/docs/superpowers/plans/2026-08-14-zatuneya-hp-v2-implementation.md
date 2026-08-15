# ざつね屋HP Codex版V2 実装計画

## 目的

- 現行V1を変更せず、`/zatuneya-hp/v2/` にCodex版V2を自己完結で公開する。
- TOPは`index-v2.html`の内容、下層は承認済みカンプと共有仕様を基礎にする。

## 実装

- [ ] 隔離worktreeと`codex/zatuneya-hp-v2`ブランチを作る。
- [ ] V1全追跡ファイルのhashを保存する。
- [ ] `v2/`へ14ページ、`style.css`、`nav.js`、必要な`assets/`を作る。
- [ ] 内部リンクをV2内の相対URLへ統一する。
- [ ] canonical／OG URLを各V2 URLへ設定する。
- [ ] 主CTAを`https://han-ai-diagnosis.netlify.app/`へ統一する。
- [ ] Google Forms、既存の法務・プロフィール情報を維持する。
- [ ] `tokusho.html`表記へ統一する。
- [ ] 白・ティール・オレンジ、和文セリフ見出し、写真と波形のデザインを適用する。
- [ ] CTAコントラスト、44px以上の操作領域、キーボード操作、FAQのARIA状態を確保する。

## 検証

- [ ] V1のhashが実装前後で完全一致することを確認する。
- [ ] V2全ページのローカル参照、内部リンク、canonical、OG、CTA、フォームを機械検証する。
- [ ] 320／375／390／768／1280pxで全ページを撮影し、横スクロール・重なり・文字切れ・画像切れを目視確認する。
- [ ] HTML、アクセシビリティ、コントラスト、Lighthouseを確認する。
- [ ] `git diff --check`と変更範囲が`v2/`のみであることを確認する。

## 公開

- [ ] サブモジュールでcommitし、作業ブランチをpushする。
- [ ] `main`へ統合してpushし、GitHub Pages Actions成功を確認する。
- [ ] V1 URLが不変、V2 URLが表示可能であることを実環境で確認する。
- [ ] 親リポジトリでサブモジュールgitlinkだけをcommit・pushする。
- [ ] 共有仕様書とObsidianへ実装判断・検証・URL・commitを記録する。

## ロールバック

- V2は`v2/`内で独立させる。問題時はV2追加commitをrevertし、V1には影響させない。
