import csv
import os
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv(dotenv_path='backend/.env')

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
client = MongoClient(MONGO_URI)
db = client["pest_control_db"]
treatments_collection = db["treatments"]

CSV_FILE = "pest_disease_master_85plus.csv"

def import_data():
    if not os.path.exists(CSV_FILE):
        print(f"Error: {CSV_FILE} not found.")
        return

    count = 0
    updated = 0
    
    with open(CSV_FILE, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            original_name = row['Pest/Disease Name'].strip()
            
            # Normalize ID: Replace spaces with underscores to match potential model classes
            # Also handle some known variances if necessary, but simple replacement is a good start.
            disease_id = original_name.replace(" ", "_")
            
            # Prepare the document
            treatment_doc = {
                "_id": disease_id, # This is the key field
                "name": original_name,
                "description": row['Symptoms'], # Using Symptoms column as description
                "symptoms": [row['Symptoms']],
                "treatments": {
                    "organic": [row['Organic Medicine & Application']],
                    "inorganic": [row['Inorganic Medicine & Application']],
                    "homemade": [row['Homemade Remedy & Application']]
                },
                "prevention": "Monitor regularly and maintain field sanitation." # Default prevention if missing
            }
            
            # Upsert into MongoDB
            result = treatments_collection.replace_one(
                {"_id": disease_id},
                treatment_doc,
                upsert=True
            )
            
            if result.upserted_id:
                count += 1
                print(f"Inserted: {disease_id}")
            elif result.modified_count > 0:
                updated += 1
                print(f"Updated: {disease_id}")
            else:
                print(f"Skipped (No Change): {disease_id}")
                
    print(f"\nImport Finished.")
    print(f"Total Inserted: {count}")
    print(f"Total Updated: {updated}")
    print(f"Total Documents in DB: {treatments_collection.count_documents({})}")

if __name__ == "__main__":
    import_data()
