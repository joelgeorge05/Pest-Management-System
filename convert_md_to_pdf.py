
from fpdf import FPDF
import os

class PDF(FPDF):
    def header(self):
        self.set_font('Arial', 'B', 12)
        self.cell(0, 10, 'Smart Pest Management System - Presentation Outline', 0, 1, 'R')
        self.ln(5)

    def footer(self):
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.cell(0, 10, 'Page ' + str(self.page_no()), 0, 0, 'C')

def create_pdf(md_file, pdf_file):
    pdf = PDF()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=15)
    
    with open(md_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    for line in lines:
        line = line.strip()
        if not line:
            pdf.ln(2)
            continue
            
        if line.startswith('# '):
            pdf.set_font('Arial', 'B', 24)
            pdf.set_text_color(34, 139, 34) # Nature Green
            pdf.multi_cell(0, 15, line.replace('# ', ''))
            pdf.ln(5)
        elif line.startswith('## '):
            pdf.set_font('Arial', 'B', 18)
            pdf.set_text_color(50, 50, 50)
            pdf.multi_cell(0, 10, line.replace('## ', ''))
            pdf.ln(3)
        elif line.startswith('### '):
            pdf.add_page() # New slide per H3
            pdf.set_font('Arial', 'B', 16)
            pdf.set_text_color(0, 100, 0)
            pdf.multi_cell(0, 10, line.replace('### ', ''))
            pdf.line(10, pdf.get_y(), 200, pdf.get_y())
            pdf.ln(10)
        elif line.startswith('- '):
            pdf.set_font('Arial', '', 12)
            pdf.set_text_color(0, 0, 0)
            # Handle bolding inside bullets roughly
            clean_line = line.replace('- ', '- ')
            clean_line = clean_line.replace('**', '')
            pdf.multi_cell(0, 8, clean_line)
        else:
            pdf.set_font('Arial', '', 12)
            pdf.set_text_color(0, 0, 0)
            clean_line = line.replace('**', '')
            pdf.multi_cell(0, 8, clean_line)

    pdf.output(pdf_file)
    print(f"PDF created: {pdf_file}")

if __name__ == "__main__":
    create_pdf("system_summary.md", "System_Features_and_Tech_Stack.pdf")
