from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Dict, Any
from app.api.deps import get_db
from app.core.security import get_current_active_user
from app.models.session import Session
from app.models.result import Result
from app.models.proctoring_log import ProctoringLog
from app.models.session_event import SessionEvent
from app.models.participant import Participant
from app.models.user import User

router = APIRouter()

@router.get("/sessions/{session_id}/analytics")
async def get_session_analytics(
    session_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user)
):
    # Fetch session
    s_result = await db.execute(select(Session).where(Session.id == session_id))
    session = s_result.scalars().first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Fetch leaderboard (results joined with participant/user)
    leaderboard_data = []
    res = await db.execute(select(Result, Participant, User).join(Participant, Result.participant_id == Participant.id).join(User, Participant.user_id == User.id).where(Result.session_id == session_id).order_by(Result.score.desc()))
    for result, participant, user in res.all():
        leaderboard_data.append({
            "participant_id": participant.id,
            "user_name": user.full_name,
            "score": result.score,
            "is_passed": result.is_passed,
            "certificate_issued": result.certificate_issued
        })
        
    # Fetch events timeline
    timeline_data = []
    e_res = await db.execute(select(SessionEvent).where(SessionEvent.session_id == session_id).order_by(SessionEvent.created_at.asc()))
    for event in e_res.scalars().all():
        timeline_data.append({
            "event_type": event.event_type,
            "reference_id": event.reference_id,
            "created_at": event.created_at.isoformat(),
            "metadata": event.metadata_json
        })
        
    # Fetch proctoring logs
    proctoring_data = []
    p_res = await db.execute(select(ProctoringLog, Participant, User).join(Participant, ProctoringLog.participant_id == Participant.id).join(User, Participant.user_id == User.id).where(ProctoringLog.session_id == session_id).order_by(ProctoringLog.created_at.desc()))
    for log, participant, user in p_res.all():
        proctoring_data.append({
            "participant_id": participant.id,
            "user_name": user.full_name,
            "event_type": log.event_type,
            "description": log.description,
            "created_at": log.created_at.isoformat()
        })
        
    # Calculate overall stats
    total_participants = len(leaderboard_data)
    passed = sum(1 for p in leaderboard_data if p["is_passed"])
    pass_rate = (passed / total_participants * 100) if total_participants > 0 else 0

    return {
        "leaderboard": leaderboard_data,
        "timeline": timeline_data,
        "proctoring_logs": proctoring_data,
        "stats": {
            "total_participants": total_participants,
            "pass_rate": pass_rate
        }
    }
