
from pymongo import MongoClient

try:
    client = MongoClient('mongodb://localhost:27017/')
    db = client['pest_control_db']
    users = db['users']
    
    result = users.update_one(
        {"username": "farmer_bob"},
        {"$set": {
            "name": "Farmer Bob", 
            "address": "123 Farm Lane", 
            "phone": "9998887777", 
            "pincode": "123456",
            "email": "bob@farm.com"
        }}
    )
    print(f"Updated: {result.modified_count}")
    
except Exception as e:
    print(e)
