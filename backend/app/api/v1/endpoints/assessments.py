from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List

from app.api.deps import get_db
from app.models.assessment import Assessment
from app.schemas.assessment import AssessmentCreate, AssessmentResponse
from app.core.security import get_current_active_user

router = APIRouter()

@router.get("/", response_model=List[AssessmentResponse])
async def read_assessments(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user)
):
    result = await db.execute(
        select(Assessment)
        .options(selectinload(Assessment.questions))
        .where(Assessment.organization_id == current_user.get("organization_id"))
        .offset(skip)
        .limit(limit)
    )
    assessments = list(result.scalars().all())
    
    attended_assessment_ids = set()
    role_id = current_user.get("role_id")
    # robust conversion to int
    is_participant = str(role_id) == "2" if role_id is not None else False
    
    if is_participant:
        from app.models.participant import Participant
        from app.models.session import Session
        att_res = await db.execute(
            select(Session.assessment_id)
            .join(Participant, Participant.session_id == Session.id)
            .where(Participant.user_id == current_user.get("id"))
            .where(Participant.check_in_status == 'CHECKED_IN')
        )
        attended_assessment_ids = set(att_res.scalars().all())
        
    response_data = []
    for a in assessments:
        has_att = True if a.id in attended_assessment_ids else False
        a_dict = {
            "id": a.id,
            "title": a.title,
            "description": a.description,
            "organization_id": a.organization_id,
            "passing_percentage": a.passing_percentage,
            "question_timer_seconds": a.question_timer_seconds,
            "max_attempts": a.max_attempts,
            "is_certificate_eligible": a.is_certificate_eligible,
            "created_at": a.created_at,
            "updated_at": a.updated_at,
            "questions": a.questions,
            "has_attended": has_att if is_participant else None
        }
        response_data.append(a_dict)
        
    return response_data

@router.post("/", response_model=AssessmentResponse)
async def create_assessment(
    assessment_in: AssessmentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user)
):
    assessment = Assessment(**assessment_in.model_dump())
    db.add(assessment)
    await db.commit()
    await db.refresh(assessment)
    
    result = await db.execute(
        select(Assessment)
        .options(selectinload(Assessment.questions))
        .where(Assessment.id == assessment.id)
    )
    return result.scalars().first()

@router.get("/{assessment_id}", response_model=AssessmentResponse)
async def read_assessment(
    assessment_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user)
):
    result = await db.execute(
        select(Assessment)
        .options(selectinload(Assessment.questions))
        .where(Assessment.id == assessment_id)
        .where(Assessment.organization_id == current_user.get("organization_id"))
    )
    assessment = result.scalars().first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return assessment
