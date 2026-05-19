import pymongo
import json
import os

def check_missing_descriptions():
    try:
        client = pymongo.MongoClient("mongodb://localhost:27017/")
        db = client["pest_control_db"]
        treat_col = db["treatments"]
    except Exception as e:
        print(f"Failed to connect to Mongo: {e}")
        return

    # Load all 135 classes
    base_dir = r"c:\Users\Acer\OneDrive\Videos\Pictures\Documents\Desktop\pest\backend"
    class_idx_path = os.path.join(base_dir, "class_indices_final.json")
    
    with open(class_idx_path, 'r') as f:
        classes = list(json.load(f).keys())
        
    missing_descriptions = []
    default_descriptions = []
    
    for cls in classes:
        doc = treat_col.find_one({"_id": cls})
        if not doc:
            doc = treat_col.find_one({"id": cls}) 
            
        if not doc:
            continue
            
        desc = doc.get("description", "").strip()
        
        if not desc:
            missing_descriptions.append(cls)
        elif "No description available" in desc or "Newly created class" in desc or desc == "No description provided yet.":
            default_descriptions.append(cls)

    print(f"Total classes checked: {len(classes)}\n")
    
    print(f"Classes with COMPLETELY EMPTY descriptions: {len(missing_descriptions)}")
    for c in missing_descriptions:
        print(f"- {c}")
        
    print(f"\nClasses with DEFAULT/PLACEHOLDER descriptions: {len(default_descriptions)}")
    for c in default_descriptions:
        print(f"- {c}")

if __name__ == "__main__":
    check_missing_descriptions()
