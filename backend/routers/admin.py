from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime
from models import SettingsModel
from auth import get_current_admin
from database import newuser_collection, history_collection, users_collection, settings_collection

router = APIRouter()

@router.get("/admin/users")
async def admin_get_users(current_admin: str = Depends(get_current_admin)):
    users_cursor = newuser_collection.find({}, {"password": 0})
    users = await users_cursor.to_list(length=1000)
    for u in users:
        u["_id"] = str(u["_id"])
    return users

@router.get("/admin/stats")
async def admin_get_stats(current_admin: str = Depends(get_current_admin)):
    total_users = await newuser_collection.count_documents({})
    total_messages = await history_collection.count_documents({})
    total_sessions = len(await history_collection.distinct("session_id"))
    
    return {
        "total_users": total_users,
        "total_messages": total_messages,
        "total_sessions": total_sessions
    }

@router.get("/admin/all-history")
async def admin_get_all_history(current_admin: str = Depends(get_current_admin)):
    history_cursor = history_collection.find().sort("timestamp", -1).limit(500)
    history = await history_cursor.to_list(length=500)
    for h in history:
        h["_id"] = str(h["_id"])
    return history

@router.delete("/admin/users/{email}")
async def admin_delete_user(email: str, current_admin: str = Depends(get_current_admin)):
    if email == current_admin:
        raise HTTPException(status_code=400, detail="You cannot delete your own admin account")
    
    await newuser_collection.delete_one({"email": email})
    await history_collection.delete_many({"user_email": email})
    await users_collection.delete_many({"email": email})
    
    return {"message": f"User {email} and all associated data deleted successfully"}

@router.get("/admin/settings")
async def admin_get_settings(current_admin: str = Depends(get_current_admin)):
    settings = await settings_collection.find_one({"type": "general"})
    if not settings:
        return {"system_name": "LLM GPT", "default_model": "ministral-3:8b", "maintenance_mode": False}
    return {
        "system_name": settings.get("system_name", "LLM GPT"),
        "default_model": settings.get("default_model", "ministral-3:8b"),
        "maintenance_mode": settings.get("maintenance_mode", False),
        "system_prompt": settings.get("system_prompt", "You are a helpful AI assistant."),
        "temperature": settings.get("temperature", 0.7),
        "max_tokens": settings.get("max_tokens", 2000),
        "public_signup": settings.get("public_signup", True),
        "brand_color": settings.get("brand_color", "#3b82f6")
    }

@router.post("/admin/settings")
async def admin_update_settings(settings: SettingsModel, current_admin: str = Depends(get_current_admin)):
    await settings_collection.update_one(
        {"type": "general"},
        {"$set": {
            "system_name": settings.system_name,
            "default_model": settings.default_model,
            "maintenance_mode": settings.maintenance_mode,
            "system_prompt": settings.system_prompt,
            "temperature": settings.temperature,
            "max_tokens": settings.max_tokens,
            "public_signup": settings.public_signup,
            "brand_color": settings.brand_color,
            "updated_at": datetime.utcnow()
        }},
        upsert=True
    )
    return {"message": "Settings updated successfully"}
