import pymongo

def add_dosages():
    try:
        client = pymongo.MongoClient("mongodb://localhost:27017/")
        db = client["pest_control_db"]
        treat_col = db["treatments"]
    except Exception as e:
        print(f"Failed to connect to Mongo: {e}")
        return

    # Helper function to check if dosage exists
    import re
    dosage_pattern = re.compile(r'(\d+(?:\.\d+)?)\s*(ml|g|kg|gm|l|litre|liter)', re.IGNORECASE)
    
    def needs_dosage(v):
        if not isinstance(v, str): return False
        if len(v.strip()) == 0: return False  # Empty strings don't need dosage
        # If the pattern is found, it already has dosage. So it needs dosage if the pattern is NOT found.
        if dosage_pattern.search(v):
            return False
        return True

    updates_made = 0
    
    # Iterate over all non-healthy treatments
    for doc in treat_col.find():
        doc_id = doc['_id']
        if 'healthy' in doc_id.lower() or 'background' in doc_id.lower():
            continue
            
        treatments = doc.get('treatments', {})
        org_list = treatments.get('organic', [])
        inorg_list = treatments.get('inorganic', treatments.get('chemical', []))
        home_list = treatments.get('homemade', [])
        
        # Ensure lists
        if isinstance(org_list, str): org_list = [org_list]
        if isinstance(inorg_list, str): inorg_list = [inorg_list]
        if isinstance(home_list, str): home_list = [home_list]
        
        modified = False
        
        # Update Organic
        new_org = []
        for item in org_list:
            if needs_dosage(item):
                if item.endswith('.'):
                    new_org.append(f"{item} Mix 5ml per 1 liter of water and spray every 7-10 days.")
                else:
                    new_org.append(f"{item}. Mix 5ml per 1 liter of water and spray every 7-10 days.")
                modified = True
            else:
                new_org.append(item)
                
        # Update Chemical
        new_inorg = []
        for item in inorg_list:
            if needs_dosage(item):
                if item.endswith('.'):
                    new_inorg.append(f"{item} Apply 2ml or 2g per 1 liter of water. Spray thoroughly on affected areas.")
                else:
                    new_inorg.append(f"{item}. Apply 2ml or 2g per 1 liter of water. Spray thoroughly on affected areas.")
                modified = True
            else:
                new_inorg.append(item)
                
        # Update Homemade
        new_home = []
        for item in home_list:
            if needs_dosage(item):
                if item.endswith('.'):
                    new_home.append(f"{item} Dilute heavily with water and apply directly to affected leaves.")
                else:
                    new_home.append(f"{item}. Dilute heavily with water and apply directly to affected leaves.")
                modified = True
            else:
                new_home.append(item)

        if modified:
            # Save back to database
            treat_col.update_one(
                {'_id': doc_id},
                {'$set': {
                    'treatments.organic': new_org,
                    'treatments.inorganic': new_inorg,
                    'treatments.homemade': new_home
                }}
            )
            print(f"Updated dosages for: {doc_id}")
            updates_made += 1

    print(f"\nCompleted! Total entries updated with dosage instructions: {updates_made}")

if __name__ == "__main__":
    add_dosages()
