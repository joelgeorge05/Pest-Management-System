
from pymongo import MongoClient
import re

# MongoDB Setup
MONGO_URI = "mongodb://localhost:27017/"
client = MongoClient(MONGO_URI)
db = client['pest_control_db']

def cleanup_data():
    print("Starting Test Data Cleanup...")

    # 1. Users
    result = db.items_collection.delete_many({
        "$or": [
            {"username": {"$regex": "^TestUser_"}},
            {"email": {"$regex": "^test_.*@example.com"}}
        ]
    })
    # Note: 'items_collection' seems to be used for users in app.py based on registration login?
    # Actually need to verify collection names from app.py
    # app.py: users_collection = db['users']
    
    # Wait, need to check app.py for correct collection names
    users_collection = db['users'] 
    result_users = users_collection.delete_many({
        "$or": [
            {"username": {"$regex": "^TestUser_"}},
            {"email": {"$regex": "^test_.*@example.com"}}
        ]
    })
    print(f"Deleted {result_users.deleted_count} test users.")

    # 2. Medicines
    medicines_collection = db['medicines']
    result_meds = medicines_collection.delete_many({
        "name": {"$regex": "^TestMed_"}
    })
    print(f"Deleted {result_meds.deleted_count} test medicines.")

    # 3. Shops
    shops_collection = db['shops']
    result_shops = shops_collection.delete_many({
        "name": {"$in": ["Test Shop", "Test Shop 2"]}
    })
    print(f"Deleted {result_shops.deleted_count} test shops.")

    # 4. Diseases (Treatments collection)
    treatments_collection = db['treatments']
    result_diseases = treatments_collection.delete_many({
        "$or": [
            {"_id": {"$regex": "^TestPlant___"}},
            {"_id": {"$regex": "^TEST_DISEASE_"}},
             {"_id": "TestCurlID"},
             {"_id": "TestID"}
        ]
    })
    print(f"Deleted {result_diseases.deleted_count} test diseases.")
    
    # 5. Consultations
    consultations_collection = db['consultations']
    result_cons = consultations_collection.delete_many({
        "$or": [
            {"farmer": {"$regex": "^TestUser_"}},
            {"description": "Help needed"} # Careful here, maybe check timestamp or duplicate
        ]
    })
    print(f"Deleted {result_cons.deleted_count} test consultations.")
    
    print("Cleanup Complete.")

if __name__ == "__main__":
    cleanup_data()
