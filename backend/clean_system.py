
from pymongo import MongoClient
import os
import shutil

# MongoDB Setup
MONGO_URI = "mongodb://localhost:27017/"
client = MongoClient(MONGO_URI)
db = client['pest_control_db']

def clean_system():
    print("--- Starting System Cleanup ---")

    # 1. Users - Delete 'test' users, keep admin/demo
    print("Cleaning Users...")
    res = db.users.delete_many({
        "username": {"$regex": "^(?i)(test|temp|user_)"},
        "username": {"$nin": ["admin", "demo_admin", "demo_farmer", "expert1"]} 
        # protecting specific known users just in case they matched 'user_'
    })
    print(f"  Deleted {res.deleted_count} test users.")
    
    # 2. Shops - specific test shop
    print("Cleaning Shops...")
    res = db.shops.delete_many({
        "$or": [
            {"name": {"$regex": "(?i)test"}},
            {"name": "soman shop"}
        ]
    })
    print(f"  Deleted {res.deleted_count} shops.")
    
    # 3. Proposals (Medicine & Treatment) - Delete all 'test' or 'hack' entries
    print("Cleaning Proposals...")
    res = db.medicine_proposals.delete_many({
        "$or": [
            {"name": {"$regex": "(?i)test"}},
            {"name": {"$regex": "<script>"}},
            {"diseases": {"$regex": "(?i)test"}}
        ]
    })
    print(f"  Deleted {res.deleted_count} medicine proposals.")

    res = db.treatment_proposals.delete_many({
         "$or": [
            {"name": {"$regex": "(?i)test"}},
            {"content": {"$regex": "(?i)test"}}
        ]
    })
    print(f"  Deleted {res.deleted_count} treatment proposals.")

    # 4. Forum Posts - Delete tests
    print("Cleaning Forum...")
    res = db.forum_posts.delete_many({
        "$or": [
            {"title": {"$regex": "(?i)test"}},
            {"content": {"$regex": "(?i)test"}}
        ]
    })
    print(f"  Deleted {res.deleted_count} forum posts.")

    # 5. Activity Log - Clear ALL for fresh demo
    print("Cleaning Activity Log...")
    res = db.activity_log.delete_many({})
    print(f"  Cleared {res.deleted_count} activity logs.")

    # 6. Messages - Clear ALL
    print("Cleaning Messages...")
    res = db.messages.delete_many({})
    print(f"  Cleared {res.deleted_count} messages.")

    # 7. Announcements - specific test
    print("Cleaning Announcements...")
    res = db.announcements.delete_many({
         "title": "System under Maintenance "
    })
    print(f"  Deleted {res.deleted_count} announcements.")
    
    # 8. Feedback - Clear ALL
    print("Cleaning Feedback...")
    res = db.feedback.delete_many({})
    print(f"  Cleared {res.deleted_count} feedback entries.")
    
    print("--- Cleanup Complete ---")

if __name__ == "__main__":
    clean_system()
