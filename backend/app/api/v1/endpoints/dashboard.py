from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, case
from app.api.deps import get_db
from app.models.participant import Participant
from app.models.session import Session
from app.models.result import Result
from app.models.assessment import Assessment
from app.models.session_event import SessionEvent
from app.models.answer import Answer
from app.models.question import Question

router = APIRouter()

@router.get("/stats")
async def get_dashboard_stats(db: AsyncSession = Depends(get_db)):
    participants_count = await db.scalar(select(func.count()).select_from(Participant))
    active_sessions_count = await db.scalar(select(func.count()).select_from(Session).where(Session.is_live == True))
    completed_assessments_count = await db.scalar(select(func.count()).select_from(Session).where(Session.status == 'COMPLETED'))
    
    avg_score = await db.scalar(select(func.avg(Result.score)).select_from(Result))
    
    return {
        "totalParticipants": participants_count or 0,
        "activeSessions": active_sessions_count or 0,
        "completedAssessments": completed_assessments_count or 0,
        "averageScore": avg_score or 0
    }

@router.get("/upcoming")
async def get_upcoming_assessments(db: AsyncSession = Depends(get_db)):
    stmt = (
        select(Session, Assessment, func.count(Participant.id))
        .join(Assessment, Session.assessment_id == Assessment.id)
        .outerjoin(Participant, Participant.session_id == Session.id)
        .where(Session.status == 'SCHEDULED')
        .group_by(Session.id, Assessment.id)
        .order_by(Session.start_time.asc())
        .limit(5)
    )
    result = await db.execute(stmt)
    upcoming_data = []
    for session, assessment, candidates_count in result.all():
        upcoming_data.append({
            "id": session.id,
            "name": assessment.title,
            "start_time": session.start_time.isoformat() if session.start_time else None,
            "candidates": candidates_count
        })
    return upcoming_data

@router.get("/timeline")
async def get_assessment_timeline(db: AsyncSession = Depends(get_db)):
    stmt = (
        select(SessionEvent, Session, Assessment)
        .join(Session, SessionEvent.session_id == Session.id)
        .join(Assessment, Session.assessment_id == Assessment.id)
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
async def get_assessment_stats(db: AsyncSession = Depends(get_db)):
    stmt = (
        select(
            Assessment.title,
            func.count(Answer.id).label("total"),
            func.sum(case((Answer.is_correct == True, 1), else_=0)).label("correct")
        )
        .select_from(Answer)
        .join(Question, Answer.question_id == Question.id)
        .join(Assessment, Question.assessment_id == Assessment.id)
        .group_by(Assessment.title)
    )
    result = await db.execute(stmt)
    
    chart_data = []
    for row in result.all():
        title = row[0]
        total = row[1] or 0
        correct = row[2] or 0
        wrong = total - correct
        chart_data.append({
            "name": title,
            "correct": correct,
            "wrong": wrong
        })
        
    return chart_data
