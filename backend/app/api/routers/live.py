from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Any
import logging

from app.services.websocket_manager import manager
from app.services.session import session_service
from app.services.question import question_service
from app.services.answer import answer_service
# assuming get_db is available, we'll mock or define it later
# from app.db.session import get_db

router = APIRouter()
logger = logging.getLogger(__name__)

@router.websocket("/ws/session/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: int):
    await manager.connect(websocket, session_id)
    try:
        while True:
            data = await websocket.receive_text()
            # Simple echo or process
            # In a real scenario, handle json commands like {"action": "submit_answer", "question_id": 1, "answer": "A"}
            import json
            try:
                message = json.loads(data)
                action = message.get("action")
                
                if action == "submit_answer":
                    # logic to record answer
                    await manager.send_personal_message(json.dumps({"status": "received", "action": action}), websocket)
                    
            except json.JSONDecodeError:
                await manager.send_personal_message(json.dumps({"error": "Invalid JSON"}), websocket)

    except WebSocketDisconnect:
        manager.disconnect(websocket, session_id)
        await manager.broadcast_to_session(session_id, {"status": "left", "message": "A participant left the session."})

@router.post("/session/{session_id}/release-question/{question_id}")
async def release_question(session_id: int, question_id: int):
    # Retrieve question details (mocked for now, in reality use question_service)
    # Broadcast question to all connected clients
    question_payload = {
        "action": "new_question",
        "question_id": question_id,
        # ... other question details
    }
    await manager.broadcast_to_session(session_id, question_payload)
    return {"message": "Question released successfully"}
