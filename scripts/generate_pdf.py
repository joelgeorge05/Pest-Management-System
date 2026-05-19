import markdown
import pdfkit
import os
import sys

def convert_md_to_pdf(md_file_path, pdf_file_path):
    print(f"Reading markdown from: {md_file_path}")
    try:
         with open(md_file_path, 'r', encoding='utf-8') as f:
             text = f.read()
    except FileNotFoundError:
         print(f"Error: Could not find file {md_file_path}")
         return False

    print("Converting markdown to HTML...")
    # Convert markdown to html with extended support for tables
    html = markdown.markdown(text, extensions=['tables', 'fenced_code'])
    
    # Add some basic styling and specify UTF-8 encoding
    styled_html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; color: #333; }}
            h1, h2, h3 {{ color: #2c3e50; border-bottom: 1px solid #eee; padding-bottom: 5px; }}
            table {{ border-collapse: collapse; width: 100%; margin-bottom: 20px; }}
            th, td {{ border: 1px solid #ddd; padding: 12px; text-align: left; }}
            th {{ background-color: #f8f9fa; font-weight: bold; }}
            code {{ background-color: #f4f4f4; padding: 2px 4px; border-radius: 4px; font-family: monospace; }}
            pre {{ background-color: #f4f4f4; padding: 10px; border-radius: 4px; overflow-x: auto; }}
        </style>
    </head>
    <body>
        {html}
    </body>
    </html>
    """

    print(f"Generating PDF to: {pdf_file_path}")
    options = {
        'page-size': 'A4',
        'margin-top': '0.75in',
        'margin-right': '0.75in',
        'margin-bottom': '0.75in',
        'margin-left': '0.75in',
        'encoding': "UTF-8",
        'enable-local-file-access': None
    }
    
    try:
        # Check wkhtmltopdf path for Windows
        path_wkhtmltopdf = r'C:\Program Files\wkhtmltopdf\bin\wkhtmltopdf.exe'
        if os.path.exists(path_wkhtmltopdf):
             config = pdfkit.configuration(wkhtmltopdf=path_wkhtmltopdf)
             pdfkit.from_string(styled_html, pdf_file_path, options=options, configuration=config)
        else:
             print("wkhtmltopdf not found in default path, trying without explicit path...")
             # Try without explicit path (assumes it's in system PATH)
             pdfkit.from_string(styled_html, pdf_file_path, options=options)
             
        print("Success! PDF created.")
        return True
    except Exception as e:
        print(f"Failed to create PDF. Error: {e}")
        print("\nNote: pdfkit requires wkhtmltopdf to be installed on your system.")
        print("You can download it from: https://wkhtmltopdf.org/downloads.html")
        return False

if __name__ == "__main__":
    if len(sys.argv) != 3:
         print("Usage: python convert_md_to_pdf.py <input.md> <output.pdf>")
         sys.exit(1)
         
    convert_md_to_pdf(sys.argv[1], sys.argv[2])
