import firebase_admin
from firebase_admin import credentials, auth
from dotenv import load_dotenv
load_dotenv()
import requests
import json

# Initialize Firebase Admin
cred = credentials.Certificate("firebase-key.json")
try:
    firebase_admin.initialize_app(cred)
except:
    pass  # Already initialized

# Create a test user (only need to run once)
email = "test@raycast.ai"
password = "testpassword123"

try:
    user = auth.create_user(email=email, password=password)
    print(f"Created user: {user.uid}")
except:
    print("User already exists")

# Get your Firebase Web API key from Firebase Console:
# Project Settings → General → Web API Key
API_KEY = os.getenv("FIREBASE_API_KEY")

# Sign in to get a real ID token
response = requests.post(
    f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={API_KEY}",
    json={
        "email": email,
        "password": password,
        "returnSecureToken": True
    }
)

data = response.json()

if "idToken" in data:
    print(f"\nID Token (paste this in Swagger Authorize):\n")
    print(data["idToken"])
else:
    print(f"Error: {data}")