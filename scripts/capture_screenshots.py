from playwright.sync_api import sync_playwright
import time
import os
import json

BASE_URL = "http://localhost:5000"
SCREENSHOT_DIR = "screenshots"

if not os.path.exists(SCREENSHOT_DIR):
    os.makedirs(SCREENSHOT_DIR)

def capture(page, name):
    path = os.path.join(SCREENSHOT_DIR, f"{name}.png")
    page.screenshot(path=path)
    print(f"Captured {path}")

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    
    # 1. Landing Page
    print("Navigating to Landing Page...")
    page.goto(BASE_URL)
    time.sleep(2) # Wait for animations
    capture(page, "landing_page")
    
    # 2. Farmer Dashboard
    print("Navigating to Farmer Dashboard...")
    farmer_user = {
        "username": "farmer_demo",
        "role": "farmer",
        "name": "Demo Farmer",
        "address": "123 Farm Lane",
        "phone": "9876543210",
        "pincode": "123456"
    }
    # Set localStorage and reload
    page.evaluate(f"localStorage.setItem('pest_user', JSON.stringify({json.dumps(farmer_user)}))")
    page.reload()
    time.sleep(3) # Wait for dashboard load
    capture(page, "farmer_dashboard")
    
    # 3. Admin Dashboard
    print("Navigating to Admin Dashboard...")
    admin_user = {
        "username": "admin",
        "role": "admin",
        "name": "System Admin"
    }
    page.evaluate(f"localStorage.setItem('pest_user', JSON.stringify({json.dumps(admin_user)}))")
    page.reload()
    time.sleep(3)
    capture(page, "admin_dashboard")

    # 4. Expert Dashboard
    print("Navigating to Expert Dashboard...")
    expert_user = {
        "username": "expert_demo",
        "role": "expert",
        "name": "Dr. Plant Expert"
    }
    page.evaluate(f"localStorage.setItem('pest_user', JSON.stringify({json.dumps(expert_user)}))")
    page.reload()
    time.sleep(3)
    capture(page, "expert_dashboard")

    browser.close()
    print("All screenshots captured.")
