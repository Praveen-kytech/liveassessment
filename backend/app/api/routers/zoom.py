from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any

from app.services.zoom_integration import zoom_integration_service

router = APIRouter()

@router.post("/session/{session_id}/zoom")
async def create_zoom_meeting(session_id: int):
    # In reality, fetch session details from DB and use them
    meeting = await zoom_integration_service.create_meeting(
        topic=f"Session {session_id} Live Assessment",
        start_time="2026-08-12T10:00:00Z",
        duration=60
    )
    # Save meeting details to DB
    return {"message": "Zoom meeting created", "meeting": meeting}
