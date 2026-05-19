
import markdown
from xhtml2pdf import pisa
import os

def convert_srs_to_pdf():
    # Use absolute paths or relative to execution context if predictable
    # Ideally relative to CWD
    source_file = 'srs/SRS.md'
    output_file = 'srs/SRS.pdf'
    
    if not os.path.exists(source_file):
        print(f"Error: {source_file} not found.")
        return

    try:
        # Read Markdown
        with open(source_file, 'r', encoding='utf-8') as f:
            text = f.read()
            
        # Convert to HTML with some styling
        css = """
        <style>
            @page { size: A4; margin: 2cm; }
            body { font-family: Helvetica, sans-serif; font-size: 12pt; }
            h1 { color: #2E7D32; font-size: 24pt; text-align: center; margin-bottom: 20px; }
            h2 { color: #1B5E20; border-bottom: 2px solid #1B5E20; margin-top: 20px; }
            h3 { color: #388E3C; margin-top: 15px; }
            p { text-align: justify; line-height: 1.5; }
            ul { line-height: 1.5; }
            strong { color: #000; }
        </style>
        """
        
        html_content = markdown.markdown(text, extensions=['extra', 'codehilite'])
        full_html = f"<html><head>{css}</head><body>{html_content}</body></html>"

        # Generate PDF
        with open(output_file, "w+b") as result_file:
            pisa_status = pisa.CreatePDF(full_html, dest=result_file)

        if pisa_status.err:
            print("Error converting to PDF.")
        else:
            print(f"Successfully created {output_file}")
            
    except Exception as e:
        print(f"Conversion Error: {e}")

if __name__ == "__main__":
    convert_srs_to_pdf()
