from app.models.session import Session
from app.schemas.session import SessionCreate, SessionUpdate
from app.repositories.session import session_repository
from .base import BaseService

class SessionService(BaseService[Session, SessionCreate, SessionUpdate]):
    def __init__(self):
        super().__init__(session_repository)

session_service = SessionService()
