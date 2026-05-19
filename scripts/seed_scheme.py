
import requests

BASE_URL = "http://localhost:5000/admin/subsidies"
SUBSIDY = {
    "title": "Test Scheme with Link",
    "description": "This is a test scheme to verify hyperlinks.",
    "link": "https://example.com"
}

try:
    print(f"Posting to {BASE_URL}...")
    res = requests.post(BASE_URL, json=SUBSIDY)
    print(f"Status: {res.status_code}")
    print(res.text)
except Exception as e:
    print(e)
