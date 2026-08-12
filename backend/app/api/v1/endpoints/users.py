from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.api.deps import get_db
from app.models.user import User
from app.core.security import get_current_active_user

router = APIRouter()

@router.get("/")
async def read_users(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_active_user)):
    result = await db.execute(select(User).offset(skip).limit(limit))
    return result.scalars().all()
