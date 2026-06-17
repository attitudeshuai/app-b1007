from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from app.database import get_db
from app.models.base import ChatMessage, AppSetting
import datetime
import httpx
import json

router = APIRouter()

class MessageCreate(BaseModel):
    role: str
    content: str

class MessageResponse(BaseModel):
    id: int
    role: str
    content: str
    timestamp: datetime.datetime

    class Config:
        from_attributes = True

@router.get("/", response_model=List[MessageResponse])
def get_history(limit: int = 50, db: Session = Depends(get_db)):
    messages = db.query(ChatMessage).order_by(ChatMessage.timestamp.asc(), ChatMessage.id.desc()).limit(limit).all()
    return messages

@router.post("/", response_model=MessageResponse)
async def send_message(msg: MessageCreate, db: Session = Depends(get_db)):
    # 1. Save User Message
    user_msg = ChatMessage(role=msg.role, content=msg.content)
    db.add(user_msg)
    db.commit()
    db.refresh(user_msg)
    
    # 2. Simulate AI Response (Echo or Mock) if needed, 
    # but the Prompt asks for "Integration with Model API" in settings. 
    # For now, we will just save what is sent. 
    # The Frontend will likely handle the interaction loop: 
    # Send User Msg -> Get 200 -> Call LLM (or Backend calls LLM) -> Send AI Msg.
    # Let's assume the backend just stores for now, unless "Model API" implies backend proxy.
    # We will implement a simple echo if it's a user message, to make it "Alive".
    
    if msg.role == "user":
        # Create user message
        
        # Fetch Settings
        settings = db.query(AppSetting).all()
        config = {s.key: s.value for s in settings}
        
        api_url = config.get("model_api", "https://api.openai.com/v1")
        api_key = config.get("api_key", "")
        
        if not api_url or not api_key:
             ai_content = "请先在设置中配置 API 地址和密钥。"
        else:
            try:
                # Prepare headers
                headers = {
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {api_key}"
                }
                
                # Prepare payload
                # Use a simple model default or fetch from settings if added later
                # Assuming standard OpenAI format
                payload = {
                    "model": "gpt-3.5-turbo", # Default or generic, usually ignored by some compatible APIs or needed
                    "messages": [{"role": "user", "content": msg.content}],
                    "stream": False
                }
                
                # If using custom model name from settings, add that support later. 
                # For now, hardcode a safe default or let user params override if we had them.
                # Many "compatible" APIs ignore model name or require a specific one.
                # Let's try to be generic. qwen-turbo is mentioned in context previously? 
                # The user provided a key looking like sk-..., usually works with default.
                
                # Handle /v1/chat/completions suffix if missing but needed? 
                # User config says: https://api.ywzxkj.com . Usually needs /v1/chat/completions attached.
                # Safe logic: check if it ends with /chat/completions
                target_url = api_url.rstrip('/')
                
                # If it doesn't have /v1, add it
                if not target_url.endswith('/v1'):
                    target_url = f"{target_url}/v1"
                    
                # Then ensure /chat/completions is appended
                if not target_url.endswith("/chat/completions"):
                     target_url = f"{target_url}/chat/completions"

                print(f"Calling API at: {target_url}")
                print(f"Payload: {payload}")
                
                # Payload needed for Qwen/OpenAI compatible
                # If the user's API is truly OpenAI compatible:
                async with httpx.AsyncClient(timeout=60.0) as client:
                    resp = await client.post(target_url, json=payload, headers=headers)
                    
                    # Log response for debugging
                    print(f"API Response Status: {resp.status_code}")
                    print(f"API Response Headers: {resp.headers}")
                    
                    if resp.status_code == 200:
                        try:
                            data = resp.json()
                            ai_content = data["choices"][0]["message"]["content"]
                        except (json.JSONDecodeError, KeyError) as e:
                            print(f"Failed to parse response: {e}")
                            print(f"Response text: {resp.text}")
                            ai_content = f"解析响应失败: {resp.text[:200]}"
                    else:
                        print(f"API Error Response: {resp.text}")
                        ai_content = f"API 错误 ({resp.status_code}): {resp.text[:200]}"
            except Exception as e:
                print(f"Request exception: {type(e).__name__}: {str(e)}")
                ai_content = f"请求失败: {str(e)}"

        ai_msg = ChatMessage(role="assistant", content=ai_content)
        db.add(ai_msg)
        db.commit()
        db.refresh(ai_msg)
        return ai_msg 
        
    return user_msg
