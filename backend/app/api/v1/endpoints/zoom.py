from fastapi import APIRouter, Depends, HTTPException
import os
import time
from jose import jwt
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.security import get_current_active_user
from app.api.deps import get_db
from app.models.session import Session
from app.models.participant import Participant
from app.models.attendance import Attendance
import json

router = APIRouter()

class ZoomSignatureRequest(BaseModel):
    meeting_number: str
    role: int

class ZoomSignatureResponse(BaseModel):
    signature: str

@router.post("/signature", response_model=ZoomSignatureResponse)
async def generate_zoom_signature(
    request: ZoomSignatureRequest,
    current_user: dict = Depends(get_current_active_user)
):
    sdk_key = os.getenv("ZOOM_SDK_KEY", "mock_sdk_key")
    sdk_secret = os.getenv("ZOOM_SDK_SECRET", "mock_sdk_secret")
    
    if sdk_key == "mock_sdk_key" or sdk_secret == "mock_sdk_secret":
        # Return a fake signature if credentials are not configured, so the frontend doesn't crash on boot
        return {"signature": "mock_signature_please_configure_zoom_sdk_credentials"}

    iat = int(time.time()) - 30
    exp = iat + 60 * 60 * 2
    
    payload = {
        "sdkKey": sdk_key,
        "appKey": sdk_key,
        "mn": request.meeting_number,
        "role": request.role,
        "iat": iat,
        "exp": exp,
        "tokenExp": exp
    }

    headers = {
        "alg": "HS256",
        "typ": "JWT"
    }

    try:
        signature = jwt.encode(payload, sdk_secret, algorithm="HS256", headers=headers)
        return {"signature": signature}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate signature: {str(e)}")

@router.post("/webhook")
async def zoom_webhook(request: dict, db: AsyncSession = Depends(get_db)):
    event = request.get("event")
    payload = request.get("payload", {})
    obj = payload.get("object", {})
    
    if event in ["meeting.participant_joined", "meeting.participant_left"]:
        meeting_id = obj.get("id")
        participant_data = obj.get("participant", {})
        user_name = participant_data.get("user_name")
        
        if meeting_id and user_name:
            # Find session by meeting ID
            # In a real app, we'd store meeting_id explicitly, here we search meeting_link
            search_str = f"%{meeting_id}%"
            s_res = await db.execute(select(Session).where(Session.meeting_link.like(search_str)))
            session = s_res.scalars().first()
            
            if session:
                # Log attendance
                status = "JOINED" if event == "meeting.participant_joined" else "LEFT"
                logger.info(f"Zoom Webhook: Participant {user_name} {status} session {session.id}")
                
                # In production, match user_name to Participant and create Attendance record
                
    # Zoom webhook challenge validation
    if event == "endpoint.url_validation":
        plain_token = payload.get("plainToken")
        # In production, hash plain_token with SecretToken and return
        # For now, just return plainToken to allow basic verification if needed
        return {"plainToken": plain_token, "encryptedToken": "mock_encrypted_token"}

    return {"status": "success"}
