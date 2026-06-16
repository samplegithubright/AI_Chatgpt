from dotenv import load_dotenv
load_dotenv(override=True)

import os
from datetime import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Modular imports
from database import newuser_collection, settings_collection
from auth import get_password_hash
from ai import LLM_MODEL
from routers import auth, chat, history, admin

app = FastAPI(title="LLM GPT Backend")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, tags=["Auth"])
app.include_router(chat.router, tags=["Chat"])
app.include_router(history.router, tags=["History"])
app.include_router(admin.router, tags=["Admin"])

@app.on_event("startup")
async def startup_event():
    # Ensure super admin exists
    admin_email = "admin@llmgpt.com"
    admin_user = await newuser_collection.find_one({"email": admin_email})
    if not admin_user:
        hashed_password = get_password_hash("admin123")
        await newuser_collection.insert_one({
            "email": admin_email,
            "password": hashed_password,
            "name": "Super Admin",
            "is_admin": True,
            "created_at": datetime.utcnow()
        })
        print(f"Super Admin created: {admin_email}")
    
    # Ensure default settings exist or are updated
    existing_settings = await settings_collection.find_one({"type": "general"})
    new_prompt = (
       f"""
You are an advanced AI assistant.

Core Behavior Rules:
- Be accurate, clear, and concise.
- Answer directly without unnecessary filler.
- Maintain a professional and helpful tone.
- For greetings, reply briefly and naturally.
- Format answers cleanly using markdown when useful.
- If unsure, say you are unsure instead of inventing information.
- Never hallucinate fake facts, links, or sources.

Knowledge & Freshness:
- Your internal knowledge may be outdated.
- Use tools for:
  - current events
  - live data
  - weather
  - prices
  - news
  - sports
  - stock market
  - anything after 2023
- If the user says "today", "latest", "current", or "now",
  always use the datetime or web tool.

Tool Usage Rules:
- Use available tools automatically when needed.
- Never mention internal tool logic unless necessary.
- Combine tool results into a natural response.

Coding Rules:
- Provide production-quality code.
- Explain complex code simply.
- Prefer modern best practices.
- Avoid unnecessary complexity.

Safety Rules:
- Refuse harmful or illegal requests.
- Protect user privacy and secrets.
- Never expose API keys, tokens, or credentials.

Current Date:
{datetime.now().strftime("%A, %B %d, %Y")}
"""
    )
    
    if not existing_settings:
        await settings_collection.insert_one({
            "type": "general",
            "system_name": "LLM GPT",
            "default_model": "llama3.2:3b",
            "maintenance_mode": False,
            "system_prompt": new_prompt,
            "temperature": 0.7,
            "max_tokens": 2000,
            "public_signup": True,
            "brand_color": "#3b82f6",
            "updated_at": datetime.utcnow()
        })
        print("Default settings initialized")
    else:
        # Always update the prompt to ensure the latest instructions and date are applied
        await settings_collection.update_one(
            {"type": "general"},
            {"$set": {"system_prompt": new_prompt, "updated_at": datetime.utcnow()}}
        )
        print("System prompt updated with latest instructions and date")

@app.get("/health")
async def health_check():
    return {"status": "healthy", "model": LLM_MODEL}

@app.get("/")
async def root():
    return {"message": "LLM GPT API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
