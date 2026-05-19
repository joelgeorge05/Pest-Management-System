import requests
import time

BASE_URL = "http://localhost:5000"

def populate():
    print("--- Populating Test Data ---")

    # Shops Data
    shops = [
        {
            "name": "Green Leaf Agrochemicals",
            "address": "45 Farmer's Market Rd, AgriTown",
            "contact": "+91-9876543210",
            "location": "AgriTown",
            "photo": "https://images.unsplash.com/photo-1628102491629-778571d893a3?auto=format&fit=crop&q=80&w=1000"
        },
        {
            "name": "Kisan Seva Kendra",
            "address": "Block C, Rural District",
            "contact": "+91-9988776655",
            "location": "Rural District",
            "photo": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1000"
        },
        {
            "name": "Nature's Care Pesticides",
            "address": "12 Highway Road, Green City",
            "contact": "+91-8899001122",
            "location": "Green City",
            "photo": "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&q=80&w=1000"
        },
        {
            "name": "Best Crop Solutions",
            "address": "Shop 4, Village Square",
            "contact": "+91-7766554433",
            "location": "Village Square",
            "photo": "https://plus.unsplash.com/premium_photo-1661962692059-55d5a4319814?auto=format&fit=crop&q=80&w=1000"
        }
    ]

    # Medicines Data
    medicines = [
        {
            "name": "Neem Oil Extract",
            "diseases": "Aphids, Whiteflies, Mites",
            "symptoms": "Yellowing leaves, sticky residue, fine webs",
            "usage": "Mix 5ml per liter of water. Spray every 7 days.",
            "type": "Organic"
        },
        {
            "name": "Copper Fungicide",
            "diseases": "Early Blight, Late Blight, Leaf Spots",
            "symptoms": "Dark brown spots with concentric rings, water-soaked lesions",
            "usage": "Apply 2g per liter. Spray at first sign of disease.",
            "type": "Inorganic"
        },
        {
            "name": "Baking Soda Spray",
            "diseases": "Powdery Mildew",
            "symptoms": "White powdery growth on leaves",
            "usage": "Mix 1 tbsp baking soda, 1 tsp soap, 1 gallon water.",
            "type": "Homemade"
        },
        {
            "name": "Imidacloprid 17.8 SL",
            "diseases": "Thrips, Jassids",
            "symptoms": "Silvery streaks on leaves, upward curling",
            "usage": "0.5ml per liter of water. Foliar spray.",
            "type": "Inorganic"
        },
        {
            "name": "Trichoderma Viride",
            "diseases": "Root Rot, Wilt",
            "symptoms": "Wilting plant, rotting roots",
            "usage": "Mix with soil or seed treatment.",
            "type": "Organic"
        }
    ]

    print("\nAdding Shops...")
    for shop in shops:
        try:
            res = requests.post(f"{BASE_URL}/admin/shops", json=shop)
            if res.status_code == 201:
                print(f"   [OK] Added {shop['name']}")
            else:
                print(f"   [FAIL] {shop['name']}: {res.text}")
        except Exception as e:
            print(f"   [ERR] {e}")

    print("\nAdding Medicines...")
    for med in medicines:
        try:
            res = requests.post(f"{BASE_URL}/admin/medicines", json=med)
            if res.status_code == 201:
                print(f"   [OK] Added {med['name']}")
            else:
                print(f"   [FAIL] {med['name']}: {res.text}")
        except Exception as e:
            print(f"   [ERR] {e}")

    print("\n--- Population Complete ---")

if __name__ == "__main__":
    populate()
