import pandas as pd
import json
import os
import csv

# Paths
EXCEL_PATH = 'backend/data/Combined_Plant_Disease_Dataset.xlsx'
JSON_PATH = 'backend/data/existing_treatments.json'
CSV_OUTPUT = 'backend/data/treatments.csv'

def load_json_data():
    if os.path.exists(JSON_PATH):
        with open(JSON_PATH, 'r') as f:
            return json.load(f)
    print("Warning: existing_treatments.json not found.")
    return {}

def load_excel_data():
    if os.path.exists(EXCEL_PATH):
        try:
            return pd.read_excel(EXCEL_PATH)
        except Exception as e:
            print(f"Error reading Excel: {e}")
            return pd.DataFrame()
    print("Warning: Excel file not found.")
    return pd.DataFrame()

def prepare_csv_row(class_name, rich_data=None):
    if rich_data:
        return {
            'id': class_name,
            'name': rich_data.get('name', class_name),
            'description': rich_data.get('description', ''),
            'symptoms': "; ".join(rich_data.get('symptoms', [])),
            'treatment_organic': "; ".join(rich_data.get('treatments', {}).get('organic', [])),
            'treatment_inorganic': "; ".join(rich_data.get('treatments', {}).get('inorganic', [])),
            'treatment_homemade': "; ".join(rich_data.get('treatments', {}).get('homemade', [])),
            'prevention': rich_data.get('prevention', '')
        }
    else:
        # Placeholder for new classes
        return {
            'id': class_name,
            'name': class_name.replace('_', ' '),
            'description': "No detailed description available yet.",
            'symptoms': "",
            'treatment_organic': "",
            'treatment_inorganic': "",
            'treatment_homemade': "",
            'prevention': ""
        }

def main():
    print("Loading data...")
    json_data = load_json_data()
    excel_df = load_excel_data()

    # Get all unique classes
    # From JSON keys
    json_classes = set(json_data.keys())
    
    # From Excel 'disease' or 'label' column? 
    # User file had: image_name, crop, disease
    # We probably want to combine crop + disease to match the format 'Crop___Disease' if possible,
    # OR checking if the Excel just has a list of class names.
    # The INSPECTION showed: 'tomato_001.jpg', 'Tomato', 'Early Blight'
    # The Model classes are like 'Tomato___Early_blight'.
    # Transforming 'Tomato', 'Early Blight' -> 'Tomato___Early_blight' might be tricky if spelling varies.
    
    # Let's collect unique combinations from Excel
    excel_classes = set()
    if not excel_df.empty and 'crop' in excel_df.columns and 'disease' in excel_df.columns:
        for index, row in excel_df.iterrows():
            # Attempt to construct ID: Crop___Disease (spaces to underscores)
            # This is a BEST GUESS to match the model's format.
            crop = str(row['crop']).replace(' ', '_')
            disease = str(row['disease']).replace(' ', '_')
            # Handle "Healthy" special case if needed, but usually it's Crop___healthy
            
            # Simple construction
            constructed_id = f"{crop}___{disease}"
            excel_classes.add(constructed_id)

    print(f"Found {len(json_classes)} classes in existing JS.")
    print(f"Found {len(excel_classes)} potential classes in Excel.")

    all_ids = sorted(list(json_classes.union(excel_classes)))
    
    rows = []
    for cls_id in all_ids:
        # Prioritize rich JSON data
        if cls_id in json_data:
            rows.append(prepare_csv_row(cls_id, json_data[cls_id]))
        else:
            # New class from Excel
            rows.append(prepare_csv_row(cls_id))

    # Write CSV
    fieldnames = ['id', 'name', 'description', 'symptoms', 'treatment_organic', 'treatment_inorganic', 'treatment_homemade', 'prevention']
    
    with open(CSV_OUTPUT, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
        
    print(f"Successfully wrote {len(rows)} rows to {CSV_OUTPUT}")

if __name__ == "__main__":
    main()
