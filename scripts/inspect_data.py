from pymongo import MongoClient

MONGO_URI = "mongodb://localhost:27017/"
DB_NAME = "pest_control_db"

def inspect():
    print("--- Inspecting Database ---")
    try:
        client = MongoClient(MONGO_URI)
        db = client[DB_NAME]
        
        users = list(db["users"].find({}, {"username": 1, "role": 1}))
        print(f"\nTotal Users: {len(users)}")
        for u in users:
            print(f" - {u['username']} ({u['role']})")
            
        logs_count = db["activity_log"].count_documents({})
        print(f"\nActivity Logs: {logs_count}")
        
        consultations_count = db["consultations"].count_documents({})
        print(f"Consultations: {consultations_count}")
        
        proposals_count = db["treatment_proposals"].count_documents({})
        print(f"Proposals: {proposals_count}")

    except Exception as e:
        print(f"[ERROR] {e}")

if __name__ == "__main__":
    inspect()
