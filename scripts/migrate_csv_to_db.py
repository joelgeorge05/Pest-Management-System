import os
import csv
import pymongo
from dotenv import load_dotenv

# Load env safely
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
DB_NAME = "pest_control_db"

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
# Handle running from scripts/ dir
if os.path.basename(os.getcwd()) == 'scripts':
    BASE_DIR = os.path.dirname(os.getcwd())

CSV_PATH = os.path.join(BASE_DIR, 'backend', 'data', 'treatments.csv')

def normalize_key(key):
    # Match the normalization used in check_coverage
    return key.replace('___', '_').replace(' ', '_')

def migrate():
    print("--- Starting Migration ---")
    
    # 1. Connect to DB
    try:
        client = pymongo.MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        db = client[DB_NAME]
        treatments_col = db["treatments"]
        print(f"Connected to MongoDB: {DB_NAME}")
    except Exception as e:
        print(f"Error connecting to DB: {e}")
        return

    # 2. Read CSV
    if not os.path.exists(CSV_PATH):
        print(f"Error: {CSV_PATH} not found.")
        return

    csv_data = []
    with open(CSV_PATH, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
             csv_data.append(row)
    
    print(f"Found {len(csv_data)} records in CSV.")

    # 3. Migrate
    added_count = 0
    skipped_count = 0
    
    for row in csv_data:
        # We use the 'id' (normalized?) or raw? 
        # app.py currently loads CSV raw 'id' as key, then merges with DB using '_id'.
        # The DB overrides used the raw 'id' as '_id'. 
        # However, there seems to be a mismatch in keys (___ vs _). 
        # The User's custom overrides (e.g. 'Ampelophaga') might not match CSV keys if we aren't careful.
        # But wait, 'Ampelophaga' isn't in the CSV at all (that's why it's missing).
        
        # For existing CSV entries (e.g. 'Apple___Apple_scab'), we should use that exact ID as the _id 
        # so that if the user edits it later, it matches.
        
        doc_id = row['id']
        
        # Check if exists
        if treatments_col.count_documents({"_id": doc_id}) > 0:
            print(f"Skipping {doc_id} (already exists in DB)")
            skipped_count += 1
            continue
            
        # Parse treatments
        treatments_obj = {
            'organic': [t.strip() for t in row['treatment_organic'].split(';') if t.strip()],
            'inorganic': [t.strip() for t in row['treatment_inorganic'].split(';') if t.strip()],
            'homemade': [t.strip() for t in row['treatment_homemade'].split(';') if t.strip()]
        }
        
        # Create Doc
        doc = {
            "_id": doc_id,
            "name": row['name'],
            "description": row['description'],
            "symptoms": [s.strip() for s in row['symptoms'].strip().split(';') if s.strip()],
            "treatments": treatments_obj,
            "prevention": row['prevention'],
            "source": "csv_import" # Tag it
        }
        
        try:
            treatments_col.insert_one(doc)
            added_count += 1
        except Exception as e:
            print(f"Error inserting {doc_id}: {e}")

    print("-" * 30)
    print("Migration Complete.")
    print(f"Added: {added_count}")
    print(f"Skipped (Existing): {skipped_count}")

if __name__ == "__main__":
    migrate()
