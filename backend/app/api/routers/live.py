from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import json
import logging
from jose import JWTError, jwt
from datetime import datetime

from app.services.websocket_manager import manager
from app.api.deps import get_db
from app.core.config import settings
from app.models.answer import Answer
from app.models.user import User
from app.models.participant import Participant
from app.models.question import Question
from app.models.result import Result
from app.models.proctoring_log import ProctoringLog
from app.models.session_event import SessionEvent

router = APIRouter()
logger = logging.getLogger(__name__)

async def get_current_user_ws(token: str):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            return None
        return int(user_id)
    except JWTError:
        return None

@router.websocket("/ws/session/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: int, db: AsyncSession = Depends(get_db)):
    token = websocket.query_params.get("token")
    user_id = await get_current_user_ws(token)
    
    if not user_id:
        await websocket.close(code=1008)
        return

    # Check if user is a Host (Admin role_id == 1)
    user_result = await db.execute(select(User).where(User.id == user_id))
    user = user_result.scalars().first()
    
    is_host = user and user.role_id == 1

    participant = None
    if not is_host:
        # Fetch participant
        result = await db.execute(select(Participant).where(
            Participant.session_id == session_id,
            Participant.user_id == user_id
        ))
        participant = result.scalars().first()

        if not participant:
            # Auto-enroll for easy testing since we don't have a registration flow yet
            participant = Participant(
                session_id=session_id,
                user_id=user_id,
                check_in_status='CHECKED_IN'
            )
            db.add(participant)
            await db.commit()
            await db.refresh(participant)

    await manager.connect(websocket, session_id)
    try:
        while True:
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                action = message.get("action")
                
                if action == "submit_answer":
                    question_id = message.get("question_id")
                    submitted_answer = message.get("answer")
                    if question_id is not None and submitted_answer is not None:
                        try:
                            # 1. Fetch the Question to check correctness
                            q_result = await db.execute(select(Question).where(Question.id == question_id))
                            question = q_result.scalars().first()
                            
                            is_correct = False
                            if question and question.correct_answer is not None:
                                is_correct = (str(question.correct_answer).strip().lower() == str(submitted_answer).strip().lower())
                                
                            # 2. Persist to DB (ensure string)
                            answer = Answer(
                                participant_id=participant.id,
                                question_id=question_id,
                                submitted_answer=str(submitted_answer),
                                is_correct=is_correct
                            )
                            db.add(answer)
                            
                            # 3. Add Event
                            event = SessionEvent(
                                session_id=session_id,
                                event_type="ANSWER_SUBMITTED",
                                reference_id=question_id,
                                metadata_json=json.dumps({"participant_id": participant.id, "is_correct": is_correct})
                            )
                            db.add(event)
                            
                            # 4. Update Score
                            res_result = await db.execute(select(Result).where(Result.participant_id == participant.id, Result.session_id == session_id))
                            result_record = res_result.scalars().first()
                            if not result_record:
                                result_record = Result(session_id=session_id, participant_id=participant.id, score=0, is_passed=False)
                                db.add(result_record)
                                
                            if is_correct:
                                # Simple scoring: 1 point per correct answer
                                result_record.score += 1
                                if result_record.score >= 5: # Assuming passing score is 5 for now
                                    result_record.is_passed = True
                                    
                            await db.commit()
                            
                            # Broadcast score update
                            await manager.broadcast_to_session(session_id, {
                                "action": "score_update",
                                "participant_id": participant.id,
                                "score": result_record.score
                            })
                            
                            # Broadcast answer payload for Doctor Analytics
                            await manager.broadcast_to_session(session_id, {
                                "action": "answer_received",
                                "question_id": question_id,
                                "answer": submitted_answer
                            })
                            
                            await manager.send_personal_message(json.dumps({"status": "received", "action": action}), websocket)
                        except Exception as e:
                            logger.error(f"Error submitting answer: {e}")
                            await db.rollback()
                            await manager.send_personal_message(json.dumps({"error": "Failed to save answer"}), websocket)
                
                elif action == "proctoring_event":
                    if participant: # Only participants trigger proctoring events
                        event_type = message.get("type")
                        payload = {
                            "action": "proctoring_alert",
                            "participant_id": participant.id,
                            "type": event_type,
                            "message": f"Participant {participant.id} triggered a {event_type} alert."
                        }
                        
                        # Persist to DB
                        log = ProctoringLog(
                            session_id=session_id,
                            participant_id=participant.id,
                            event_type=event_type,
                            description=payload["message"]
                        )
                        db.add(log)
                        await db.commit()
                        
                        await manager.broadcast_to_session(session_id, payload)
                
                elif action == "close_question":
                    if is_host:
                        question_id = message.get("question_id")
                        await manager.broadcast_to_session(session_id, {
                            "action": "close_question",
                            "question_id": question_id
                        })
                    
            except json.JSONDecodeError:
                await manager.send_personal_message(json.dumps({"error": "Invalid JSON"}), websocket)

    except WebSocketDisconnect:
        manager.disconnect(websocket, session_id)
        await manager.broadcast_to_session(session_id, {"status": "left", "message": "A participant left the session."})

@router.post("/session/{session_id}/release-question/{question_id}")
async def release_question(session_id: int, question_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Question).where(Question.id == question_id))
    question = result.scalars().first()
    
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    question_payload = {
        "action": "new_question",
        "question_id": question.id,
        "text": question.text,
        "type": question.type
    }
    
    event = SessionEvent(
        session_id=session_id,
        event_type="QUESTION_RELEASED",
        reference_id=question_id
    )
    db.add(event)
    await db.commit()
    
    await manager.broadcast_to_session(session_id, question_payload)
    return {"message": "Question released successfully"}
