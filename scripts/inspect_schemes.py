import os
import pymongo
from dotenv import load_dotenv

# Load env safely
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
DB_NAME = "pest_control_db"

def inspect_schemes():
    print("--- Inspecting Schemes (Subsidies) ---")
    
    try:
        client = pymongo.MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        db = client[DB_NAME]
        subsidies_col = db["subsidies"]
        
        docs = list(subsidies_col.find({}))
        print(f"Total Schemes: {len(docs)}\n")
        
        for doc in docs:
            print(f"ID: {doc.get('_id')}")
            print(f"Title: {doc.get('title', 'N/A')}")
            print(f"Category: {doc.get('category', 'N/A')}")
            print("-" * 20)
            
    except Exception as e:
        print(f"Error connecting to DB: {e}")

if __name__ == "__main__":
    inspect_schemes()
