import os
import pymongo
from dotenv import load_dotenv

# Load env safely
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
DB_NAME = "pest_control_db"

def delete_test_schemes():
    print("--- Deleting Test Schemes ---")
    
    try:
        client = pymongo.MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        db = client[DB_NAME]
        subsidies_col = db["subsidies"]
        
        # Criteria for deletion
        # 1. Exact Titles
        titles_to_openly_delete = [
            "Test Scheme", 
            "Test Scheme with Link", 
            "Test Scheme with Brochure",
            "noel"
        ]
        
        # 2. Delete by ID if title matches
        result = subsidies_col.delete_many({"title": {"$in": titles_to_openly_delete}})
        print(f"Deleted {result.deleted_count} test schemes.")
        
        # 3. Handle duplicates of "Organic Farming Grant 2026"
        # We want to keep ONE and delete the others.
        grant_title = "Organic Farming Grant 2026"
        grants = list(subsidies_col.find({"title": grant_title}))
        
        if len(grants) > 1:
            print(f"Found {len(grants)} duplicates of '{grant_title}'. Keeping the first one.")
            # Sort by ID (usually creation time)
            # grants.sort(key=lambda x: x['_id']) # ObjectId is roughly chronological
            
            # Keep the first one, delete rest
            ids_to_delete = [g['_id'] for g in grants[1:]]
            
            del_res = subsidies_col.delete_many({"_id": {"$in": ids_to_delete}})
            print(f"Deleted {del_res.deleted_count} duplicate grants.")
            
    except Exception as e:
        print(f"Error connecting to DB: {e}")

if __name__ == "__main__":
    delete_test_schemes()
