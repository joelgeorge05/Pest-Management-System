
from pypdf import PdfReader
import os

def extract_structure():
    path = 'srs/srs_template-ieee.pdf'
    if not os.path.exists(path):
        print("Template not found.")
        return

    try:
        reader = PdfReader(path)
        print(f"--- Extracting text from {path} ---")
        for i, page in enumerate(reader.pages):
            text = page.extract_text()
            print(f"--- Page {i+1} ---")
            print(text)
            print("\n")
            if i > 5: # Limit to first 5 pages to get TOC/Structure
                break
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    extract_structure()
