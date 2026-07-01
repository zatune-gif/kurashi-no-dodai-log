"""
研修スライド PDF 生成スクリプト（ダークテーマ版）
pptx → HTML → PDF (Playwright)
デザイン: #1C1C1C + #DA7756 (ざつね屋ブランドカラー)
"""
import sys, re, asyncio, os, html, textwrap

from pptx import Presentation
from playwright.async_api import async_playwright

# ── カラー & デザイントークン ──────────────────────────────
BG          = "#1C1C1C"
BG2         = "#222222"
BG3         = "#252525"
ACCENT      = "#DA7756"
ACCENT_DIM  = "#B85E3D"
TEXT        = "#EEEEEE"
TEXT_MUTED  = "#9CA3AF"
TEXT_DIM    = "#6B7280"
BORDER      = "#333333"
NOTE_BG     = "#2A2A2A"

OUT_DIR = os.path.dirname(os.path.abspath(__file__))

COURSES = [
    ("course01_AI活用知識編.pptx",        "course01_AI活用知識編.pdf"),
    ("course02_jissen_bunsho.pptx",       "course02_jissen_bunsho.pdf"),
    ("course03_jissen_gazo.pptx",         "course03_jissen_gazo.pdf"),
    ("course04_jissen_doga.pptx",         "course04_jissen_doga.pdf"),
    ("course05_jissen_claude_code.pptx",  "course05_jissen_claude_code.pdf"),
]

# ── CSS ───────────────────────────────────────────────────
GLOBAL_CSS = f"""
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;900&display=swap');
@page {{ size: 1280px 720px; margin: 0; }}
* {{ margin: 0; padding: 0; box-sizing: border-box; }}
body {{
  background: {BG};
  font-family: 'Noto Sans JP', 'Yu Gothic', 'Hiragino Sans', sans-serif;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}}
.slide {{
  width: 1280px;
  height: 720px;
  background: {BG};
  position: relative;
  overflow: hidden;
  page-break-after: always;
  display: flex;
  flex-direction: column;
}}
.slide:last-child {{ page-break-after: auto; }}

/* 上部オレンジライン */
.top-bar {{
  width: 100%;
  height: 5px;
  background: {ACCENT};
  flex-shrink: 0;
}}

/* フッター */
.footer {{
  position: absolute;
  bottom: 20px;
  right: 30px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: {TEXT_MUTED};
  font-size: 14px;
  font-weight: 600;
}}
.footer-dot {{
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: {ACCENT};
}}

/* バッジ */
.badge {{
  display: inline-block;
  align-self: flex-start;
  background: {ACCENT};
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  padding: 6px 16px;
  border-radius: 8px;
  letter-spacing: 0.02em;
}}

/* ── Cover ─────────────────────────────────────────── */
.slide-cover .content-area {{
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  padding: 0 80px 60px;
  gap: 12px;
}}
.slide-cover .course-title {{
  font-size: 64px;
  font-weight: 900;
  color: {TEXT};
  line-height: 1.15;
  letter-spacing: -0.01em;
  margin-top: 16px;
}}
.slide-cover .subtitle {{
  font-size: 20px;
  color: {TEXT_MUTED};
  font-weight: 400;
  margin-top: 4px;
}}
.slide-cover .meta {{
  font-size: 13px;
  color: {TEXT_DIM};
  margin-top: 10px;
}}

/* ── Section ───────────────────────────────────────── */
.slide-section {{
  background: #1A1A1A;
}}
.slide-section .content-area {{
  flex: 1;
  display: flex;
  align-items: center;
  padding: 0 80px;
  gap: 40px;
}}
.section-num {{
  width: 110px;
  height: 110px;
  background: {ACCENT};
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 56px;
  font-weight: 900;
  color: #fff;
  flex-shrink: 0;
}}
.section-info {{
  display: flex;
  flex-direction: column;
  gap: 10px;
}}
.section-name {{
  font-size: 36px;
  font-weight: 900;
  color: {TEXT};
  line-height: 1.2;
}}
.section-time {{
  font-size: 16px;
  color: {ACCENT};
  font-weight: 600;
}}
.section-desc {{
  font-size: 16px;
  color: {TEXT_MUTED};
  font-weight: 400;
  margin-top: 4px;
}}

/* ── Table slide ───────────────────────────────────── */
.slide-table .slide-header {{
  background: {BG3};
  padding: 18px 40px;
  flex-shrink: 0;
  border-bottom: 2px solid {ACCENT};
}}
.slide-header h2 {{
  font-size: 22px;
  font-weight: 700;
  color: {TEXT};
}}
.slide-table .table-area {{
  flex: 1;
  padding: 20px 40px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  overflow: hidden;
}}
table {{
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}}
thead tr {{
  background: {ACCENT};
}}
thead th {{
  color: #fff;
  font-weight: 700;
  padding: 10px 14px;
  text-align: left;
  font-size: 13px;
  border: 1px solid {ACCENT_DIM};
}}
tbody tr:nth-child(odd) {{ background: {BG3}; }}
tbody tr:nth-child(even) {{ background: {BG2}; }}
tbody td {{
  color: {TEXT};
  padding: 10px 14px;
  border: 1px solid {BORDER};
  font-size: 13px;
  line-height: 1.45;
  vertical-align: top;
}}
.note {{
  background: {NOTE_BG};
  border-left: 3px solid {ACCENT};
  padding: 8px 14px;
  border-radius: 4px;
  font-size: 12px;
  color: {TEXT_MUTED};
  margin-top: 10px;
  line-height: 1.5;
}}

/* ── Content slide ─────────────────────────────────── */
.slide-content .slide-header {{
  background: {BG3};
  padding: 18px 40px;
  flex-shrink: 0;
  border-bottom: 2px solid {ACCENT};
}}
.slide-content .content-area {{
  flex: 1;
  padding: 24px 40px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 14px;
}}
.content-block {{
  display: flex;
  flex-direction: column;
  gap: 8px;
}}
.content-block-title {{
  font-size: 15px;
  font-weight: 700;
  color: {ACCENT};
  margin-bottom: 4px;
}}
.bullet {{
  display: flex;
  gap: 10px;
  align-items: flex-start;
  font-size: 14px;
  color: {TEXT};
  line-height: 1.5;
}}
.bullet::before {{
  content: "▶";
  color: {ACCENT};
  font-size: 11px;
  flex-shrink: 0;
  margin-top: 3px;
}}
.check {{
  display: flex;
  gap: 10px;
  align-items: flex-start;
  font-size: 14px;
  color: {TEXT};
  line-height: 1.5;
}}

/* 2カラムレイアウト */
.two-col {{
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  flex: 1;
  overflow: hidden;
}}
.col-block {{
  background: {BG3};
  border-radius: 8px;
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}}
.col-block-title {{
  font-size: 14px;
  font-weight: 700;
  color: {ACCENT};
  border-bottom: 1px solid {BORDER};
  padding-bottom: 8px;
  margin-bottom: 6px;
}}

/* 2×2グリッドマップ */
.map-grid {{
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 16px;
  flex: 1;
  padding: 20px 40px 60px;
}}
.map-cell {{
  background: {BG3};
  border: 1px solid {BORDER};
  border-radius: 10px;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
}}
.map-cell-title {{
  font-size: 16px;
  font-weight: 700;
  color: {ACCENT};
}}
.map-cell-desc {{
  font-size: 13px;
  color: {TEXT_MUTED};
  line-height: 1.5;
}}

/* Before/After */
.before-after {{
  display: grid;
  grid-template-columns: 1fr 80px 1fr;
  gap: 0;
  align-items: center;
  flex: 1;
  padding: 0 40px 50px;
}}
.ba-block {{
  background: {BG3};
  border-radius: 10px;
  padding: 20px 24px;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}}
.ba-label-bad  {{ font-size: 13px; font-weight: 700; color: #EF4444; }}
.ba-label-good {{ font-size: 13px; font-weight: 700; color: #22C55E; }}
.ba-text {{
  font-size: 14px;
  color: {TEXT};
  line-height: 1.6;
  white-space: pre-wrap;
}}
.ba-arrow {{
  font-size: 22px;
  color: {ACCENT};
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  line-height: 1.3;
  word-break: keep-all;
}}
"""

# ── ユーティリティ ────────────────────────────────────────
def h(s): return html.escape(str(s))

def extract_shapes(slide):
    """スライドのすべてのテキスト・テーブル情報を順序付きで返す"""
    items = []
    for shape in slide.shapes:
        if shape.has_text_frame:
            texts = []
            for para in shape.text_frame.paragraphs:
                t = para.text.strip()
                if t:
                    texts.append(t)
            if texts:
                items.append(("text", shape, texts))
        elif shape.has_table:
            items.append(("table", shape, shape.table))
    return items

def get_all_texts(slide):
    texts = []
    for shape in slide.shapes:
        if shape.has_text_frame:
            for para in shape.text_frame.paragraphs:
                t = para.text.strip()
                if t:
                    texts.append(t)
    return texts

def detect_type(slide):
    texts = get_all_texts(slide)
    if not texts:
        return "blank"
    # 矢印のみは 4軸マップ
    arrow_count = sum(1 for t in texts if t in ("↑","↓","←","→"))
    if arrow_count >= 3:
        return "map_grid"
    # Cover: 最初のテキストが「ざつね屋」かつコース名を含む
    if texts[0] == "ざつね屋" or (len(texts) >= 2 and "ざつね屋" in texts[0] and "コース" in texts[1]):
        return "cover"
    # Before/After
    if any("Before" in t or "After" in t for t in texts):
        return "before_after"
    # Section: 最初のテキストが単一数字
    if re.match(r'^[1-9]$', texts[0]):
        return "section"
    # テーブル有
    has_table = any(s.has_table for s in slide.shapes)
    if has_table:
        return "table"
    return "content"

def table_html(tbl, extra_class=""):
    rows_html = ""
    n_rows = len(tbl.rows)
    n_cols = len(tbl.columns)
    for r in range(n_rows):
        cells = ""
        for c in range(n_cols):
            text = h(tbl.cell(r, c).text.strip())
            if r == 0:
                cells += f"<th>{text}</th>"
            else:
                cells += f"<td>{text}</td>"
        tag = "thead" if r == 0 else "tbody"
        rows_html += f"<{'tr' if r > 0 else f'tr class=\"header-row\"'}>{cells}</tr>"

    # split thead/tbody properly
    lines = []
    for r in range(n_rows):
        cells = ""
        for c in range(n_cols):
            text = h(tbl.cell(r, c).text.strip())
            if r == 0:
                cells += f"<th>{text}</th>"
            else:
                cells += f"<td>{text}</td>"
        lines.append((r, cells))

    thead = f"<thead><tr>{''.join(c for _, c in [(r, cells) for r, cells in lines if r == 0])}</tr></thead>"
    tbody_rows = "".join(f"<tr>{cells}</tr>" for r, cells in lines if r > 0)
    tbody = f"<tbody>{tbody_rows}</tbody>"
    return f'<table class="{extra_class}">{thead}{tbody}</table>'

def footer_html():
    return f'<div class="footer"><div class="footer-dot"></div>ざつね屋</div>'

# ── スライドレンダラー ────────────────────────────────────

def render_cover(slide):
    texts = get_all_texts(slide)
    # texts[0]=ざつね屋, texts[1]=コース①など, texts[2]=タイトル, texts[3]=サブタイトル, texts[4]=メタ
    badge_text = texts[1] if len(texts) > 1 else ""
    title = texts[2] if len(texts) > 2 else texts[0]
    subtitle = texts[3] if len(texts) > 3 else ""
    meta = texts[4] if len(texts) > 4 else ""
    return f"""
<div class="slide slide-cover">
  <div class="top-bar"></div>
  <div class="content-area">
    <div class="badge">{h(badge_text)}</div>
    <div class="course-title">{h(title)}</div>
    <div class="subtitle">{h(subtitle)}</div>
    <div class="meta">{h(meta)}</div>
  </div>
  {footer_html()}
</div>"""

def render_section(slide):
    texts = get_all_texts(slide)
    num  = texts[0] if len(texts) > 0 else ""
    name = texts[1] if len(texts) > 1 else ""
    time = texts[2] if len(texts) > 2 else ""
    desc = texts[3] if len(texts) > 3 else ""
    return f"""
<div class="slide slide-section">
  <div class="top-bar"></div>
  <div class="content-area">
    <div class="section-num">{h(num)}</div>
    <div class="section-info">
      <div class="section-name">{h(name)}</div>
      <div class="section-time">{h(time)}</div>
      <div class="section-desc">{h(desc)}</div>
    </div>
  </div>
  {footer_html()}
</div>"""

def render_table(slide):
    items = extract_shapes(slide)
    title = ""
    tables = []
    notes = []
    note_keywords = ("⚠", "💡", "❗", "→", "手間", "学習", "専門")

    for kind, shape, data in items:
        if kind == "text":
            for t in data:
                # 最初の長くない(60字以内)テキストをタイトルとする
                if not title and len(t) < 80 and not any(t.startswith(k) for k in note_keywords):
                    title = t
                else:
                    notes.append(t)
        elif kind == "table":
            tables.append(data)

    tables_html = "".join(table_html(tbl) for tbl in tables)
    notes_html = "".join(f'<div class="note">{h(n)}</div>' for n in notes if n != title)

    return f"""
<div class="slide slide-table">
  <div class="top-bar"></div>
  <div class="slide-header"><h2>{h(title)}</h2></div>
  <div class="table-area">
    {tables_html}
    {notes_html}
  </div>
  {footer_html()}
</div>"""

def render_map_grid(slide):
    texts = get_all_texts(slide)
    # 矢印と「↑↓←→」を除いて、【...】形式の4項目を抽出
    cells = []
    title = ""
    for t in texts:
        if t in ("↑","↓","←","→"):
            continue
        if t.startswith("【") or t.startswith("●"):
            cells.append(t)
        elif not title:
            title = t

    # 4つのセルに分割
    cell_html = ""
    for cell in cells[:4]:
        # 【タイトル】\nサブテキスト の形式を分割
        parts = cell.split("\n", 1)
        c_title = parts[0].strip("【】●").strip()
        c_desc  = parts[1].strip() if len(parts) > 1 else ""
        cell_html += f"""
    <div class="map-cell">
      <div class="map-cell-title">{h(c_title)}</div>
      <div class="map-cell-desc">{h(c_desc)}</div>
    </div>"""

    # 4セルに満たない場合、残りは空
    while len(cells) < 4:
        cell_html += '<div class="map-cell"></div>'
        cells.append("")

    return f"""
<div class="slide slide-content">
  <div class="top-bar"></div>
  <div class="slide-header"><h2>{h(title)}</h2></div>
  <div class="map-grid">
    {cell_html}
  </div>
  {footer_html()}
</div>"""

def render_before_after(slide):
    texts = get_all_texts(slide)
    title = ""
    bad_label = ""
    bad_text  = ""
    good_label = ""
    good_text  = ""
    arrow = ""
    state = "title"

    for t in texts:
        if not title:
            title = t
            continue
        if "Before" in t or "悪い" in t or "❌" in t:
            bad_label = t
            state = "bad"
        elif "After" in t or "良い" in t or "✅" in t:
            good_label = t
            state = "good"
        elif t in ("↓", "→", "⬇", "➡") or re.match(r'^[↓→⬇➡]\s*\S', t):
            # 矢印記号のみ抽出、後続テキストは添え書きとして保持
            arrow_char = t[0]
            arrow_label = t[1:].strip() if len(t) > 1 else ""
            arrow = arrow_char + (" " + arrow_label if arrow_label else "")
        elif state == "bad":
            bad_text += t + "\n"
        elif state == "good":
            good_text += t + "\n"

    return f"""
<div class="slide slide-content">
  <div class="top-bar"></div>
  <div class="slide-header"><h2>{h(title)}</h2></div>
  <div class="before-after">
    <div class="ba-block">
      <div class="ba-label-bad">{h(bad_label)}</div>
      <div class="ba-text">{h(bad_text.strip())}</div>
    </div>
    <div class="ba-arrow">{h(arrow or "→")}</div>
    <div class="ba-block">
      <div class="ba-label-good">{h(good_label)}</div>
      <div class="ba-text">{h(good_text.strip())}</div>
    </div>
  </div>
  {footer_html()}
</div>"""

def render_content(slide):
    """汎用コンテンツスライド：2カラムまたはシングルカラム"""
    items = extract_shapes(slide)
    title = ""
    blocks = []  # list of (block_title, [lines])
    current_block_title = None
    current_lines = []

    special_markers = ("✅", "📋", "📚", "🛠", "①", "②", "③")
    block_starters  = any(
        any(t.startswith(m) for m in ("① ", "② ", "③ ")) or
        any(shape.has_text_frame and any(p.text.strip() in ("社内ルール（最低限）", "出力を使うときの注意", "本日の学び", "持ち帰り資料", "次のステップ | ざつね屋のサービス案内") for p in shape.text_frame.paragraphs) for shape in slide.shapes)
        for shape in slide.shapes if shape.has_text_frame
        for para in shape.text_frame.paragraphs
        for t in [para.text.strip()] if t
    )

    all_texts = get_all_texts(slide)
    if not all_texts:
        return f'<div class="slide"></div>'

    title = all_texts[0]
    rest  = all_texts[1:]

    # ブロックヘッダーかどうか判定
    block_headers = {"社内ルール（最低限）", "出力を使うときの注意",
                     "本日の学び", "持ち帰り資料", "次のステップ | ざつね屋のサービス案内",
                     "実践（30分） — ツール", "良いプロンプトの4要素"}

    # 2カラム的な構造を検出
    is_two_col = any(t in block_headers for t in rest)

    if is_two_col:
        # ブロック単位でまとめる
        cols = []
        cur_title = None
        cur_items = []
        for t in rest:
            if t in block_headers:
                if cur_title or cur_items:
                    cols.append((cur_title, cur_items))
                cur_title = t
                cur_items = []
            else:
                cur_items.append(t)
        if cur_title or cur_items:
            cols.append((cur_title, cur_items))

        # 最大2カラム（それ以上は縦積み）
        col_divs = ""
        for ct, ci in cols[:4]:
            items_html = "".join(f'<div class="bullet">{h(li)}</div>' for li in ci)
            col_divs += f"""
        <div class="col-block">
          <div class="col-block-title">{h(ct or "")}</div>
          {items_html}
        </div>"""

        return f"""
<div class="slide slide-content">
  <div class="top-bar"></div>
  <div class="slide-header"><h2>{h(title)}</h2></div>
  <div class="content-area">
    <div class="two-col">
      {col_divs}
    </div>
  </div>
  {footer_html()}
</div>"""

    # シングルカラム
    lines_html = "".join(f'<div class="bullet">{h(t)}</div>' for t in rest)
    return f"""
<div class="slide slide-content">
  <div class="top-bar"></div>
  <div class="slide-header"><h2>{h(title)}</h2></div>
  <div class="content-area">
    <div class="content-block">
      {lines_html}
    </div>
  </div>
  {footer_html()}
</div>"""

def render_slide(slide):
    t = detect_type(slide)
    if t == "cover":       return render_cover(slide)
    if t == "section":     return render_section(slide)
    if t == "table":       return render_table(slide)
    if t == "map_grid":    return render_map_grid(slide)
    if t == "before_after": return render_before_after(slide)
    return render_content(slide)

def build_html(pptx_path):
    prs = Presentation(pptx_path)
    slides_html = "\n".join(render_slide(s) for s in prs.slides)
    return f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>{GLOBAL_CSS}</style>
</head>
<body>
{slides_html}
</body>
</html>"""

async def html_to_pdf(html_content, pdf_path):
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        await page.set_content(html_content, wait_until="networkidle")
        await page.wait_for_timeout(2000)
        await page.pdf(
            path=pdf_path,
            width="1280px",
            height="720px",
            print_background=True,
        )
        await browser.close()

async def main():
    base = os.path.dirname(os.path.abspath(__file__))
    for pptx_name, pdf_name in COURSES:
        pptx_path = os.path.join(base, pptx_name)
        pdf_path  = os.path.join(base, pdf_name)
        if not os.path.exists(pptx_path):
            print(f"[SKIP] {pptx_name} not found")
            continue
        print(f"[GEN] {pptx_name} → {pdf_name} ...", end=" ", flush=True)
        html_content = build_html(pptx_path)

        # HTML を一時ファイルに書いてから PDF 化
        tmp_html = pdf_path.replace(".pdf", "_tmp.html")
        with open(tmp_html, "w", encoding="utf-8") as f:
            f.write(html_content)

        await html_to_pdf(html_content, pdf_path)
        os.remove(tmp_html)
        print("done")
    print("\n✅ 全コース PDF 生成完了")

if __name__ == "__main__":
    asyncio.run(main())
