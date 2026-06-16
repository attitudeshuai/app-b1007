from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from app.database import get_db
from app.models.base import AppSetting

router = APIRouter()

class SettingCreate(BaseModel):
    key: str
    value: str

class SettingResponse(BaseModel):
    key: str
    value: str
    
    class Config:
        from_attributes = True

@router.get("/", response_model=List[SettingResponse])
def get_settings(db: Session = Depends(get_db)):
    return db.query(AppSetting).all()

@router.post("/", response_model=SettingResponse)
def update_setting(setting: SettingCreate, db: Session = Depends(get_db)):
    db_setting = db.query(AppSetting).filter(AppSetting.key == setting.key).first()
    if db_setting:
        db_setting.value = setting.value
    else:
        db_setting = AppSetting(key=setting.key, value=setting.value)
        db.add(db_setting)
    
    db.commit()
    db.refresh(db_setting)
    return db_setting
