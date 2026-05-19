from pypdf import PdfReader
import os

pdf_path = r"C:\Users\Acer\OneDrive\Pictures\Documents\Desktop\pest\srs\SRS document sample.pdf"

if not os.path.exists(pdf_path):
    print(f"Error: File not found at {pdf_path}")
    exit(1)

try:
    reader = PdfReader(pdf_path)
    print(f"--- START OF PDF CONTENT ({len(reader.pages)} pages) ---")
    for i, page in enumerate(reader.pages):
        print(f"\n--- PAGE {i+1} ---\n")
        print(page.extract_text())
    print("\n--- END OF PDF CONTENT ---")
except Exception as e:
    print(f"Error reading PDF: {e}")
