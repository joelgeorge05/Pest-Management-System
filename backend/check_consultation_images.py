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
        consultations = db["consultations"]
        
        for c in consultations.find().sort("_id", -1).limit(3):
            print(f"ID: {c.get('_id')}")
            print(f"Image: {c.get('image')}")
            print("---")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    main()
