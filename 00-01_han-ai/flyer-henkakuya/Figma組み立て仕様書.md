# ざつね屋 A4両面チラシ｜Figma組み立て仕様書

`flyer.html` の実寸を Figma 再構築用にまとめたもの。数値は mm / pt。
写真・QR・アイコンは `assets/` の実ファイルをそのまま使用（生成・再描画しない）。

---

## 0. ドキュメント設定

- フレーム 2枚：各 **216 × 303 mm**（仕上がり 210×297 + 塗り足し 3mm × 4辺）
- 3mm 内側にガイド長方形を引く＝**仕上がり線（トリム）**。重要文字とQRは仕上がり線からさらに 5mm 内側
  → フレーム端からは **8〜11mm 内側**が安全
- 本文の左右マージン：**フレーム端から 11mm**（＝content幅 194mm）。ただし帯（濃ティール/濃グレー）と背景写真はフレーム端まで伸ばす（フルブリード）
- 単位を mm に、Nudge を 1mm / 大 8mm 程度に

## 1. カラースタイル（先に登録）

| 名前 | HEX | 用途 |
|---|---|---|
| paper | #FFFFFF | 地 |
| pale | #EFF4F5 | パッケージ帯の背景 |
| teal | #5BBDC8 | 箇条書きの点・サービス番号・細アクセント |
| deep | #173F46 | 見出し・表CTA帯・重要文字 |
| orange | #F8981D | パッケージ左の細バー(1.2mm)・「無料」表記のみ |
| ink | #1F292C | 本文 |
| sub | #4E5A5D | 補助文字 |
| **裏 k-ink** | #111111 | 裏面の見出し |
| **裏 k-body** | #555555 | 裏面の本文 |
| **裏 k-note** | #888888 | 裏面の注記・罫線 |
| **裏 k-divider** | #D9D9D9 | 区切り線 |
| **裏 k-panel** | #F2F2F2 | 強み／ツールの枠背景 |
| **裏 k-band** | #333333 | 裏CTA帯の背景 |

## 2. テキストスタイル（pt）

| 名前 | フォント | サイズ | 行間 | 字間 | 色 |
|---|---|---|---|---|---|
| H1 / メインコピー | Noto Serif JP 600 | 26 | 1.28 | 0.01em | 1行目 ink ／ 2行目「仕事がよくなることから。」= deep |
| セクション見出し | Noto Sans JP 700 | 14 | 1.3 | 0.02em | deep（裏は k-ink） |
| パッケージ名 | Noto Serif JP 700 | 18 | 1.3 | — | deep |
| パッケージ小見出し（kicker） | Noto Sans JP 700 | 8.5 | 1.4 | — | sub |
| サービス名 | Noto Serif JP 700 | 11.5 | 1.3 | — | ink |
| サービス番号 01/02/03 | Roboto 700 | 9 | — | — | teal |
| サービス価格 | Noto Sans JP 700 | 7.8 | — | — | deep |
| リード（hero-lead） | Noto Sans JP 400 | 8.8 | 1.6 | 0.02em | sub（最大幅 118mm） |
| お悩み見出し | Noto Sans JP 700 | 8.7 | 1.45 | — | ink |
| お悩み本文 | Noto Sans JP 400 | 7.4 | 1.6 | — | sub |
| パッケージ列見出し | Noto Sans JP 700 | 8.8 | 1.3 | — | deep |
| パッケージ列 箇条書き | Noto Sans JP 400 | 7.4 | 1.5 | — | ink |
| お悩みの締め1文 | Noto Sans JP 700 | 7.8 | 1.6 | — | deep |
| 表CTA見出し | Noto Serif JP 600 | 14 | 1.3 | — | #FFFFFF |
| QRタイトル | Noto Sans JP 700 | 10 | 1.35 | — | 表=#FFFFFF ／ 裏=k-ink |
| QR説明 | Noto Sans JP 400 | 7 | 1.5 | — | 表=#DCEBED ／ 裏=k-body |
| フッター（表） | Noto Sans JP 400 | 7 | — | 0.02em | sub |
| 裏 見出しH1 | Noto Serif JP 600 | 18 | 1.3 | — | k-ink（左右に 0.2mm #888 の罫） |
| 進め方ラベル | Noto Sans JP 700 | 7.8 | 1.35 | — | k-ink |
| 進め方 補足 | Noto Sans JP 400 | 6.8 | 1.35 | — | k-note |
| 強み 見出し | Noto Sans JP 700 | 7.8 | 1.4 | — | k-ink |
| 強み 本文 | Noto Sans JP 400 | 6.7 | 1.5 | — | k-body |
| 代表氏名 | Noto Serif JP 700 | 11 | 1.3 | — | k-ink |
| 代表 本文 | Noto Sans JP 400 | 7.1 | 1.6 | — | k-body |
| 実績 業種見出し | Noto Sans JP 700 | 8.5 | — | — | k-ink |
| 実績 本文 | Noto Sans JP 400 | 7 | 1.55 | — | k-body |
| 注記（※〜） | Noto Sans JP 400 | 6.8 | — | — | k-note |
| ツール 見出し | Noto Sans JP 700 | 8.5 | — | — | k-ink |
| ツール 本文 | Noto Sans JP 400 | 7 | 1.5 | — | k-body |
| FAQ 質問 | Noto Sans JP 700 | 7.5 | 1.45 | — | k-ink（頭に「Q.」Roboto） |
| FAQ 回答 | Noto Sans JP 400 | 6.8 | 1.55 | — | k-body（頭に「A.」Roboto） |
| 裏CTA見出し | Noto Serif JP 600 | 14 | — | — | #FFFFFF |
| 裏フッター copy | Noto Sans JP 400 | 6.7 | — | — | k-body |
| 裏フッター 下段 | Noto Sans JP 400 | 6.7 | — | — | k-note |

## 3. 画像フレーム（命名・差し替え対象）

| フレーム名 | 使うファイル | 表示 | サイズ目安 | 角丸 |
|---|---|---|---|---|
| IMG_HERO | `assets/hero.jpg` | cover | 高さ 34mm（横は右カラム幅いっぱい） | 6px |
| IMG_PACKAGE | `assets/pkg.jpg` | cover | 高さ 23mm | 6px |
| IMG_SERVICE_01 | `assets/svc-training.jpg` | cover | 高さ 21mm | 6px |
| IMG_SERVICE_02 | `assets/svc-order.jpg` | cover | 高さ 21mm | 6px |
| IMG_SERVICE_03 | `assets/svc-banso.jpg` | cover | 高さ 21mm | 6px |
| IMG_PROFILE | `assets/portrait.jpg` | cover・**グレースケール**・上寄せ | 34 × 33mm | 4px |
| LOGO_MARK ×2 | `assets/logo-mark.png` | contain | 高さ 10mm（ヘッダー／裏フッター） | なし |
| QR_SHINDAN ×2 | `assets/qr-shindan.png` | 白地・1.5mm 余白 | 18mm 角（最小） | なし |
| QR_HP ×2 | `assets/qr-hp.png` | 白地・1.5mm 余白 | 18mm 角（最小） | なし |

## 4. アイコン（モノライン・絵文字禁止）

`flyer.html` の `<defs>` に線画SVGが入っている（コピペ可）。線幅 1.6 / round。色は 表=deep、裏=k-ink。
市販アイコンで代用するなら **Lucide / Feather** の下記が対応：

| 位置 | アイコン（Lucide名） |
|---|---|
| お悩み① 人手不足 | users |
| お悩み② 属人化 | lock |
| お悩み③ 繰り返し | refresh-cw |
| お悩み④ AI続かず | zap（またはplug） |
| 府中の補足 | building-2 |
| 進め方 無料診断 | search |
| 進め方 相談 | message-square |
| 進め方 小さく試す | sprout |
| 進め方 パッケージ | repeat |
| 進め方 伴走 | share-2 |
| 強み 教えられる実装者 | graduation-cap |
| 強み デジタル化推進 | bar-chart-3 |
| 強み 業務整理 | git-branch |
| 実績 製造業 | lock |
| 実績 建設業 | file-text |
| 実績 小売業 | message-square |
| ツール 診断 | check-circle |
| ツール ライブラリ | book |

## 5. レイアウト（セクション順・内部構成）

### 表面（フルカラー・白地）
1. **ヘッダー**：LOGO_MARK ＋「ざつね屋」(Serif 15pt deep) ＋ 直下に肩書「地域企業の小さな業務変革屋」(8pt sub)。要素間 gap 4mm
2. **ヒーロー**：2カラム **1.7 : 0.85**、gap 8mm
   - 左：H1（2行）→ リード（上 4mm）→ 府中の補足（building アイコン 10mm ＋ 7.8pt bold sub、上 3mm）
   - 右：IMG_HERO
3. **こんな詰まり方を、していませんか**：見出し → **4カラム** gap 4mm（各：アイコン 12mm → 見出し 8.7pt → 本文 7.4pt）→ 締め1文（上 3mm・deep）
4. **AI経営改善パッケージ（3か月）**：フルブリードの帯 `pale`、左端に `orange` の縦バー幅 1.2mm（left 3mm）
   - 上段：**1.65 : 0.65** グリッド gap 8mm（左＝kicker＋パッケージ名／右＝IMG_PACKAGE 23mm）
   - 下段：**3カラム** gap 4mm（各：列見出し 8.8pt deep → 箇条書き 7.4pt、行頭に 1.8mm 角の teal 四角）
   - ※**価格は入れない**
5. **必要なところから始められます｜ざつね屋の3つのサービス**：見出し → **3カラム** gap 4mm
   - 各：写真 21mm → 番号(Roboto 9pt teal)＋サービス名(Serif 11.5pt、baseline揃え、gap 3mm) → 価格 7.8pt deep → 説明 7.2pt sub
   - 価格：01「5名 60,000円〜」／02・03「内容に応じてお見積もり」
6. **表CTA帯**：フルブリード `deep`、白文字。見出し(Serif 14pt) → **2カラム** gap 12mm
   - 各：QR（白箱 18mm、余白 1.5mm）＋［タイトル 10pt ＋ 説明 7pt #DCEBED］、gap 4mm、上下中央
   - 左＝QR_SHINDAN「AI活用準備度診断（無料）／10問ほどで、自社のAI活用の現在地が分かります」
   - 右＝QR_HP「ざつね屋 Webサイト／サービス詳細・事例・料金・お問い合わせはこちら（公開準備中）」
7. **フッター**：「ざつね屋　地域企業の小さな業務変革屋」7pt sub

### 裏面（モノクロ）
1. **見出し**：中央「一緒に、仕事の中身から変えていきます。」(Serif 18pt k-ink)。左右に 0.2mm #888 の横罫（`1fr auto 1fr` グリッド、gap 8mm）
2. **支援の進め方**：見出し → **5カラム** gap 4mm。各：円 12mm（0.3mm #111 の枠）内にアイコン → ラベル 7.8pt → 補足 6.8pt #888。カラム間に「>」(#888 10pt)
   - 無料診断／ご相談（30分・無料）／小さく試す／パッケージで変える／伴走で広げる
3. **強み ／ 代表プロフィール**：**1 : 1.08** グリッド gap 8mm
   - 左「ざつね屋の強み」：背景 `k-panel`、padding 5mm。見出し → 3行（アイコン 10mm ＋ 見出し 7.8pt ＋ 本文 6.7pt）
     - 教えられる実装者／現場でのデジタル化推進経験（補助金の申請書作成支援の経験もあります）／業務整理から入れる
   - 右「代表プロフィール」：見出し → `34mm : 1fr` グリッド gap 6mm（IMG_PROFILE ／ 氏名「大音 晃司（おおと こうじ）」Serif 11pt ＋ 本文 7.1pt）
4. **これまでにお手伝いしたこと（一部抜粋）**：見出し → **3カラム** gap 4mm。各：アイコン 12mm → 業種 8.5pt → 本文 7pt。注記「※ 企業が特定できない形にした事例です。」6.8pt #888
   - **数値は入れない**（製造業／建設業／小売業 の3件、定性的な記述のみ）
5. **無料で使えるツール ／ よくある質問**：**0.95 : 1.15** グリッド gap 10mm
   - 左「無料で使えるツール」：背景 `k-panel`、padding 5mm。2項目、項目間に 0.2mm #D9D9D9 の罫
   - 右「よくある質問」：Q/A 3件（開閉なし・最初から表示）
6. **裏CTA帯**：フルブリード `k-band(#333)`、白文字。構成は表CTAと同じ
7. **裏フッター**：`22mm : 1fr` グリッド（LOGO_MARK ／ コピー 6.7pt k-body「ざつね屋　地域企業の小さな業務変革屋 ／ 広島県府中市を拠点に、地域企業の現場に入り伴走します。」）。下段 space-between で「zatuneya@gmail.com」｜「© 2026 ざつね屋」6.7pt #888

## 6. 書き出し

- PDF書き出し。フレームが 216×303 なので塗り足しは含まれる。トンボが要る入稿先はプラグイン（例：Advanced PDF Export）か手動でトンボを配置
- Figma の PDF は **RGB**。CMYK 必須の入稿先は変換プラグイン／Acrobat／Photoshop で後変換、または RGB 受付のネット印刷を使う
- フォントは埋め込み。「完全アウトライン化」必須なら、書き出し前にテキストを複製してアウトライン化（プラグイン「Convert to Outlines」等）。原本レイヤーは非表示で保持

## 7. 厳守事項

- 価格「360,000円」は載せない → 「AI経営改善パッケージ（3か月）」
- 裏面の実績に数値（○%削減 等）を入れない
- QRは渡された PNG をそのまま配置（色替え・再生成しない）、白のクワイエットゾーンを残す、18mm 以上
- アイコンは絵文字不可・モノライン
- 未確定：写真6点（hero / svc-* / portrait）の商用印刷可否は要確認。不可ならストックで同テーマに差し替え。`qr-hp.png` はWeb公開後に差し替え＋実機スキャン
