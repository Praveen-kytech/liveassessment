from fastapi import APIRouter
from app.api.v1.endpoints import auth, sessions, assessments, participants, questions, users, zoom, analytics, certificates

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(sessions.router, prefix="/sessions", tags=["sessions"])
api_router.include_router(assessments.router, prefix="/assessments", tags=["assessments"])
api_router.include_router(participants.router, prefix="/participants", tags=["participants"])
api_router.include_router(questions.router, prefix="/questions", tags=["questions"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(zoom.router, prefix="/zoom", tags=["zoom"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(certificates.router, prefix="/certificates", tags=["certificates"])
