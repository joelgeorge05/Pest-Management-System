
import os
import json
import pymongo
from fpdf import FPDF
from datetime import datetime

# Configuration
MONGO_URI = "mongodb://localhost:27017/"
DB_NAME = "pest_control_db"
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BACKEND_DIR = os.path.join(BASE_DIR, 'backend')
INDICES_PATH = os.path.join(BACKEND_DIR, "class_indices_improved.json")
OUTPUT_PDF = os.path.join(BASE_DIR, "Missing_Data_Report.pdf")

# Connect to DB
client = pymongo.MongoClient(MONGO_URI)
db = client[DB_NAME]
treatments_collection = db["treatments"]

# Load Class Indices
all_classes = []
if os.path.exists(INDICES_PATH):
    with open(INDICES_PATH, 'r') as f:
        indices = json.load(f)
        # Handle both {label: index} and {index: label} formats, though app.py logic implies values are labels if keys are indices
        # Actually app.py logic is: list(indices.values()) if first value is int? No.
        # Let's just grab all unique string values/keys that look like class names.
        
        vals = list(indices.values())
        keys = list(indices.keys())
        
        # Assuming typical format { "0": "Label", ... } or { "Label": 0, ... }
        # app.py: model_classes = list(indices.values()) # if values are strings
        
        if isinstance(vals[0], int):
             all_classes = keys
        else:
             all_classes = vals
else:
    print(f"ERROR: Indices file not found at {INDICES_PATH}")
    exit(1)

# Fetch DB Data
db_treatments = {}
docs = list(treatments_collection.find({}))
for doc in docs:
    db_treatments[doc['_id']] = doc

# Analysis
missing_data = []

for cls in all_classes:
    cls_id = cls # Assuming ID matches class name as per app.py
    
    data = db_treatments.get(cls_id)
    
    entry = {
        "name": cls,
        "missing_symptoms": False,
        "missing_organic": False,
        "missing_chemical": False, # inorganic in DB usually
        "missing_homemade": False,
        "missing_usage": []
    }
    
    if not data:
        entry["missing_symptoms"] = True
        entry["missing_organic"] = True
        entry["missing_chemical"] = True
        entry["missing_homemade"] = True
        entry["missing_usage"].append("Entire record missing")
    else:
        # Check Symptoms
        if not data.get('symptoms') or len(data.get('symptoms')) == 0:
            entry["missing_symptoms"] = True
            
        # Check Treatments & Usage
        treatments = data.get('treatments', {})
        if not treatments.get('organic'):
            entry["missing_organic"] = True
        else:
            for t in treatments['organic']:
                if isinstance(t, str):
                     entry["missing_usage"].append(f"Organic: {t} (No usage info)")
                elif isinstance(t, dict) and not t.get('usage'):
                    entry["missing_usage"].append(f"Organic: {t.get('name', 'Unknown')}")

        if not treatments.get('inorganic'): # Renamed to Chemical in UI but likely inorganic in DB
            entry["missing_chemical"] = True
        else:
             for t in treatments['inorganic']:
                if isinstance(t, str):
                     entry["missing_usage"].append(f"Chemical: {t} (No usage info)")
                elif isinstance(t, dict) and not t.get('usage'):
                    entry["missing_usage"].append(f"Chemical: {t.get('name', 'Unknown')}")

        if not treatments.get('homemade'):
            entry["missing_homemade"] = True
        else:
             for t in treatments['homemade']:
                if isinstance(t, str):
                     entry["missing_usage"].append(f"Homemade: {t} (No usage info)")
                elif isinstance(t, dict) and not t.get('usage'):
                    entry["missing_usage"].append(f"Homemade: {t.get('name', 'Unknown')}")

    # Only add if something is missing
    if (entry["missing_symptoms"] or 
        entry["missing_organic"] or 
        entry["missing_chemical"] or 
        entry["missing_homemade"] or 
        entry["missing_usage"]):
        missing_data.append(entry)

# PDF Generation
class ReportPDF(FPDF):
    def header(self):
        self.set_font('Arial', 'B', 16)
        self.cell(0, 10, 'Pest & Disease Data Gap Report', 0, 1, 'C')
        self.set_font('Arial', 'I', 10)
        self.cell(0, 10, f'Generated on: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}', 0, 1, 'C')
        self.ln(5)

    def footer(self):
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.cell(0, 10, f'Page {self.page_no()}', 0, 0, 'C')


    def clean_text(self, text):
        return text.replace('\u2013', '-').replace('\u2014', '--').replace('\u2018', "'").replace('\u2019', "'").encode('latin-1', 'replace').decode('latin-1')

pdf = ReportPDF()
pdf.add_page()
pdf.set_auto_page_break(auto=True, margin=15)

if not missing_data:
    pdf.set_font('Arial', 'B', 14)
    pdf.cell(0, 10, "Great news! No missing data found found.", 0, 1)
else:
    pdf.set_font('Arial', '', 12)
    pdf.multi_cell(0, 10, f"Found {len(missing_data)} items with missing information.\n\n")
    
    for item in missing_data:
        # Title
        pdf.set_font('Arial', 'B', 14)
        pdf.set_text_color(200, 0, 0) # Red for alert
        pdf.cell(0, 8, pdf.clean_text(item['name']), 0, 1)
        
        # Details
        pdf.set_font('Arial', '', 11)
        pdf.set_text_color(50, 50, 50)
        
        if item['missing_symptoms']:
             pdf.cell(10)
             pdf.cell(0, 6, "- Missing Symptoms", 0, 1)
             
        if item['missing_organic']:
             pdf.cell(10)
             pdf.cell(0, 6, "- Missing Organic Treatments", 0, 1)
             
        if item['missing_chemical']:
             pdf.cell(10)
             pdf.cell(0, 6, "- Missing Chemical (Inorganic) Treatments", 0, 1)
             
        if item['missing_homemade']:
             pdf.cell(10)
             pdf.cell(0, 6, "- Missing Homemade Treatments", 0, 1)
             
        if item['missing_usage']:
             pdf.cell(10)
             clean_usage = [pdf.clean_text(u) for u in item['missing_usage']]
             pdf.multi_cell(0, 6, "- Missing Usage Instructions for: " + ", ".join(clean_usage))
             
        pdf.ln(4)
        pdf.set_draw_color(200, 200, 200)
        pdf.line(10, pdf.get_y(), 200, pdf.get_y())
        pdf.ln(5)

pdf.output(OUTPUT_PDF)
print(f"Report generated: {OUTPUT_PDF}")
