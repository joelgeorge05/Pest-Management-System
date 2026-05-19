from pymongo import MongoClient

# MongoDB Config
client = MongoClient("mongodb://localhost:27017/")
db = client["pest_control_db"]
messages_collection = db["messages"]

def clear_messages():
    try:
        result = messages_collection.delete_many({})
        print(f"✅ Deleted {result.deleted_count} messages.")
    except Exception as e:
        print(f"❌ Error deleting messages: {e}")

if __name__ == "__main__":
    clear_messages()
