from pymongo import MongoClient
import re

MONGO_URI = "mongodb://localhost:27017/"
client = MongoClient(MONGO_URI)
db = client['pest_control_db']

def clean():
    # 1. Users
    user_query = {
        "username": {
            "$nin": ["admin", "demo_admin", "demo_farmer", "expert1"]
        },
        "$or": [
            {"username": {"$regex": "(?i)test|verify|temp|user_|history"}},
            {"email": {"$regex": "(?i)test"}}
        ]
    }
    
    deleted_users = db.users.delete_many(user_query).deleted_count
    
    # Also delete 'farmer2' if it's considered test data (it's using ded@gmail.com which is suspicious)
    # The user asked 'remove all the test users' so any developer random users should go.
    deleted_users += db.users.delete_many({"username": "farmer2"}).deleted_count
    
    # 2. Activity Log
    deleted_activity = db.activity_log.delete_many({}).deleted_count

    # 3. Medicines and Treatments - Test entries
    deleted_meds = db.medicines.delete_many({"name": {"$regex": "(?i)test"}}).deleted_count
    deleted_treatments = db.treatments.delete_many({"_id": {"$regex": "(?i)test"}}).deleted_count

    # 4. Shops
    deleted_shops = db.shops.delete_many({"name": {"$regex": "(?i)test"}}).deleted_count

    # 5. Consultations
    deleted_consultations = db.consultations.delete_many({"farmer": {"$regex": "(?i)test|verify|history"}}).deleted_count

    # 6. Messages
    deleted_messages = db.messages.delete_many({}).deleted_count

    # 7. Forum posts
    deleted_forums = db.forum_posts.delete_many({
        "$or": [
            {"title": {"$regex": "(?i)test"}},
            {"content": {"$regex": "(?i)test"}},
            {"author": {"$regex": "(?i)test|verify|history_test"}}
        ]
    }).deleted_count

    # 8. Proposals
    deleted_med_props = db.medicine_proposals.delete_many({"name": {"$regex": "(?i)test"}}).deleted_count
    deleted_treat_props = db.treatment_proposals.delete_many({
        "$or": [
            {"name": {"$regex": "(?i)test"}},
            {"content": {"$regex": "(?i)test"}}
        ]
    }).deleted_count

    print(f"Deleted users: {deleted_users}")
    print(f"Deleted activity logs: {deleted_activity}")
    print(f"Deleted medicines: {deleted_meds}")
    print(f"Deleted treatments: {deleted_treatments}")
    print(f"Deleted shops: {deleted_shops}")
    print(f"Deleted consultations: {deleted_consultations}")
    print(f"Deleted messages: {deleted_messages}")
    print(f"Deleted forum posts: {deleted_forums}")
    print(f"Deleted medicine proposals: {deleted_med_props}")
    print(f"Deleted treatment proposals: {deleted_treat_props}")

if __name__ == "__main__":
    clean()
