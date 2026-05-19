import requests
import json

BASE_URL = "http://localhost:5000"

def populate():
    print("--- Populating Demo Data ---")

    # 1. Shops
    shops = [
        {
            "name": "Green Earth Organics",
            "address": "45 Agri Park, North District",
            "contact": "9876543210",
            "location": "North District",
            "photo": "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&q=80&w=300"
        },
        {
            "name": "FarmCare Solutions",
            "address": "12 Main Road, South Valley",
            "contact": "8765432109",
            "location": "South Valley",
            "photo": "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&q=80&w=300"
        },
        {
            "name": "PestControl Pro",
            "address": "88 Industrial Way",
            "contact": "7654321098",
            "location": "Central Hub",
            "photo": "https://images.unsplash.com/photo-1589923188900-85dae5233c78?auto=format&fit=crop&q=80&w=300"
        }
    ]
    
    print("\nAdding Shops...")
    for shop in shops:
        try:
            requests.post(f"{BASE_URL}/admin/shops", json=shop)
            print(f"  + Added: {shop['name']}")
        except:
            print(f"  - Failed to add {shop['name']}")

    # 2. Medicines
    medicines = [
        {
            "name": "Neem Guard",
            "plant": "Tomato",
            "diseases": "Leaf Curd, Aphids",
            "symptoms": "Curling leaves, small insects",
            "usage": "Mix 5ml in 1L water, spray weekly.",
            "type": "Organic"
        },
        {
            "name": "Copper Fungicide",
            "plant": "Tomato",
            "diseases": "Late Blight, Early Blight",
            "symptoms": "Dark spots on leaves",
            "usage": "Apply every 10 days during rainy season.",
            "type": "Inorganic"
        },
        {
            "name": "Potato Shield",
            "plant": "Potato",
            "diseases": "Late Blight",
            "symptoms": "Decaying leaves",
            "usage": "Spray at first sign of disease.",
            "type": "Inorganic"
        },
        {
            "name": "Garlic Spray",
            "plant": "Any",
            "diseases": "General Pests",
            "symptoms": "Minor pest infestation",
            "usage": "Homemade: Crush garlic, mix with water.",
            "type": "Homemade"
        }
    ]

    print("\nAdding Medicines...")
    for med in medicines:
        try:
            requests.post(f"{BASE_URL}/admin/medicines", json=med)
            print(f"  + Added: {med['name']}")
        except:
            print(f"  - Failed to add {med['name']}")

    print("\n--- Population Complete ---")

if __name__ == "__main__":
    populate()
