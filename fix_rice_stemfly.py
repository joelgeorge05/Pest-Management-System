from pymongo import MongoClient
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv(dotenv_path='backend/.env')

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
client = MongoClient(MONGO_URI)
db = client["pest_control_db"]
treatments_collection = db["treatments"]

# Find the document
doc = treatments_collection.find_one({"_id": "paddy_stem_maggot"})

if doc:
    # Insert new document with correct ID
    new_doc = doc.copy()
    new_doc["_id"] = "Rice_Stemfly"
    treatments_collection.insert_one(new_doc)
    
    # Delete old document
    treatments_collection.delete_one({"_id": "paddy_stem_maggot"})
    print("Successfully renamed 'paddy_stem_maggot' to 'Rice_Stemfly'")
else:
    # Check if target already exists
    if treatments_collection.find_one({"_id": "Rice_Stemfly"}):
         print("'Rice_Stemfly' already exists.")
    else:
         print("'paddy_stem_maggot' not found.")
