from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.api.deps import get_db
from app.models.question import Question
from app.schemas.question import QuestionCreate, QuestionResponse
from app.core.security import get_current_active_user

router = APIRouter()

@router.get("/")
async def read_questions(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Question).offset(skip).limit(limit))
    return result.scalars().all()

@router.post("/", response_model=QuestionResponse)
async def create_question(question_data: QuestionCreate, db: AsyncSession = Depends(get_db)):
    question = Question(**question_data.model_dump())
    db.add(question)
    await db.commit()
    await db.refresh(question)
    return question
