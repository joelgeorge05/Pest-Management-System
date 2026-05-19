import requests
import datetime
from pymongo import MongoClient
import os
import csv
from werkzeug.security import generate_password_hash

# --- Configuration ---
MONGO_URI = "mongodb://localhost:27017/"
DB_NAME = "pest_control_db"
CSV_PATH = os.path.join("backend", "data", "treatments.csv")

# --- Data to Seed ---

# 1. Users
USERS = [
    {
        "username": "admin",
        "password": "admin123", # Will be hashed
        "role": "admin",
        "name": "System Admin",
        "email": "admin@pestcontrol.com",
        "address": "Admin HQ, Tech Park",
        "phone": "9998887770",
        "pincode": "560001",
        "is_suspended": False
    },
    {
        "username": "farmer",
        "password": "farmer123",
        "role": "farmer",
        "name": "Ramesh Kumar",
        "email": "ramesh.kumar@email.com",
        "address": "12, Green Fields, Village Road",
        "phone": "9876543210",
        "pincode": "560060",
        "is_suspended": False
    },
    {
        "username": "expert",
        "password": "expert123",
        "role": "expert",
        "name": "Dr. Anjali Menon",
        "specialization": "Plant Pathology",
        "phone": "9898989898",
        "is_suspended": False
    }
]

# 2. shops
SHOPS = [
    {
        "name": "Kisan Seva Kendra",
        "address": "Shop No. 4, Main Market, Rural District",
        "contact": "9876500001",
        "location": "Rural District",
        "photo": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1000"
    },
    {
        "name": "Green Earth Organics",
        "address": "Plot 22, Agro Tech Park, North Zone",
        "contact": "9876500002",
        "location": "North Zone",
        "photo": "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&q=80&w=1000"
    },
    {
        "name": "Pest Control Supplies",
        "address": "15, Industrial Estate, South Zone",
        "contact": "9876500003",
        "location": "South Zone",
        "photo": "https://images.unsplash.com/photo-1589923188900-85dae5233c78?auto=format&fit=crop&q=80&w=1000"
    }
]

# 3. Medicines (WILL BE AUGMENTED BY CSV)
MEDICINES = [
    # Keeping a few manual ones that might not be in CSV or are generic
    {
        "name": "Universal Neem Mix",
        "plant": "General",
        "diseases": "Aphids, Whiteflies, General Pests",
        "symptoms": "Yellowing leaves, sticky residue",
        "usage": "Mix 5ml per liter of water. Spray every 7 days.",
        "type": "Organic"
    }
]

# 4. Forum Posts
FORUM_POSTS = [
    {
        "question": "Leaves turning yellow on my tomato plant",
        "author": "Ramesh Kumar", # Matches farmer
        "description": "I noticed the lower leaves of my tomato plant are turning yellow and dropping off. Is this a disease?",
        "timestamp": (datetime.datetime.now() - datetime.timedelta(days=2)).strftime("%Y-%m-%d %H:%M:%S"),
        "answers": [
            {
                "answer": "It could be Nitrogen deficiency or simply old leaves shedding. Check if new leaves are healthy. If they are yellow too, apply nitrogen-rich fertilizer.",
                "author": "Dr. Anjali Menon",
                "timestamp": (datetime.datetime.now() - datetime.timedelta(days=1)).strftime("%Y-%m-%d %H:%M:%S")
            }
        ]
    },
    {
        "question": "Best organic pesticide for aphids?",
        "author": "Suresh Farmer",
        "description": "I have a heavy aphid infestation on my beans. I want to avoid chemicals.",
        "timestamp": (datetime.datetime.now() - datetime.timedelta(hours=5)).strftime("%Y-%m-%d %H:%M:%S"),
        "answers": []
    }
]

# 5. Government Subsidies
SUBSIDIES = [
    {
        "title": "Organic Farming Subsidy 2026",
        "description": "Get up to 50% subsidy on organic fertilizers and pesticides purchase. Apply before March 31st.",
        "date_posted": (datetime.datetime.now() - datetime.timedelta(days=10)).strftime("%Y-%m-%d")
    },
    {
        "title": "Drip Irrigation Scheme",
        "description": "Subsidies available for installing drip irrigation systems for small farmers.",
        "date_posted": (datetime.datetime.now() - datetime.timedelta(days=20)).strftime("%Y-%m-%d")
    }
]

# 6. Consultations
CONSULTATIONS = [
     {
        "farmer": "Ramesh Kumar",
        "crop": "Tomato",
        "disease": "Unknown",
        "description": "Black spots appearing on the stem.",
        "status": "pending",
        "timestamp": (datetime.datetime.now() - datetime.timedelta(hours=2)).strftime("%Y-%m-%d %H:%M:%S"),
        "replies": []
    }
]

def parse_medicines_from_csv():
    print(f"\n--- Parsing Medicines from {CSV_PATH} ---")
    if not os.path.exists(CSV_PATH):
        print(f"WARNING: CSV file not found at {CSV_PATH}. Skipping CSV import.")
        return []

    new_medicines = []
    
    try:
        with open(CSV_PATH, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                # row keys: id,name,description,symptoms,treatment_organic,treatment_inorganic,treatment_homemade,prevention
                
                # Parse ID to get Plant Name (e.g. "Apple___Apple_scab" -> "Apple")
                raw_id = row['id']
                if "___" in raw_id:
                    plant_name = raw_id.split("___")[0].replace("_", " ").strip()
                else:
                    plant_name = "General"
                
                disease_name = row['name']
                symptoms = row['symptoms']
                
                # Skip "Healthy" entries for medicines list usually, but let's keep them if they have prevention tips?
                # Actually, schemas are for medicines. Healthy plants don't need medicines.
                if "healthy" in raw_id.lower():
                     continue

                # Helper to add medicines
                def add_meds(treatment_str, m_type):
                    if not treatment_str: return
                    # Split by semicolon
                    items = [t.strip() for t in treatment_str.split(';') if t.strip()]
                    for item in items:
                        # Clean up item
                        # Create medicine entry
                        med = {
                            "name": item, # Use the treatment itself as the name
                            "plant": plant_name,
                            "diseases": disease_name,
                            "symptoms": symptoms[:100] + "..." if len(symptoms) > 100 else symptoms, # Truncate if too long
                            "usage": f"Recommended {m_type} treatment for {disease_name}.",
                            "type": m_type.capitalize()
                        }
                        new_medicines.append(med)

                add_meds(row.get('treatment_organic'), "Organic")
                add_meds(row.get('treatment_inorganic'), "Inorganic")
                add_meds(row.get('treatment_homemade'), "Homemade")
                
    except Exception as e:
        print(f"Error parsing CSV: {e}")
        
    print(f"Parsed {len(new_medicines)} treatments from CSV.")
    return new_medicines

def clean_and_seed():
    print("Connecting to MongoDB...")
    try:
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        client.admin.command('ping')
        db = client[DB_NAME]
        print(f"Connected to {DB_NAME}")
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")
        return

    # --- CLEAR EXISTING DATA ---
    print("\n--- Clearing Existing Data ---")
    collections_to_clear = [
        "users", "shops", "medicines", "medicine_proposals", 
        "forum_posts", "subsidies", "consultations", "messages", "activity_log"
    ]
    
    for col_name in collections_to_clear:
        count = db[col_name].count_documents({})
        if count > 0:
            db[col_name].delete_many({})
            print(f"Cleared {count} documents from '{col_name}'")
        else:
            print(f"'{col_name}' is already empty")

    # --- SEED USERS ---
    print("\n--- Seeding Users ---")
    for user in USERS:
        # Hash password
        user_data = user.copy()
        user_data["password"] = generate_password_hash(user["password"])
        db.users.insert_one(user_data)
        print(f"Created user: {user['username']} ({user['role']})")

    # --- SEED SHOPS ---
    print("\n--- Seeding Shops ---")
    if SHOPS:
        db.shops.insert_many(SHOPS)
        print(f"Added {len(SHOPS)} shops")

    # --- SEED MEDICINES ---
    print("\n--- Seeding Medicines ---")
    
    # Combine static medicines with CSV medicines
    csv_medicines = parse_medicines_from_csv()
    all_medicines = MEDICINES + csv_medicines
    
    if all_medicines:
        db.medicines.insert_many(all_medicines)
        print(f"Added {len(all_medicines)} medicines (sourced from CSV and static list)")

    # --- SEED FORUM ---
    print("\n--- Seeding Forum Posts ---")
    if FORUM_POSTS:
        db.forum_posts.insert_many(FORUM_POSTS)
        print(f"Added {len(FORUM_POSTS)} forum posts")

    # --- SEED SUBSIDIES ---
    print("\n--- Seeding Subsidies ---")
    if SUBSIDIES:
        db.subsidies.insert_many(SUBSIDIES)
        print(f"Added {len(SUBSIDIES)} subsidies")

    # --- SEED CONSULTATIONS ---
    print("\n--- Seeding Consultations ---")
    if CONSULTATIONS:
        db.consultations.insert_many(CONSULTATIONS)
        print(f"Added {len(CONSULTATIONS)} consultations")

    print("\n--- Data Population Complete ---")
    print("You can now login with:")
    print("  Admin: admin / admin123")
    print("  Farmer: farmer / farmer123")
    print("  Expert: expert / expert123")

if __name__ == "__main__":
    clean_and_seed()
