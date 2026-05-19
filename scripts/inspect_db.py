import os
from pymongo import MongoClient

MONGO_URI = "mongodb://localhost:27017/"
DB_NAME = "pest_control_db"

def inspect():
    try:
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=2000)
        client.admin.command('ping')
        print("Connected to MongoDB successfully.\n")
        
        db = client[DB_NAME]
        collections = db.list_collection_names()
        
        print(f"Database: {DB_NAME}")
        print("-" * 30)
        
        for col_name in collections:
            count = db[col_name].count_documents({})
            print(f"Collection: {col_name} ({count} documents)")
            
            # Show up to 3 sample docs
            docs = list(db[col_name].find().limit(3))
            for i, doc in enumerate(docs):
                # Convert ObjectId to string for display
                doc['_id'] = str(doc['_id'])
                print(f"  {i+1}. {doc}")
            print("-" * 30)
            
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")

if __name__ == "__main__":
    inspect()
