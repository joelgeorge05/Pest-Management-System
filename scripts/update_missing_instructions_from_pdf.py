
import pdfplumber
import pymongo
import re
import os

# Configuration
PDF_PATH = r"C:\Users\Acer\OneDrive\Videos\Pictures\Documents\Desktop\pest\Complete_Pest_Data_Table_SMALL_TEXT.pdf"
MONGO_URI = "mongodb://localhost:27017/"
DB_NAME = "pest_control_db"

# Connect to DB
client = pymongo.MongoClient(MONGO_URI)
db = client[DB_NAME]
treatments_collection = db["treatments"]

def clean_text(text):
    if not text: return ""
    return text.replace('\n', ' ').strip()

def update_db():
    if not os.path.exists(PDF_PATH):
        print(f"Error: PDF not found at {PDF_PATH}")
        return

    print(f"Processing PDF: {PDF_PATH}")
    
    updated_count = 0
    
    with pdfplumber.open(PDF_PATH) as pdf:
        for page_num, page in enumerate(pdf.pages):
            print(f"Scanning Page {page_num + 1}...")
            tables = page.extract_tables()
            
            for table in tables:
                # Headers usually: PEST/DISEASE | SYMPTOMS | ORGANIC | CHEMICAL | HOMEMADE
                # Need to be robust. Let's assume standard columns or try to detect.
                
                # Check headers
                headers = [h.lower() for h in table[0] if h]
                
                # Simple heuristic mapping
                col_map = {}
                for idx, h in enumerate(headers):
                    if 'pest' in h or 'disease' in h or 'name' in h: col_map['name'] = idx
                    elif 'symptom' in h: col_map['symptoms'] = idx
                    elif 'organic' in h: col_map['organic'] = idx
                    elif 'chemical' in h or 'inorganic' in h: col_map['inorganic'] = idx
                    elif 'home' in h: col_map['homemade'] = idx

                if 'name' not in col_map: 
                    continue # Skip invalid tables

                # Process rows
                for row in table[1:]:
                    if not row[col_map['name']]: continue
                    
                    pest_name = clean_text(row[col_map['name']])
                    
                    # Fuzzy match or direct find in DB
                    # We'll use regex for lenient matching
                    regex_name = re.escape(pest_name).replace(r'\ ', '.*') # Flexible spaces
                    
                    # Try to find exactly first
                    doc = treatments_collection.find_one({"_id": pest_name})
                    
                    # If failed, try finding by name field
                    if not doc:
                         doc = treatments_collection.find_one({"name": {"$regex": f"^{regex_name}$", "$options": "i"}})
                    
                    # If still failed, try broader search (e.g. "Apple Scab" vs "Apple_Scab")
                    if not doc:
                        # Try swapping spaces with underscores and vice versa
                         alt_name = pest_name.replace(' ', '_')
                         doc = treatments_collection.find_one({"_id": alt_name})
                    
                    if not doc:
                         print(f"Warning: Could not find DB entry for '{pest_name}'")
                         continue

                    # UPDATE LOGIC
                    updates = {}
                    
                    # 1. Symptoms
                    if 'symptoms' in col_map and row[col_map['symptoms']]:
                        new_symptoms = [s.strip() for s in clean_text(row[col_map['symptoms']]).split(';') if s.strip()]
                        if new_symptoms:
                             updates["symptoms"] = new_symptoms

                    # 2. Treatments (Organic, Inorganic, Homemade)
                    for type_key in ['organic', 'inorganic', 'homemade']:
                        if type_key in col_map and row[col_map[type_key]]:
                            raw_text = clean_text(row[col_map[type_key]])
                            # Heuristic to parse "Medicine Name (Usage instruction)"
                            # Or just "Medicine Name: Usage"
                            # We might just overwrite the description/usage if simpler
                            
                            # Existing treatments in DB for this category
                            current_list = doc.get('treatments', {}).get(type_key, [])
                            
                            # If usage is missing in DB but present in PDF, update it
                            # Simple approach: If DB has just name/string, upgrade to dict with usage from PDF
                            # Complex approach: Parse PDF string to split name/usage
                            
                            # Let's assume PDF has full text "Neem Oil: Mix 5ml per liter..."
                            # We will add/update.
                            
                            # Identify usage pattern: Look for "per liter", "spray", "mix"
                            if "per" in raw_text or "mix" in raw_text.lower() or "spray" in raw_text.lower():
                                usage_text = raw_text
                                
                                # Try to extract name? Hard. 
                                # Strategy: Update the FIRST element if it lacks usage, or APPEND if empty.
                                
                                if not current_list:
                                     # Create new entry
                                     new_entry = { "name": "See Instructions", "usage": usage_text, "image": None }
                                     # Try to guess name from first few words? "Neem Oil ..."
                                     name_match = re.match(r"^([\w\s]+)(:|–|-)\s*(.+)", usage_text)
                                     if name_match:
                                         new_entry["name"] = name_match.group(1).strip()
                                         new_entry["usage"] = name_match.group(3).strip()
                                     
                                     current_list.append(new_entry)
                                else:
                                     # Update existing entries
                                     updated_t = False
                                     for t in current_list:
                                         if isinstance(t, dict):
                                             if not t.get('usage'): # Only update if usage missing
                                                 t['usage'] = usage_text
                                                 updated_t = True
                                         elif isinstance(t, str):
                                             # Convert str to dict
                                              # Find index
                                              idx = current_list.index(t)
                                              current_list[idx] = { "name": t, "usage": usage_text, "image": None }
                                              updated_t = True
                                     
                                     if not updated_t:
                                         # Maybe append as general instruction?
                                         pass 

                            if current_list:
                                updates[f"treatments.{type_key}"] = current_list

                    if updates:
                        treatments_collection.update_one({"_id": doc["_id"]}, {"$set": updates})
                        updated_count += 1
                        print(f"Updated '{pest_name}'")

    print(f"Finished. Updated {updated_count} records.")

if __name__ == "__main__":
    update_db()
