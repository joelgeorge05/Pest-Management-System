import pymongo
import re

def find_diseases_without_dosage():
    try:
        client = pymongo.MongoClient("mongodb://localhost:27017/")
        db = client["pest_control_db"]
        
        # Check treatments collection
        treatments_col = db["treatments"]
        
        dosage_pattern = re.compile(r'(\d+(?:\.\d+)?)\s*(ml|g|kg|gm|l|litre|liter)', re.IGNORECASE)
        
        diseases_without_dosage = []
        
        for doc in treatments_col.find():
            disease_id = doc.get('_id', '')
            if 'healthy' in disease_id.lower() or 'background' in disease_id.lower():
                continue
                
            treatments = doc.get('treatments', {})
            has_dosage = False
            
            # Check all treatment types
            for t_type in ['organic', 'inorganic', 'chemical', 'homemade']:
                items = treatments.get(t_type, [])
                if isinstance(items, str):
                    items = [items]
                    
                for item in items:
                    if isinstance(item, str) and dosage_pattern.search(item):
                        has_dosage = True
                        break
                    elif isinstance(item, dict):
                        usage = item.get('usage', '')
                        if dosage_pattern.search(usage):
                            has_dosage = True
                            break
                            
                if has_dosage:
                    break
                    
            if not has_dosage:
                diseases_without_dosage.append(disease_id)
                
        print(f"Total diseases checked: {treatments_col.count_documents({})}")
        print(f"Diseases WITHOUT dosage descriptions: {len(diseases_without_dosage)}")
        for d in diseases_without_dosage:
            print(f"- {d}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    find_diseases_without_dosage()
