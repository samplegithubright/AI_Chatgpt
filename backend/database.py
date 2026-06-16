import os
import motor.motor_asyncio
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL not found in .env")

# Ensure database name is chatdead
if "/?" in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace("/?", "/chatdead?")
elif ".net/" in DATABASE_URL and not ".net/chatdead" in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace(".net/", ".net/chatdead")

client = motor.motor_asyncio.AsyncIOMotorClient(DATABASE_URL)
db = client.chatdead

# Collections
newuser_collection = db.newuser
users_collection = db.users
history_collection = db.chat_history
settings_collection = db.settings
otp_collection = db.otp_codes
