from fastapi import APIRouter, HTTPException, BackgroundTasks
from datetime import datetime, timedelta
import random
import string
from models import UserSignup, UserLogin, Token, ForgotPasswordRequest, ResetPasswordRequest
from database import newuser_collection, users_collection, otp_collection
from auth import get_password_hash, verify_password, create_access_token
from email_utils import send_otp_email

router = APIRouter()

@router.post("/signup")
async def signup(user: UserSignup):
    existing_user = await newuser_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    new_user_data = {
        "email": user.email,
        "password": hashed_password,
        "name": user.name,
        "is_admin": user.is_admin if user.is_admin is not None else False,
        "created_at": datetime.utcnow()
    }
    await newuser_collection.insert_one(new_user_data)
    return {"message": "User created successfully"}

@router.post("/login", response_model=Token)
async def login(user: UserLogin):
    db_user = await newuser_collection.find_one({"email": user.email})
    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    login_record = {
        "email": user.email,
        "login_at": datetime.utcnow(),
        "user_agent": "browser"
    }
    await users_collection.insert_one(login_record)
    
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/admin/login", response_model=Token)
async def admin_login(user: UserLogin):
    db_user = await newuser_collection.find_one({"email": user.email})
    if not db_user or not db_user.get("is_admin") or not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid admin credentials")
    
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest, background_tasks: BackgroundTasks):
    user = await newuser_collection.find_one({"email": request.email})
    if not user:
        return {"message": "If your email is registered, you will receive an OTP shortly."}
    
    otp = ''.join(random.choices(string.digits, k=6))
    expiry = datetime.utcnow() + timedelta(minutes=10)
    await otp_collection.update_one(
        {"email": request.email},
        {"$set": {"otp": otp, "expiry": expiry}},
        upsert=True
    )
    
    background_tasks.add_task(send_otp_email, request.email, otp)
    return {"message": "If your email is registered, you will receive an OTP shortly."}

@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest):
    otp_record = await otp_collection.find_one({"email": request.email})
    if not otp_record or otp_record["otp"] != request.otp:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    
    if datetime.utcnow() > otp_record["expiry"]:
        await otp_collection.delete_one({"email": request.email})
        raise HTTPException(status_code=400, detail="OTP has expired")
    
    hashed_password = get_password_hash(request.new_password)
    result = await newuser_collection.update_one(
        {"email": request.email},
        {"$set": {"password": hashed_password}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    await otp_collection.delete_one({"email": request.email})
    return {"message": "Password reset successful"}
