
import pymongo
import re

# Connect to MongoDB
client = pymongo.MongoClient("mongodb://localhost:27017/")
db = client["pest_management"]
treatments_collection = db["treatments"]

def parse_and_import():
    try:
        with open("debug_pdf_log.txt", "r", encoding="utf-8") as f:
            lines = f.readlines()
            
        print(f"Read {len(lines)} lines from log.")
        
        rows = []
        current_doc = {}
        
        # Keywords
        headers_to_skip = ["Pest Name", "Symptoms", "Organic", "Inorganic", "Homemade", "General preventive measures:"]

        i = 0
        while i < len(lines) - 1:
            line = lines[i].strip()
            next_line = lines[i+1].strip()
            
            if not line: 
                i += 1
                continue
                
            # Heuristic: Name is often repeated in the next line
            # "Colomerus vitis"
            # "Colomerus vitis infestation..."
            is_new_record = False
            if len(line) > 2 and len(next_line) > len(line) and next_line.startswith(line):
                is_new_record = True
                name = line
            # Heuristic 2: Known pest names (skip header "Pest Name")
            elif line not in headers_to_skip and "infestation" in next_line and len(line.split()) < 6:
                # likely a name followed by "infestation..." even if not exact match prefix
                is_new_record = True
                name = line

            if is_new_record:
                # Save previous
                if current_doc:
                    rows.append(current_doc)
                
                # Start new
                current_doc = {
                    "name": name, 
                    "id": name.replace(" ", "_"),
                    "symptoms": "",
                    "treatment_organic": "",
                    "treatment_inorganic": "",
                    "treatment_homemade": ""
                }
                # consume lines until we hit keywords
                i += 1
                continue

            # If we are inside a doc, parsing fields
            if current_doc:
                # Treatments detection
                if line.startswith("Neem oil") or "biopesticide" in line:
                    current_doc['treatment_organic'] = line
                elif line.startswith("Chemical pesticide") or "Chemical fertilizer" in line:
                    current_doc['treatment_inorganic'] = line
                elif line.startswith("Homemade remedy"):
                    current_doc['treatment_homemade'] = line
                elif "infestation" in line and "symptoms" in line:
                    current_doc['symptoms'] = line
                else:
                    # Append description lines? 
                    # For now just capture major fields.
                    pass

            i += 1
            
        if current_doc:
            rows.append(current_doc)
            
        print(f"Found {len(rows)} records to import.")
        
        updated_count = 0
        inserted_count = 0
        
        for row in rows:
            name = row['name']
            doc_id = row['id']
            
            update_doc = {}
            if row.get('symptoms'): update_doc['symptoms'] = [row['symptoms']]
            
            treatments = {}
            if row.get('treatment_organic'): treatments['organic'] = [row['treatment_organic']]
            if row.get('treatment_inorganic'): treatments['inorganic'] = [row['treatment_inorganic']]
            if row.get('treatment_homemade'): treatments['homemade'] = [row['treatment_homemade']]
            
            if treatments:
                for k, v in treatments.items():
                    update_doc[f'treatments.{k}'] = v
            
            # Upsert
            try:
                res = treatments_collection.update_one(
                    {"_id": doc_id},
                    {"$set": update_doc},
                    upsert=True
                )
                
                # Ensure name exists
                treatments_collection.update_one({"_id": doc_id}, {"$set": {"name": name}})

                if res.upserted_id:
                    inserted_count += 1
                elif res.modified_count > 0:
                    updated_count += 1
            except Exception as db_err:
                print(f"DB Error for {name}: {db_err}")
                
        print(f"Import Complete. Inserted: {inserted_count}, Updated: {updated_count}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    parse_and_import()
