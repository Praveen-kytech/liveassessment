from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import json
import logging
from jose import JWTError, jwt

from app.services.websocket_manager import manager
from app.api.deps import get_db
from app.core.config import settings
from app.models.answer import Answer
from app.models.user import User
from app.models.participant import Participant

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

    # Fetch participant
    result = await db.execute(select(Participant).where(
        Participant.session_id == session_id,
        Participant.user_id == user_id
    ))
    participant = result.scalars().first()

    if not participant:
        await websocket.close(code=1008)
        return

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
                    
                    if question_id and submitted_answer:
                        # Persist to DB
                        answer = Answer(
                            participant_id=participant.id,
                            question_id=question_id,
                            submitted_answer=submitted_answer
                        )
                        db.add(answer)
                        await db.commit()
                        
                        await manager.send_personal_message(json.dumps({"status": "received", "action": action}), websocket)
                    
            except json.JSONDecodeError:
                await manager.send_personal_message(json.dumps({"error": "Invalid JSON"}), websocket)

    except WebSocketDisconnect:
        manager.disconnect(websocket, session_id)
        await manager.broadcast_to_session(session_id, {"status": "left", "message": "A participant left the session."})

@router.post("/session/{session_id}/release-question/{question_id}")
async def release_question(session_id: int, question_id: int):
    question_payload = {
        "action": "new_question",
        "question_id": question_id,
    }
    await manager.broadcast_to_session(session_id, question_payload)
    return {"message": "Question released successfully"}
