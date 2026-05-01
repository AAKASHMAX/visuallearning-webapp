import fitz  # PyMuPDF
import easyocr
import io
from PIL import Image
import sys

# Open the sample board paper
pdf_path = "../sample-board-paper.pdf"
doc = fitz.open(pdf_path)
print(f"PDF has {len(doc)} pages")

# Initialize EasyOCR reader for English only
reader = easyocr.Reader(['en'], gpu=False)

# Test on page 2 (first real content page, page 1 is usually cover)
page_num = 2
page = doc[page_num]
print(f"\nProcessing page {page_num + 1}...")

# Render page to image at 300 DPI for good OCR quality
mat = fitz.Matrix(300/72, 300/72)  # 300 DPI
pix = page.get_pixmap(matrix=mat)
img_bytes = pix.tobytes("png")

# Convert to PIL Image
img = Image.open(io.BytesIO(img_bytes))
print(f"Image size: {img.size}")

# Run OCR
results = reader.readtext(io.BytesIO(img_bytes).read(), detail=1)

print(f"\nFound {len(results)} text blocks on page {page_num + 1}:\n")
for bbox, text, conf in results:
    if conf > 0.3:  # Filter low confidence
        print(f"[{conf:.2f}] {text}")

doc.close()
