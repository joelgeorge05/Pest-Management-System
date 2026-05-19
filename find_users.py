
from pymongo import MongoClient

try:
    client = MongoClient('mongodb://localhost:27017/')
    db = client['pest_control_db']
    users = db['users'].find()
    print("--- USERS ---")
    for u in users:
        print(f"User: {u.get('username')}, Role: {u.get('role')}, Pass: {u.get('password')}")
except Exception as e:
    print(e)
