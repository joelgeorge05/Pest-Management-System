import json
import csv
import os

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
# Note: Adjust path if running from 'scripts/' directory
if os.path.basename(os.getcwd()) == 'scripts':
    BASE_DIR = os.path.dirname(os.getcwd())

INDICES_PATH = os.path.join(BASE_DIR, 'backend', 'class_indices_improved.json')
CSV_PATH = os.path.join(BASE_DIR, 'backend', 'data', 'treatments.csv')
OUTPUT_PATH = os.path.join(BASE_DIR, 'disease_coverage_report.md')

def normalize_key(key):
    # Normalize CSV keys to match Model keys
    return key.replace('___', '_').replace(' ', '_').replace('(', '').replace(')', '').replace(',', '')

def normalize_model_key(key):
   # Normalize Model keys to match (remove special chars if any)
   return key.replace('___', '_').replace(' ', '_').replace('(', '').replace(')', '').replace(',', '')

def generate_report():
    # 1. Load Model Classes
    if not os.path.exists(INDICES_PATH):
        print(f"Error: {INDICES_PATH} not found.")
        return

    with open(INDICES_PATH, 'r') as f:
        indices = json.load(f)
        if indices:
            first_v = list(indices.values())[0]
            if isinstance(first_v, int):
                model_classes = list(indices.keys())
            else:
                model_classes = list(indices.values())
        else:
            model_classes = []
    
    # 2. Load Treatments with aggressive normalization
    treatments_map = {}
    
    if os.path.exists(CSV_PATH):
        with open(CSV_PATH, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                # Store original name for display, map normalized ID
                norm_id = normalize_key(row['id'])
                treatments_map[norm_id] = row['name']
    
    # 3. Categorize
    with_medicine = []
    without_medicine = []
    
    for cls in model_classes:
        norm_cls = normalize_model_key(cls)
        
        # Fuzzy match attempt
        match = None
        
        # 1. Exact match of normalized keys
        if norm_cls in treatments_map:
            match = treatments_map[norm_cls]
        
        # 2. Try partial match (e.g. 'Corn_healthy' in 'Corn_maize_healthy')
        if not match:
             for t_key in treatments_map:
                 if norm_cls in t_key or t_key in norm_cls:
                     # Heuristic: if they share significant overlap
                     match = treatments_map[t_key]
                     break
        
        if match:
            with_medicine.append(f"{cls} (Mapped to: {match})")
        else:
            without_medicine.append(cls)
            
    # 4. Write Markdown
    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        f.write("# Disease Detection & Treatment Coverage\n\n")
        f.write(f"**Total Detectable Pests/Diseases:** {len(model_classes)}\n\n")
        
        f.write("## Summary\n")
        f.write(f"- **With Medicine/Treatment Info:** {len(with_medicine)}\n")
        f.write(f"- **Without Medicine Info:** {len(without_medicine)}\n\n")
        
        f.write("## 1. Pests/Diseases WITHOUT Medicine Info\n")
        f.write("These classes can be detected but have no treatment advice in the system.\n")
        for cls in sorted(without_medicine):
            f.write(f"- {cls}\n")
            
        f.write("\n## 2. Pests/Diseases WITH Medicine Info\n")
        for cls in sorted(with_medicine):
            f.write(f"- {cls}\n")

    print(f"Report generated at {OUTPUT_PATH}")

if __name__ == "__main__":
    generate_report()
