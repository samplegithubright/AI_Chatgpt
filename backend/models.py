from pydantic import BaseModel, EmailStr
from typing import List, Optional

class UserSignup(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None
    is_admin: Optional[bool] = False

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class MessageModel(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[MessageModel]
    session_id: Optional[str] = None
    image: Optional[str] = None # Base64 image
    file_content: Optional[str] = None

class ChatResponse(BaseModel):
    role: str
    content: str
    session_id: str

class SettingsModel(BaseModel):
    system_name: str = "LLM GPT"
    default_model: str = "ministral-3:8b"
    maintenance_mode: bool = False
    system_prompt: str = "You are a helpful AI assistant."
    temperature: float = 0.7
    max_tokens: int = 2000
    public_signup: bool = True
    brand_color: str = "#3b82f6"

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str
    new_password: str
