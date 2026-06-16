from fastapi import APIRouter, HTTPException, Depends
from auth import get_current_user
from database import history_collection

router = APIRouter()

@router.get("/sessions")
async def get_sessions(current_user: str = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    pipeline = [
        {"$match": {"user_email": current_user, "role": "user"}},
        {"$sort": {"timestamp": 1}},
        {"$group": {
            "_id": "$session_id",
            "title": {"$first": "$content"},
            "timestamp": {"$last": "$timestamp"}
        }},
        {"$sort": {"timestamp": -1}}
    ]
    
    sessions = []
    async for doc in history_collection.aggregate(pipeline):
        title = doc["title"]
        if len(title) > 30:
            title = title[:30] + "..."
            
        sessions.append({
            "id": doc["_id"],
            "title": title,
            "timestamp": doc["timestamp"]
        })
        
    return sessions

@router.delete("/sessions/{session_id}")
async def delete_session(session_id: str, current_user: str = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    result = await history_collection.delete_many({
        "user_email": current_user,
        "session_id": session_id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Session not found")
        
    return {"message": "Session deleted successfully"}

@router.get("/history/{session_id}")
async def get_chat_history_by_session(session_id: str, current_user: str = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    history_cursor = history_collection.find({
        "user_email": current_user,
        "session_id": session_id
    }).sort("timestamp", 1)
    history_data = await history_cursor.to_list(length=100)
    
    for h in history_data:
        h["_id"] = str(h["_id"])
    
    return history_data

@router.delete("/history")
async def delete_all_history(current_user: str = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    result = await history_collection.delete_many({"user_email": current_user})
    return {"message": "All history deleted successfully", "deleted_count": result.deleted_count}

@router.get("/history")
async def get_all_chat_history(current_user: str = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    history_cursor = history_collection.find({"user_email": current_user}).sort("timestamp", -1)
    history_data = await history_cursor.to_list(length=100)
    
    for h in history_data:
        h["_id"] = str(h["_id"])
    
    return history_data
