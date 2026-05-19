from pymongo import MongoClient

MONGO_URI = "mongodb://localhost:27017/"
DB_NAME = "pest_control_db"

def clear_all():
    print("--- Clearing All History and Test Users ---")
    try:
        client = MongoClient(MONGO_URI)
        db = client[DB_NAME]
        
        # 1. Clear Activity Logs
        res = db["activity_log"].delete_many({})
        print(f"Deleted {res.deleted_count} activity logs.")
        
        # 2. Clear Consultations
        res = db["consultations"].delete_many({})
        print(f"Deleted {res.deleted_count} consultations.")

        # 3. Clear Proposals
        res = db["treatment_proposals"].delete_many({})
        print(f"Deleted {res.deleted_count} proposals.")
        
        # 4. Clear Non-Admin Users
        # Keep only 'admin'
        res = db["users"].delete_many({"username": {"$ne": "admin"}})
        print(f"Deleted {res.deleted_count} non-admin users.")
        
        # 5. Clear Messages
        res = db["messages"].delete_many({})
        print(f"Deleted {res.deleted_count} messages.")
        
        print("--- History Cleared ---")

    except Exception as e:
        print(f"[ERROR] {e}")

if __name__ == "__main__":
    clear_all()
