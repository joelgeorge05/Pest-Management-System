import pymongo
import json
import os

def check_medicine_details():
    try:
        client = pymongo.MongoClient("mongodb://localhost:27017/")
        db = client["pest_control_db"]
        treat_col = db["treatments"]
    except Exception as e:
        print(f"Failed to connect to Mongo: {e}")
        return

    base_dir = r"c:\Users\Acer\OneDrive\Videos\Pictures\Documents\Desktop\pest\backend"
    class_idx_path = os.path.join(base_dir, "class_indices_final.json")
    
    with open(class_idx_path, 'r') as f:
        classes = list(json.load(f).keys())
        
    missing_usage_details = {
        "organic": [],
        "inorganic": [],
        "homemade": []
    }
    
    instruction_keywords = [
        "spray", "apply", "ml", "mg", "liter", "l", "gallon", "gram", "dose", 
        "dilute", "mix", "days", "weeks", "solution", "dust", "tsp", "tbsp", "%",
        "dosage", "usage", "per"
    ]
    
    def extract_text(item):
        if isinstance(item, str):
            return item
        elif isinstance(item, dict):
            # Try to grab all text values from the dict to search
            return " ".join([str(v) for v in item.values() if isinstance(v, (str, int, float))])
        return ""
    
    for cls in classes:
        if "healthy" in cls.lower() or "background" in cls.lower():
            continue
            
        doc = treat_col.find_one({"_id": cls})
        if not doc:
            doc = treat_col.find_one({"id": cls}) 
            
        if not doc:
            continue
            
        treatments = doc.get("treatments", {})
        org_list = treatments.get("organic", [])
        inorg_list = treatments.get("inorganic", treatments.get("chemical", []))
        home_list = treatments.get("homemade", [])
        
        if isinstance(org_list, str): org_list = [org_list]
        if isinstance(inorg_list, str): inorg_list = [inorg_list]
        if isinstance(home_list, str): home_list = [home_list]
        if isinstance(org_list, dict): org_list = [org_list]
        if isinstance(inorg_list, dict): inorg_list = [inorg_list]
        if isinstance(home_list, dict): home_list = [home_list]
        
        # Check organic
        org_has_details = False
        for item in org_list:
            text = extract_text(item).lower()
            if any(kw in text for kw in instruction_keywords) and len(text) > 15:
                org_has_details = True
                break
        if not org_has_details and len(org_list) > 0:
            missing_usage_details["organic"].append(cls)
            
        # Check inorganic
        inorg_has_details = False
        for item in inorg_list:
            text = extract_text(item).lower()
            if any(kw in text for kw in instruction_keywords) and len(text) > 15:
                inorg_has_details = True
                break
        if not inorg_has_details and len(inorg_list) > 0:
            missing_usage_details["inorganic"].append(cls)
            
        # Check homemade
        home_has_details = False
        for item in home_list:
            text = extract_text(item).lower()
            if any(kw in text for kw in instruction_keywords) and len(text) > 15:
                home_has_details = True
                break
        if not home_has_details and len(home_list) > 0:
            missing_usage_details["homemade"].append(cls)

    print("--- Medicine Usage & Dosage Analysis ---\n")
    print(f"Classes with organic meds lacking usage/dosage info: {len(missing_usage_details['organic'])}")
    print(f"Classes with chemical meds lacking usage/dosage info: {len(missing_usage_details['inorganic'])}")
    print(f"Classes with homemade meds lacking usage/dosage info: {len(missing_usage_details['homemade'])}\n")
    
    total_missing = set(missing_usage_details['organic'] + missing_usage_details['inorganic'] + missing_usage_details['homemade'])
    print(f"TOTAL unique classes with at least one category missing detailed instructions: {len(total_missing)}\n")

    if missing_usage_details['inorganic']:
        print("Example classes missing chemical dosage info (First 10):")
        for c in missing_usage_details['inorganic'][:10]:
            print(f"- {c}")

if __name__ == "__main__":
    check_medicine_details()
