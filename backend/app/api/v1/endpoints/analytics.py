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
from app.models.certificate import Certificate
from app.models.answer import Answer

router = APIRouter()

@router.get("/sessions/{session_id}/analytics")
async def get_session_analytics(
    session_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user)
):
    # Fetch session and assessment
    s_result = await db.execute(select(Session).where(Session.id == session_id))
    session = s_result.scalars().first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    from app.models.assessment import Assessment
    from app.models.question import Question
    
    a_result = await db.execute(select(Assessment).where(Assessment.id == session.assessment_id))
    assessment = a_result.scalars().first()
    
    q_result = await db.execute(select(Question).where(Question.assessment_id == session.assessment_id).order_by(Question.order.asc()))
    questions_data = []
    for q in q_result.scalars().all():
        questions_data.append({
            "id": q.id,
            "text": q.text,
            "options": q.options,
            "correct_answer": q.correct_answer,
            "order": q.order
        })

    # Fetch leaderboard (all participants, left joined with results and certificates)
    leaderboard_data = []
    res = await db.execute(
        select(Participant, User, Result, Certificate)
        .join(User, Participant.user_id == User.id)
        .outerjoin(Result, (Result.participant_id == Participant.id) & (Result.session_id == session_id))
        .outerjoin(Certificate, Certificate.result_id == Result.id)
        .where(Participant.session_id == session_id)
        .where(User.role_id == 2)
    )
    for participant, user, result, certificate in res.all():
        leaderboard_data.append({
            "participant_id": participant.id,
            "user_name": f"{user.first_name} {user.last_name}",
            "result_id": result.id if result else None,
            "score": result.score if result else 0,
            "is_passed": result.is_passed if result else False,
            "certificate_issued": result.certificate_issued if result else False,
            "certificate_url": certificate.certificate_url if certificate else None
        })
    # Sort leaderboard by score descending
    leaderboard_data.sort(key=lambda x: x["score"], reverse=True)
        
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
    p_res = await db.execute(
        select(ProctoringLog, Participant, User)
        .join(Participant, ProctoringLog.participant_id == Participant.id)
        .join(User, Participant.user_id == User.id)
        .where(ProctoringLog.session_id == session_id)
        .where(User.role_id == 2)
        .order_by(ProctoringLog.created_at.desc())
    )
    for log, participant, user in p_res.all():
        proctoring_data.append({
            "participant_id": participant.id,
            "user_name": f"{user.first_name} {user.last_name}",
            "event_type": log.event_type,
            "description": log.description,
            "created_at": log.created_at.isoformat()
        })
        
    # Calculate overall stats
    total_participants = len(leaderboard_data)
    passed = sum(1 for p in leaderboard_data if p["is_passed"])
    pass_rate = (passed / total_participants * 100) if total_participants > 0 else 0

    # Fetch answer stats
    answer_stats_data = {}
    ans_res = await db.execute(
        select(Answer)
        .join(Participant, Answer.participant_id == Participant.id)
        .where(Participant.session_id == session_id)
    )
    for ans in ans_res.scalars().all():
        q_id = ans.question_id
        a_val = int(ans.submitted_answer) if ans.submitted_answer.isdigit() else ans.submitted_answer
        if q_id not in answer_stats_data:
            answer_stats_data[q_id] = {}
        if a_val not in answer_stats_data[q_id]:
            answer_stats_data[q_id][a_val] = 0
        answer_stats_data[q_id][a_val] += 1

    return {
        "assessment_name": assessment.title if assessment else f"Session #{session_id}",
        "questions": questions_data,
        "leaderboard": leaderboard_data,
        "timeline": timeline_data,
        "proctoring_logs": proctoring_data,
        "answer_stats": answer_stats_data,
        "stats": {
            "total_participants": total_participants,
            "pass_rate": pass_rate
        }
    }
