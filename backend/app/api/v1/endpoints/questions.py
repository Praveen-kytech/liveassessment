from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.api.deps import get_db
from app.models.question import Question
from app.core.security import get_current_active_user

router = APIRouter()

@router.get("/")
async def read_questions(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Question).offset(skip).limit(limit))
    return result.scalars().all()

@router.post("/")
async def create_question(question_data: dict, db: AsyncSession = Depends(get_db)):
    question = Question(**question_data)
    db.add(question)
    await db.commit()
    await db.refresh(question)
    return question
