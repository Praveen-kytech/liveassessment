from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List
import uuid

from app.api.deps import get_db
from app.core.security import get_current_active_user
from app.models.certificate import Certificate
from app.models.result import Result
from app.models.participant import Participant
from app.models.session import Session
from app.models.assessment import Assessment
from app.models.user import User
from app.schemas.certificate import CertificateCreate, CertificateResponse

router = APIRouter()

@router.post("/generate/{result_id}", response_model=CertificateResponse)
async def generate_certificate(
    result_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user)
):
    # Fetch result
    result_query = await db.execute(select(Result).where(Result.id == result_id))
    result = result_query.scalars().first()
    
    if not result:
        raise HTTPException(status_code=404, detail="Result not found")
        
    if not result.is_passed:
        raise HTTPException(status_code=400, detail="Participant did not pass the assessment")

    # Ensure certificate doesn't already exist for this result
    existing_query = await db.execute(select(Certificate).where(Certificate.result_id == result_id))
    existing_cert = existing_query.scalars().first()
    if existing_cert:
        return existing_cert
        
    # Generate a unique URL identifier for this certificate
    unique_url = str(uuid.uuid4())
    
    certificate = Certificate(
        participant_id=result.participant_id,
        result_id=result.id,
        certificate_url=unique_url
    )
    
    db.add(certificate)
    await db.commit()
    await db.refresh(certificate)
    
    return certificate


@router.get("/{cert_url}")
async def get_certificate_by_url(
    cert_url: str,
    db: AsyncSession = Depends(get_db)
):
    # Public endpoint to verify a certificate
    # We join Result, Participant, User, Session, Assessment to get full context
    query = (
        select(Certificate)
        .options(
            selectinload(Certificate.participant).selectinload(Participant.user),
            selectinload(Certificate.result).selectinload(Result.session).selectinload(Session.assessment)
        )
        .where(Certificate.certificate_url == cert_url)
    )
    
    result = await db.execute(query)
    certificate = result.scalars().first()
    
    if not certificate:
        raise HTTPException(status_code=404, detail="Certificate not found")
        
    # Return formatted data for the frontend Certificate UI
    return {
        "id": certificate.id,
        "url": certificate.certificate_url,
        "issued_at": certificate.created_at,
        "participant_name": certificate.participant.user.full_name,
        "assessment_title": certificate.result.session.assessment.title,
        "score": certificate.result.score,
        "passing_score": certificate.result.session.assessment.passing_score
    }
