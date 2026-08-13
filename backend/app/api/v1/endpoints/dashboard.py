from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.api.deps import get_db
from app.models.participant import Participant
from app.models.session import Session
from app.models.result import Result

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
