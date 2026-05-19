
import os
from pymongo import MongoClient
import json
from datetime import datetime

# MongoDB Setup
MONGO_URI = "mongodb://localhost:27017/"
client = MongoClient(MONGO_URI)
db = client['pest_control_db']

def default_converter(o):
    if isinstance(o, datetime):
        return o.isoformat()
    if hasattr(o, '__str__'):
        return str(o)
    return o

def audit_db():
    print("--- Database Audit ---")
    collections = db.list_collection_names()
    print(f"Collections: {collections}")
    
    for col_name in collections:
        if col_name.startswith('system.'): continue
        
        col = db[col_name]
        count = col.count_documents({})
        print(f"\nCollection: {col_name} (Count: {count})")
        
        if count > 0:
            print("  Sample Data (First 3):")
            cursor = col.find().limit(3)
            for doc in cursor:
                # hide large fields
                if 'image' in doc and len(str(doc['image'])) > 100:
                    doc['image'] = "<BINARY/LARGE_STRING>"
                if 'profile_image' in doc and doc['profile_image'] and len(doc['profile_image']) > 100:
                     doc['profile_image'] = str(doc['profile_image'])[:50] + "..."
                
                print(f"    {json.dumps(doc, default=default_converter, indent=2)}")

if __name__ == "__main__":
    audit_db()
