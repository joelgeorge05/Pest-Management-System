import pymongo
import json
import os

def check_mongodb():
    # Connect
    try:
        client = pymongo.MongoClient("mongodb://localhost:27017/")
        db = client["pest_control_db"]
        if "medicines" not in db.list_collection_names() and "treatments" not in db.list_collection_names():
            print("Collections not found. Is DB seeded?")
            return
    except Exception as e:
        print(f"Failed to connect to Mongo: {e}")
        return

    # Load the 99 missing classes
    base_dir = r"c:\Users\Acer\OneDrive\Videos\Pictures\Documents\Desktop\pest\backend"
    class_idx_path = os.path.join(base_dir, "class_indices_final.json")
    treat_map_path = os.path.join(base_dir, "data", "model_treatment_map.json")
    
    with open(class_idx_path, 'r') as f:
        classes = list(json.load(f).keys())
    with open(treat_map_path, 'r') as f:
        mapped = list(json.load(f).keys())
        
    missing = set(classes) - set(mapped)
    
    print(f"Checking MongoDB for {len(missing)} missing pest names...\n")
    
    # Check medicines collection
    med_col = db["medicines"]
    treat_col = db["treatments"]
    
    found_in_meds = []
    found_in_treats = []
    
    for pest in missing:
        # Standardize name for search
        search_terms = [
            pest,
            pest.replace("_", " "),
            pest.replace("___", " ")
        ]
        
        # Searching medicines collection (maybe it's in the description or target_disease?)
        med_query = {"$or": [
            {"target_disease": {"$in": search_terms}},
            {"name": {"$in": search_terms}},
            {"description": {"$regex": search_terms[1] if len(search_terms) > 1 else pest, "$options": "i"}}
        ]}
        meds_found = list(med_col.find(med_query))
        if meds_found:
            found_in_meds.append((pest, len(meds_found)))
            
        # Searching treatments collection
        treat_query = {"$or": [
            {"_id": {"$in": search_terms}},
            {"name": {"$in": search_terms}}
        ]}
        treats_found = list(treat_col.find(treat_query))
        if treats_found:
            found_in_treats.append((pest, len(treats_found)))

    print("--- Results in 'medicines' collection ---")
    if not found_in_meds:
        print("No medicines found for any of the 99 missing pests.")
    else:
        for p, count in found_in_meds:
            print(f"- {p}: {count} medicines found")
            
    print("\n--- Results in 'treatments' collection ---")
    if not found_in_treats:
        print("No treatments found for any of the 99 missing pests.")
    else:
        for p, count in found_in_treats:
            print(f"- {p}: {count} treatments found")

if __name__ == "__main__":
    check_mongodb()
