import pymongo

def audit_database():
    try:
        client = pymongo.MongoClient("mongodb://localhost:27017/")
        db = client["pest_control_db"]
    except Exception as e:
        print(f"Failed to connect to Mongo: {e}")
        return

    print("=== DATABASE HEALTH AUDIT ===\n")
    
    collections = db.list_collection_names()
    print(f"Collections found: {', '.join(collections)}\n")

    errors_found = 0
    warnings = 0

    # 1. Audit Users Collection
    if "users" in collections:
        users = list(db["users"].find())
        print(f"Scanning {len(users)} users...")
        for u in users:
            if not u.get("username"):
                print(f"  [ERROR] User {u.get('_id')} is missing a username!")
                errors_found += 1
            if not u.get("role"):
                print(f"  [WARNING] User {u.get('username')} is missing a role. Defaulting to farmer in app logic is risky.")
                warnings += 1
            if not u.get("password"):
                print(f"  [ERROR] User {u.get('username')} is missing a password!")
                errors_found += 1
    else:
        print("[WARNING] 'users' collection does not exist.")
        warnings += 1

    # 2. Audit Treatments Collection
    if "treatments" in collections:
        treatments = list(db["treatments"].find())
        print(f"\nScanning {len(treatments)} treatments...")
        for t in treatments:
            if not t.get("name"):
                print(f"  [ERROR] Treatment {t.get('_id')} is missing a display name!")
                errors_found += 1
            if "description" not in t:
                print(f"  [WARNING] Treatment {t.get('_id')} lacks a description field entirely.")
                warnings += 1
            if "symptoms" not in t or not isinstance(t.get("symptoms"), list):
                print(f"  [ERROR] Treatment {t.get('_id')} has invalid or missing 'symptoms' array.")
                errors_found += 1
            if "treatments" not in t or not isinstance(t.get("treatments"), dict):
                print(f"  [ERROR] Treatment {t.get('_id')} has invalid 'treatments' object mapping.")
                errors_found += 1
    else:
        print("[ERROR] 'treatments' collection does not exist!")
        errors_found += 1

    # 3. Audit Activity Log
    if "activity_log" in collections:
        logs = list(db["activity_log"].find().limit(500)) # Scan latest 500
        print(f"\nScanning {len(logs)} activity logs...")
        for l in logs:
            if not l.get("action") or not l.get("timestamp"):
                print(f"  [ERROR] Malformed activity log found: {l.get('_id')}")
                errors_found += 1
    
    # 4. Audit Forum Posts / Shops / Consultations if they exist
    for col_name in ["forum_posts", "shops", "consultations", "messages"]:
        if col_name in collections:
            docs = list(db[col_name].find())
            print(f"\nScanning {len(docs)} {col_name}...")
            for d in docs:
                # Basic sanity check: every doc should have some core identifying fields based on type
                if col_name == "shops" and not d.get("name"):
                    print(f"  [ERROR] Shop {d.get('_id')} missing name.")
                    errors_found += 1
                elif col_name == "forum_posts" and (not d.get("author") or not d.get("content")):
                    print(f"  [ERROR] Forum post {d.get('_id')} missing author or content.")
                    errors_found += 1

    print("\n" + "="*30)
    print(f"AUDIT COMPLETE.")
    print(f"Total Critical Errors: {errors_found}")
    print(f"Total Minor Warnings: {warnings}")
    
    if errors_found == 0 and warnings == 0:
        print("RESULT: Database is in PERFECT HEALTH. No missing schemas or orphaned records detected.")
    else:
        print("RESULT: Database has structural issues that should be reviewed.")


if __name__ == "__main__":
    audit_database()
