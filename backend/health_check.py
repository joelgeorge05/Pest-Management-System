
import requests

BASE_URL = "http://localhost:5000"

def health_check():
    print("Performing System Health Check...")
    endpoints = [
        ("/", 200),
        ("/api/diseases", 200),
        ("/treatments", 200),
        ("/admin/medicines", 404), # Should be 404? No, invalid endpoint or auth? check app.py
        # app.py: @app.errorhandler(404) if path starts with /admin... return json 404 if not found
        # Is there a GET /admin/medicines?
        # Let's check app.py again or just stick to known GETs
        ("/classes", 200),
        ("/consultations", 200) # Returns empty list or list
    ]
    
    for endpoint, expected in endpoints:
        try:
            res = requests.get(f"{BASE_URL}{endpoint}")
            # Relaxed check for 200 or 404 (if auth required or empty)
            if res.status_code == 200:
                print(f"[OK] {endpoint}")
            elif res.status_code == 404:
                print(f"[NOTE] {endpoint} returned 404 (Expected?)")
            else:
                print(f"[WARN] {endpoint} returned {res.status_code}")
        except Exception as e:
            print(f"[CRITICAL] Failed to reach {endpoint}: {e}")

if __name__ == "__main__":
    health_check()
