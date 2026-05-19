
import pymongo
import re

# Connect to MongoDB
client = pymongo.MongoClient("mongodb://localhost:27017/")
db = client["pest_management"]
treatments_collection = db["treatments"]

def parse_and_import():
    try:
        with open("debug_pdf_log.txt", "r", encoding="utf-8") as f:
            text = f.read()
            
        print(f"Read {len(text)} chars from log.")
        
        rows = []
        lines = text.split('\n')
        current_doc = {}
        
        # Keywords to skip
        headers_to_skip = ["Pest Name", "Symptoms", "Organic", "Inorganic", "Homemade", "General preventive measures:", "Background without leaves"]

        for i, line in enumerate(lines):
            line = line.strip()
            if not line or line in headers_to_skip: continue
            
            # Treatments
            if line.startswith("Neem oil") or "biopesticide" in line:
                    if current_doc: current_doc['treatment_organic'] = line
                    continue
            
            if line.startswith("Chemical pesticide") or "Chemical fertilizer" in line:
                    if current_doc: current_doc['treatment_inorganic'] = line
                    continue

            if line.startswith("Homemade remedy"):
                    if current_doc: current_doc['treatment_homemade'] = line
                    continue
                    
            # Symptoms & Name Detection
            if "infestation shows symptoms" in line:
                infestation_index = line.find(" infestation shows symptoms")
                if infestation_index != -1:
                    potential_name = line[:infestation_index].strip()
                    symptoms_text = line[infestation_index:].strip()
                    
                    if not current_doc or (current_doc.get('name') != potential_name):
                        if current_doc and current_doc.get('name'):
                            rows.append(current_doc)
                        
                        current_doc = {
                            "name": potential_name,
                            "id": potential_name.replace(" ", "_"),
                            "symptoms": symptoms_text
                        }
                    else:
                        current_doc['symptoms'] = symptoms_text
                continue

        if current_doc and current_doc.get('name'):
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
                
        print(f"Import Complete. Inserted: {inserted_count}, Updated: {updated_count}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    parse_and_import()
