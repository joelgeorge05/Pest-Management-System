import pymongo

def fix_database_errors():
    try:
        client = pymongo.MongoClient("mongodb://localhost:27017/")
        db = client["pest_control_db"]
    except Exception as e:
        print(f"Failed to connect to Mongo: {e}")
        return

    print("=== STARTING DATABASE CLEANUP ===\n")

    # 1. Fix missing display names in treatments
    treat_col = db["treatments"]
    treatments = list(treat_col.find())
    fixed_treatments = 0
    
    for t in treatments:
        doc_id = t['_id']
        updates = {}
        
        # Check and fix missing display name
        if not t.get("name"):
            # Generate a nice formatting name from the ID
            clean_name = doc_id.replace("___", " ").replace("_", " ").title()
            # Special formatting for healthy plants
            if "Healthy" in clean_name:
                clean_name = clean_name.replace(" Healthy", " (Healthy)")
            updates["name"] = clean_name
            
        # Check for absolutely missing symptoms
        if "symptoms" not in t or not isinstance(t.get("symptoms"), list):
            if "healthy" in doc_id.lower():
                updates["symptoms"] = ["Plant appears vibrant and healthy", "No visible spots or wilting"]
            else:
                updates["symptoms"] = ["Symptoms currently unlisted. Please observe plant for damage, spots, or discoloration."]
                
        # Check for missing description
        if "description" not in t:
             if "healthy" in doc_id.lower():
                 updates["description"] = "This plant is healthy and shows no signs of disease."
             else:
                 updates["description"] = "A detailed diagnostic description is currently unavailable."

        if updates:
            treat_col.update_one({'_id': doc_id}, {'$set': updates})
            print(f"Fixed missing fields for treatment: {doc_id}")
            fixed_treatments += 1

    # 2. Clean up malformed forum posts
    forum_col = db["forum_posts"]
    posts = list(forum_col.find())
    deleted_posts = 0
    
    for p in posts:
        # If it's missing BOTH author and content, it's a ghost post
        if not p.get("author") and not p.get("content") and not p.get("question"):
            forum_col.delete_one({'_id': p['_id']})
            print(f"Deleted malformed ghost forum post: {p['_id']}")
            deleted_posts += 1

    print("\n" + "="*30)
    print(f"CLEANUP COMPLETE.")
    print(f"Treatments patched with missing data: {fixed_treatments}")
    print(f"Ghost forum posts deleted: {deleted_posts}")

if __name__ == "__main__":
    fix_database_errors()
