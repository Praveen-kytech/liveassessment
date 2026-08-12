from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.repositories.user import user_repository
from .base import BaseService
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class UserService(BaseService[User, UserCreate, UserUpdate]):
    def __init__(self):
        super().__init__(user_repository)
        
    async def get_by_email(self, db: AsyncSession, email: str) -> Optional[User]:
        return await self.repository.get_by_email(db, email)
        
    async def create(self, db: AsyncSession, obj_in: UserCreate) -> User:
        obj_in_data = obj_in.model_dump()
        password = obj_in_data.pop("password")
        obj_in_data["hashed_password"] = pwd_context.hash(password)
        return await self.repository.create(db, obj_in=obj_in_data)
        
    async def update(self, db: AsyncSession, db_obj: User, obj_in: UserUpdate) -> User:
        obj_in_data = obj_in.model_dump(exclude_unset=True)
        if "password" in obj_in_data:
            password = obj_in_data.pop("password")
            obj_in_data["hashed_password"] = pwd_context.hash(password)
        return await self.repository.update(db, db_obj=db_obj, obj_in=obj_in_data)

user_service = UserService()
