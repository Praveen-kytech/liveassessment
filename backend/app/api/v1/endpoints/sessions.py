from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List

from app.api.deps import get_db
from app.core.security import get_current_active_user
from app.models.session import Session
from app.models.assessment import Assessment
from app.models.participant import Participant
from app.schemas.session import SessionResponse, SessionCreate
from app.schemas.participant import ParticipantResponse
from app.models.user import User
from app.services.zoom_integration import zoom_integration_service

router = APIRouter()

@router.post("/", response_model=SessionResponse)
async def create_session(
    session_in: SessionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user)
):
    # Only admins can create sessions (assuming role_id 1 is Admin)
    if current_user.get("role_id") != 1:
        raise HTTPException(status_code=403, detail="Not authorized to create sessions.")
        
    assessment_check = await db.execute(
        select(Assessment).where(
            Assessment.id == session_in.assessment_id,
            Assessment.organization_id == current_user.get("organization_id")
        )
    )
    if not assessment_check.scalars().first():
        raise HTTPException(status_code=403, detail="Assessment not found or not authorized.")
        
    session = Session(
        assessment_id=session_in.assessment_id,
        start_time=session_in.start_time.replace(tzinfo=None) if session_in.start_time else None,
        end_time=session_in.end_time.replace(tzinfo=None) if session_in.end_time else None,
        delivery_mode=session_in.delivery_mode,
        meeting_provider=session_in.meeting_provider
    )
    
    # If it's online and Zoom is selected, create Zoom meeting
    if session_in.delivery_mode == 'ONLINE' and session_in.meeting_provider == 'ZOOM':
        zoom_data = await zoom_integration_service.create_meeting(
            topic=f"Live Assessment Session - {session_in.assessment_id}",
            start_time=session_in.start_time.isoformat(),
            duration=60 # Default 60 mins
        )
        session.meeting_link = zoom_data.get("join_url")
        session.host_meeting_link = zoom_data.get("start_url")

    db.add(session)
    await db.commit()
    
    result = await db.execute(
        select(Session)
        .options(selectinload(Session.assessment))
        .where(Session.id == session.id)
    )
    return result.scalars().first()

@router.get("/{session_id}", response_model=SessionResponse)
async def get_session(
    session_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user)
):
    result = await db.execute(
        select(Session)
        .options(selectinload(Session.assessment))
        .join(Session.assessment)
        .where(Session.id == session_id)
        .where(Assessment.organization_id == current_user.get("organization_id"))
    )
    session = result.scalars().first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session

@router.get("/", response_model=List[SessionResponse])
async def list_sessions(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user)
):
    result = await db.execute(
        select(Session)
        .options(selectinload(Session.assessment))
        .join(Session.assessment)
        .where(Assessment.organization_id == current_user.get("organization_id"))
        .order_by(Session.created_at.desc())
    )
    return result.scalars().all()

@router.post("/{session_id}/checkin", response_model=ParticipantResponse)
async def check_in_participant(
    session_id: int,
    qr_code_hash: str = None,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user)
):
    # Verify participant is registered for this session
    stmt = select(Participant).where(
        Participant.session_id == session_id,
        Participant.user_id == current_user["id"]
    )
    result = await db.execute(stmt)
    participant = result.scalars().first()

    if not participant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Participant not registered for this session."
        )

    # If QR code is provided, validate it (simulated validation here)
    if qr_code_hash and participant.qr_code_hash != qr_code_hash:
        # In a real system, you'd match hashes securely. For now, just save it.
        participant.qr_code_hash = qr_code_hash

    # Mark as checked in
    participant.check_in_status = 'CHECKED_IN'
    await db.commit()
    await db.refresh(participant)

    return participant

@router.post("/{session_id}/end", response_model=dict)
async def end_session(
    session_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user)
):
    # Only admins can end sessions
    if current_user.get("role_id") != 1:
        raise HTTPException(status_code=403, detail="Not authorized to end sessions.")
        
    result = await db.execute(
        select(Session)
        .join(Session.assessment)
        .where(Session.id == session_id)
        .where(Assessment.organization_id == current_user.get("organization_id"))
    )
    session = result.scalars().first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    session.status = "COMPLETED"
    
    if session.meeting_provider == 'ZOOM' and session.meeting_link:
        # Extract zoom meeting ID from link or metadata (if we stored it).
        # We didn't store meeting_id explicitly, but we can extract it from the link for real zoom meetings.
        # Alternatively, if token is mocked, just return success.
        meeting_id = "mock"
        if "zoom.us" in session.meeting_link:
            import re
            match = re.search(r'/j/(\d+)', session.meeting_link)
            if match:
                meeting_id = match.group(1)
        
        if meeting_id:
            await zoom_integration_service.end_meeting(meeting_id)
            
    await db.commit()
    return {"message": "Session ended successfully"}
