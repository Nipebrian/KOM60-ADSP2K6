import requests

url = "http://localhost:8000/api/auth/register"
payload = {
    "nama": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "mahasiswa"
}

try:
    response = requests.post(url, json=payload)
    print("Status Code:", response.status_code)
    print("Response JSON:", response.json())
except Exception as e:
    print("Error:", e)
