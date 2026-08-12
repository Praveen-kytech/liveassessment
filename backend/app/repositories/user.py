from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User
from .base import BaseRepository
from typing import Optional

class UserRepository(BaseRepository[User]):
    def __init__(self):
        super().__init__(User)
        
    async def get_by_email(self, db: AsyncSession, email: str) -> Optional[User]:
        result = await db.execute(select(User).filter(User.email == email))
        return result.scalars().first()

user_repository = UserRepository()
