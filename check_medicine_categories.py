import pymongo
import json
import os

def check_medicine_categories():
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
        
    missing_organic = []
    missing_chemical = []
    missing_homemade = []
    
    completely_empty = []
    
    for cls in classes:
        # Fetch treatment from DB
        doc = treat_col.find_one({"_id": cls})
        if not doc:
            doc = treat_col.find_one({"id": cls}) 
            
        if not doc:
            # Maybe it wasn't saved directly with the exact id, try a fallback lookup if needed
            print(f"DEBUG: {cls} not found in DB at all.")
            completely_empty.append(cls)
            continue
            
        treatments = doc.get("treatments", {})
        
        # Safe extraction (some might be strings instead of lists if empty, or just missing)
        org = treatments.get("organic", [])
        inorg = treatments.get("inorganic", treatments.get("chemical", []))
        home = treatments.get("homemade", [])
        
        has_org = len(org) > 0 if isinstance(org, list) else org != ""
        has_inorg = len(inorg) > 0 if isinstance(inorg, list) else inorg != ""
        has_home = len(home) > 0 if isinstance(home, list) else home != ""
        
        if not has_org:
            missing_organic.append(cls)
        if not has_inorg:
            missing_chemical.append(cls)
        if not has_home:
            missing_homemade.append(cls)
            
        if not has_org and not has_inorg and not has_home:
            completely_empty.append(cls)

    print(f"Total classes checked: {len(classes)}\n")
    
    print(f"Classes completely empty (0 treatments across all categories): {len(completely_empty)}")
    print(f"Classes missing Organic recommendations: {len(missing_organic)}")
    print(f"Classes missing Chemical/Inorganic recommendations: {len(missing_chemical)}")
    print(f"Classes missing Homemade recommendations: {len(missing_homemade)}\n")
    
    print("--- Detailed Breakdown (`Healthy` classes often intentionally lack medicine) ---")
    
    # Filter out "healthy" classes to see genuine missing diseases/pests
    missing_org_vuln = [c for c in missing_organic if "healthy" not in c.lower() and "background" not in c.lower()]
    missing_chem_vuln = [c for c in missing_chemical if "healthy" not in c.lower() and "background" not in c.lower()]
    missing_home_vuln = [c for c in missing_homemade if "healthy" not in c.lower() and "background" not in c.lower()]
    
    print(f"\nMissing Organic (excluding healthy plants): {len(missing_org_vuln)}")
    if len(missing_org_vuln) < 15:
        print([c for c in missing_org_vuln])
        
    print(f"\nMissing Chemical (excluding healthy plants): {len(missing_chem_vuln)}")
    if len(missing_chem_vuln) < 15:
        print([c for c in missing_chem_vuln])
        
    print(f"\nMissing Homemade (excluding healthy plants): {len(missing_home_vuln)}")
    if len(missing_home_vuln) < 15:
        print([c for c in missing_home_vuln])


if __name__ == "__main__":
    check_medicine_categories()
