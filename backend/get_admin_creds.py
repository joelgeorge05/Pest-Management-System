from pymongo import MongoClient
import os
from dotenv import load_dotenv

BASE_DIR = r"c:\Users\Acer\OneDrive\Videos\Pictures\Documents\Desktop\pest\backend"
load_dotenv(os.path.join(BASE_DIR, '.env'))
MONGO_URI = os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017/")
DB_NAME = "pest_control_db"

def main():
    try:
        client = MongoClient(MONGO_URI)
        db = client[DB_NAME]
        users = db["users"]
        
        admin = users.find_one({"role": "admin"})
        if admin:
            print(f"Admin Username: {admin.get('username')}")
            print(f"Admin Password: {admin.get('password')}")
        else:
            print("No admin user found.")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    main()
