from app.models.session import Session
from .base import BaseRepository

class SessionRepository(BaseRepository[Session]):
    def __init__(self):
        super().__init__(Session)

session_repository = SessionRepository()
