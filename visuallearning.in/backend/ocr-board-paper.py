"""
Board Paper OCR Pipeline
- Converts scanned PDF to text
- Extracts only English content (filters out Hindi)
- Generates a clean formatted PDF matching CBSE SQP table style:
  | Q.No. | Question | Marks |
  with proper borders between each question
"""

import fitz  # PyMuPDF
import easyocr
import io
import sys
import os
import re
from PIL import Image
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, KeepTogether
)
from reportlab.platypus.tables import LongTable
from reportlab.lib.units import mm
from reportlab.lib.colors import black, HexColor

PAGE_WIDTH, PAGE_HEIGHT = A4
# Match SQP margins: left ~12mm, right ~10mm, top/bottom ~18mm
LEFT_MARGIN = 12 * mm
RIGHT_MARGIN = 10 * mm
TOP_MARGIN = 18 * mm
BOTTOM_MARGIN = 18 * mm
USABLE_WIDTH = PAGE_WIDTH - LEFT_MARGIN - RIGHT_MARGIN

# Table column widths matching SQP proportions
QNUM_COL = 32       # Q.No. column
MARKS_COL = 38       # Marks column
QUESTION_COL = USABLE_WIDTH - QNUM_COL - MARKS_COL  # Question column

# ─── OCR Functions ───

def is_hindi_text(text):
    devanagari_range = range(0x0900, 0x097F + 1)
    hindi_chars = sum(1 for c in text if ord(c) in devanagari_range)
    return hindi_chars > len(text) * 0.3

def process_page(reader, doc, page_num):
    page = doc[page_num]
    mat = fitz.Matrix(300/72, 300/72)
    pix = page.get_pixmap(matrix=mat)
    img_bytes = pix.tobytes("png")
    results = reader.readtext(img_bytes, detail=1)

    english_lines = []
    for bbox, text, conf in results:
        if conf < 0.2:
            continue
        text = text.strip()
        if not text:
            continue
        if is_hindi_text(text):
            continue
        y_pos = bbox[0][1]
        english_lines.append((y_pos, text, conf))

    english_lines.sort(key=lambda x: x[0])
    return english_lines

def merge_lines(lines, threshold=15):
    if not lines:
        return []
    merged = []
    current_y = lines[0][0]
    current_texts = [lines[0][1]]
    for y, text, conf in lines[1:]:
        if abs(y - current_y) < threshold:
            current_texts.append(text)
        else:
            merged.append(" ".join(current_texts))
            current_y = y
            current_texts = [text]
    if current_texts:
        merged.append(" ".join(current_texts))
    return merged

# ─── Text Formatting ───

def escape_xml(text):
    text = text.replace("&", "&amp;")
    text = text.replace("<", "&lt;")
    text = text.replace(">", "&gt;")
    return text

def format_super_sub(text):
    """Convert scientific notation to reportlab super/sub tags."""
    text = escape_xml(text)

    # "3 x 10-34" → "3 × 10<super>−34</super>"
    text = re.sub(r'(\d+)\s*[xX×]\s*10[\-\u2212](\d+)',
                  r'\1 × 10<super>−\2</super>', text)
    text = re.sub(r'(\d+)\s*[xX×]\s*10(\d+)',
                  r'\1 × 10<super>\2</super>', text)

    # Standalone "10-34" style
    text = re.sub(r'\b10[\-\u2212](\d{2,})\b',
                  r'10<super>−\1</super>', text)

    # Units with negative powers: m-2, s-1, C-2, N-1, A-1 etc.
    text = re.sub(r'([a-zA-Z])([\-\u2212]\d)(?=\s|$|[,\.\)\;])',
                  r'\1<super>\2</super>', text)

    # Positive unit powers: m2, s2 at word boundary
    text = re.sub(r'([a-zA-Z])(\d)(?=\s|$|[,\.\)\;])',
                  r'\1<super>\2</super>', text)

    text = text.replace('<super>-', '<super>−')
    return text

def is_question_start(line):
    return bool(re.match(r'^\d{1,2}\s*[\.\)]', line.strip()))

def is_section_header(line):
    return bool(re.match(r'^SECTION\s*[\-_:\s]*[A-E]', line.strip(), re.IGNORECASE))

def is_noise_line(line):
    """Filter out page numbers, PT.O, etc."""
    s = line.strip()
    if re.match(r'^\d+/\d+/\d+', s):
        return True
    if s in ('PT.O', 'P.T.O', 'P.T.O.', 'PT.O.'):
        return True
    if re.match(r'^Page\s+\d+\s+of\s+\d+$', s, re.IGNORECASE):
        return True
    return False

def get_question_number(line):
    m = re.match(r'^(\d{1,2})\s*[\.\)]', line.strip())
    return m.group(1) if m else None

def strip_question_number(line):
    return re.sub(r'^\d{1,2}\s*[\.\)]\s*', '', line.strip())

# ─── Group Lines into Questions ───

def group_into_questions(all_pages_text):
    """
    Parse all OCR lines and group them into structured questions.
    Returns list of: { 'type': 'question'|'section'|'header', 'num': str, 'lines': [str], 'marks': str }
    """
    items = []
    current_item = None

    # Flatten all lines, skipping noise
    all_lines = []
    for page_idx, lines in all_pages_text:
        for line in lines:
            if not line.strip() or is_noise_line(line):
                continue
            all_lines.append(line)

    # Detect where the actual questions start (after general instructions)
    question_started = False

    for line in all_lines:
        stripped = line.strip()

        if is_section_header(stripped):
            # Save previous item
            if current_item:
                items.append(current_item)
            items.append({'type': 'section', 'text': stripped})
            current_item = None
            question_started = True
            continue

        if question_started and is_question_start(stripped):
            # Save previous question
            if current_item:
                items.append(current_item)
            qnum = get_question_number(stripped)
            rest = strip_question_number(stripped)
            current_item = {
                'type': 'question',
                'num': qnum,
                'lines': [rest] if rest else [],
            }
            continue

        if current_item and current_item['type'] == 'question':
            # Continuation of current question
            current_item['lines'].append(stripped)
        elif not question_started:
            # Header/instructions area
            if current_item and current_item['type'] == 'header':
                current_item['lines'].append(stripped)
            else:
                if current_item:
                    items.append(current_item)
                current_item = {'type': 'header', 'lines': [stripped]}

    if current_item:
        items.append(current_item)

    return items

# ─── Guess marks from question number ───

def guess_marks(qnum_str, total_questions=33):
    """Guess marks based on CBSE pattern. Can be overridden."""
    try:
        q = int(qnum_str)
    except (ValueError, TypeError):
        return ""
    # Typical CBSE pattern:
    # 1-16: 1 mark (MCQ)
    # 17-21: 2 marks (VSA)
    # 22-28: 3 marks (SA)
    # 29-30: 4 marks (Case study)
    # 31-33: 5 marks (LA)
    if q <= 16:
        return "1"
    elif q <= 21:
        return "2"
    elif q <= 28:
        return "3"
    elif q <= 30:
        return "4"
    else:
        return "5"

# ─── PDF Generation ───

def create_text_pdf(all_pages_text, output_path, title="Board Paper", subtitle=""):
    """Create a PDF matching CBSE SQP table format with bordered questions."""

    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        leftMargin=LEFT_MARGIN,
        rightMargin=RIGHT_MARGIN,
        topMargin=TOP_MARGIN,
        bottomMargin=BOTTOM_MARGIN,
    )

    # ── Styles ──
    title_style = ParagraphStyle('Title', fontName='Times-Bold', fontSize=14,
                                  alignment=TA_CENTER, spaceAfter=4, leading=18)
    subtitle_style = ParagraphStyle('Subtitle', fontName='Times-Bold', fontSize=12,
                                     alignment=TA_CENTER, spaceAfter=4, leading=16)
    header_style = ParagraphStyle('Header', fontName='Times-Roman', fontSize=11,
                                   alignment=TA_LEFT, leading=15, spaceAfter=2)
    header_bold = ParagraphStyle('HeaderBold', fontName='Times-Bold', fontSize=11,
                                  alignment=TA_LEFT, leading=15, spaceAfter=2)
    section_style = ParagraphStyle('Section', fontName='Times-Bold', fontSize=13,
                                    alignment=TA_CENTER, leading=17)
    qnum_style = ParagraphStyle('QNum', fontName='Times-Bold', fontSize=11,
                                 alignment=TA_CENTER, leading=14)
    qtext_style = ParagraphStyle('QText', fontName='Times-Roman', fontSize=11,
                                  alignment=TA_LEFT, leading=15)
    marks_style = ParagraphStyle('Marks', fontName='Times-Bold', fontSize=11,
                                  alignment=TA_CENTER, leading=14)
    col_header_style = ParagraphStyle('ColHeader', fontName='Times-Bold', fontSize=11,
                                       alignment=TA_CENTER, leading=14)

    # Style for spanning rows (section headers inside table)
    section_cell_style = ParagraphStyle('SectionCell', fontName='Times-Bold', fontSize=13,
                                         alignment=TA_CENTER, leading=17)

    story = []

    # ── Title Block ──
    story.append(Paragraph(escape_xml(title), title_style))
    if subtitle:
        story.append(Paragraph(escape_xml(subtitle), subtitle_style))
    story.append(Spacer(1, 6))

    # ── Parse and group content ──
    items = group_into_questions(all_pages_text)

    # Separate header items from question items
    header_items = []
    table_items = []
    for item in items:
        if item['type'] == 'header':
            header_items.append(item)
        else:
            table_items.append(item)

    # Render header / general instructions
    for item in header_items:
        for line in item['lines']:
            formatted = format_super_sub(line)
            if any(k in line.lower() for k in ['general instruction', 'time allowed',
                    'maximum marks', 'physical constants', 'note']):
                story.append(Paragraph(f"<b>{formatted}</b>", header_bold))
            else:
                story.append(Paragraph(formatted, header_style))

    story.append(Spacer(1, 8))

    # ── Build one big LongTable for all questions ──
    # This allows rows to split across pages naturally

    table_data = []
    row_styles = []  # (row_index, style_commands)

    for item in table_items:
        row_idx = len(table_data)

        if item['type'] == 'section':
            # Section header row spanning all 3 columns
            table_data.append([
                Paragraph(escape_xml(item['text']), section_cell_style),
                '',
                '',
            ])
            row_styles.append((row_idx, 'section'))

        elif item['type'] == 'question':
            # Split long questions into multiple rows to avoid page overflow
            q_lines = item['lines']
            marks = guess_marks(item['num'])

            # Limit lines per row to prevent oversized cells (~30 lines max)
            MAX_LINES_PER_CELL = 25
            if len(q_lines) <= MAX_LINES_PER_CELL:
                q_text_parts = [format_super_sub(l) for l in q_lines]
                q_text_html = "<br/>".join(q_text_parts) if q_text_parts else ""

                table_data.append([
                    Paragraph(f"<b>{item['num']}.</b>", qnum_style),
                    Paragraph(q_text_html, qtext_style),
                    Paragraph(marks, marks_style),
                ])
                row_styles.append((row_idx, 'question'))
            else:
                # Split into first row (with Q num + marks) and continuation rows
                chunks = [q_lines[i:i+MAX_LINES_PER_CELL] for i in range(0, len(q_lines), MAX_LINES_PER_CELL)]
                for ci, chunk in enumerate(chunks):
                    chunk_html = "<br/>".join(format_super_sub(l) for l in chunk)
                    r_idx = len(table_data)
                    if ci == 0:
                        table_data.append([
                            Paragraph(f"<b>{item['num']}.</b>", qnum_style),
                            Paragraph(chunk_html, qtext_style),
                            Paragraph(marks, marks_style),
                        ])
                        row_styles.append((r_idx, 'question'))
                    else:
                        table_data.append([
                            Paragraph("", qnum_style),
                            Paragraph(chunk_html, qtext_style),
                            Paragraph("", marks_style),
                        ])
                        row_styles.append((r_idx, 'question_cont'))

    if not table_data:
        doc.build(story)
        print(f"\nSaved text PDF to: {output_path}")
        return

    # Create the table
    big_table = LongTable(
        table_data,
        colWidths=[QNUM_COL, QUESTION_COL, MARKS_COL],
        repeatRows=0,
        splitInRow=1,  # Allow splitting within a row
    )

    # Build style commands
    style_cmds = [
        # Default grid
        ('BOX', (0, 0), (-1, -1), 0.8, black),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, black),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (0, -1), 4),
        ('LEFTPADDING', (1, 0), (1, -1), 6),
        ('RIGHTPADDING', (1, 0), (1, -1), 6),
        ('LEFTPADDING', (2, 0), (2, -1), 4),
    ]

    # Apply section header styling (span + background)
    for row_idx, rtype in row_styles:
        if rtype == 'section':
            style_cmds.append(('SPAN', (0, row_idx), (2, row_idx)))
            style_cmds.append(('BACKGROUND', (0, row_idx), (2, row_idx), HexColor('#f0f0f0')))
            style_cmds.append(('TOPPADDING', (0, row_idx), (2, row_idx), 8))
            style_cmds.append(('BOTTOMPADDING', (0, row_idx), (2, row_idx), 8))
        elif rtype == 'question_cont':
            # No border between continuation rows and previous
            style_cmds.append(('LINEABOVE', (0, row_idx), (-1, row_idx), 0, black))

    big_table.setStyle(TableStyle(style_cmds))
    story.append(big_table)

    # Build PDF
    doc.build(story)
    print(f"\nSaved text PDF to: {output_path}")

# ─── Main ───

def main():
    if len(sys.argv) < 2:
        pdf_path = "../sample-board-paper.pdf"
    else:
        pdf_path = sys.argv[1]

    output_path = pdf_path.replace(".pdf", "-english.pdf")
    if len(sys.argv) >= 3:
        output_path = sys.argv[2]

    print(f"Input: {pdf_path}")
    print(f"Output: {output_path}")

    doc = fitz.open(pdf_path)
    total_pages = len(doc)
    print(f"Total pages: {total_pages}")

    print("Loading OCR model...")
    reader = easyocr.Reader(['en'], gpu=False, verbose=False)
    print("OCR model loaded.")

    all_pages_text = []

    for i in range(total_pages):
        print(f"Processing page {i+1}/{total_pages}...", end=" ", flush=True)
        lines = process_page(reader, doc, i)
        merged = merge_lines(lines)
        cleaned = [l for l in merged if len(l) > 2]
        english_count = len(cleaned)
        print(f"({english_count} English lines)")
        all_pages_text.append((i, cleaned))

    doc.close()

    create_text_pdf(
        all_pages_text,
        output_path,
        title="PHYSICS — Question Paper (CBSE 2025)",
        subtitle="English Only — OCR Extracted"
    )

    # Also save plain text
    txt_path = output_path.replace(".pdf", ".txt")
    with open(txt_path, "w", encoding="utf-8") as f:
        for page_idx, lines in all_pages_text:
            f.write(f"\n--- Page {page_idx + 1} ---\n")
            for line in lines:
                f.write(line + "\n")
    print(f"Saved text file to: {txt_path}")

    total_lines = sum(len(lines) for _, lines in all_pages_text)
    print(f"\nDone! Total English lines extracted: {total_lines}")

if __name__ == "__main__":
    main()
