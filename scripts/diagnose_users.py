from pymongo import MongoClient

def list_expert_users():
    client = MongoClient('mongodb://localhost:27017/')
    db = client['pest_management_db']
    users_collection = db['users']

    # Find users with 'Expert' in name
    query = {
        "username": {"$regex": "Expert", "$options": "i"}
    }

    results = list(users_collection.find(query))
    print(f"Found {len(results)} users with 'Expert' in username.")

    for u in results:
        print(f"User: {u.get('username', 'N/A')}, Role: {u.get('role', 'N/A')}, ID: {u.get('_id')}")

if __name__ == "__main__":
    list_expert_users()
