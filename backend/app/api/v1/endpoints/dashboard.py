from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, case
from app.api.deps import get_db
from app.core.security import get_current_active_user
from app.models.participant import Participant
from app.models.session import Session
from app.models.result import Result
from app.models.assessment import Assessment
from app.models.session_event import SessionEvent
from app.models.answer import Answer
from app.models.question import Question

router = APIRouter()

@router.get("/stats")
async def get_dashboard_stats(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_active_user)):
    org_id = current_user.get("organization_id")
    
    participants_count = await db.scalar(
        select(func.count(func.distinct(Participant.user_id)))
        .select_from(Participant)
        .join(Session, Participant.session_id == Session.id)
        .join(Assessment, Session.assessment_id == Assessment.id)
        .where(Assessment.organization_id == org_id)
    )
    
    active_sessions_count = await db.scalar(
        select(func.count(Session.id))
        .select_from(Session)
        .join(Assessment, Session.assessment_id == Assessment.id)
        .where(Session.is_live == True)
        .where(Assessment.organization_id == org_id)
    )
    
    completed_assessments_count = await db.scalar(
        select(func.count(func.distinct(Session.assessment_id)))
        .select_from(Session)
        .join(Assessment, Session.assessment_id == Assessment.id)
        .join(Result, Result.session_id == Session.id)
        .where(Assessment.organization_id == org_id)
    )
    
    avg_score = await db.scalar(
        select(func.avg(Result.score))
        .select_from(Result)
        .join(Session, Result.session_id == Session.id)
        .join(Assessment, Session.assessment_id == Assessment.id)
        .where(Assessment.organization_id == org_id)
    )
    
    return {
        "totalParticipants": participants_count or 0,
        "activeSessions": active_sessions_count or 0,
        "completedAssessments": completed_assessments_count or 0,
        "averageScore": avg_score or 0
    }

@router.get("/upcoming")
async def get_upcoming_assessments(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_active_user)):
    stmt = (
        select(Assessment.id, Assessment.title, func.min(Session.start_time), func.count(func.distinct(Participant.user_id)))
        .select_from(Assessment)
        .outerjoin(Session, (Session.assessment_id == Assessment.id) & (Session.status == 'SCHEDULED'))
        .outerjoin(Participant, Participant.session_id == Session.id)
        .where(Assessment.organization_id == current_user.get("organization_id"))
        .group_by(Assessment.id)
        .order_by(func.min(Session.start_time).asc().nulls_last(), Assessment.id.desc())
        .limit(5)
    )
    result = await db.execute(stmt)
    upcoming_data = []
    for assess_id, title, start_time, candidates_count in result.all():
        upcoming_data.append({
            "id": assess_id,
            "name": title,
            "start_time": start_time.isoformat() if start_time else None,
            "candidates": candidates_count
        })
    return upcoming_data

@router.get("/timeline")
async def get_assessment_timeline(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_active_user)):
    stmt = (
        select(SessionEvent, Session, Assessment)
        .join(Session, SessionEvent.session_id == Session.id)
        .join(Assessment, Session.assessment_id == Assessment.id)
        .where(Assessment.organization_id == current_user.get("organization_id"))
        .order_by(SessionEvent.created_at.desc())
        .limit(20)
    )
    result = await db.execute(stmt)
    timeline_data = []
    for event, session, assessment in result.all():
        timeline_data.append({
            "id": event.id,
            "assessment_name": assessment.title,
            "event_type": event.event_type,
            "created_at": event.created_at.isoformat(),
            "metadata": event.metadata_json,
            "reference_id": event.reference_id
        })
    return timeline_data

@router.get("/assessment-stats")
async def get_assessment_stats(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_active_user)):
    subq = select(func.max(Session.id)).where(Session.assessment_id == Assessment.id).scalar_subquery()
    
    stmt = (
        select(
            Assessment.id,
            Assessment.title,
            func.count(Answer.id).label("total"),
            func.sum(case((Answer.is_correct == True, 1), else_=0)).label("correct"),
            subq.label("latest_session_id")
        )
        .select_from(Answer)
        .join(Question, Answer.question_id == Question.id)
        .join(Assessment, Question.assessment_id == Assessment.id)
        .where(Assessment.organization_id == current_user.get("organization_id"))
        .group_by(Assessment.id, Assessment.title)
    )
    result = await db.execute(stmt)
    
    chart_data = []
    for row in result.all():
        assessment_id = row[0]
        title = row[1]
        total = row[2] or 0
        correct = row[3] or 0
        latest_session_id = row[4]
        wrong = total - correct
        chart_data.append({
            "assessment_id": assessment_id,
            "latest_session_id": latest_session_id,
            "name": title,
            "correct": correct,
            "wrong": wrong
        })
        
    return chart_data
