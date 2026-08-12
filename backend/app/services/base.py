from typing import Generic, TypeVar, Optional, List, Type
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.base import BaseRepository
from app.models.base import Base

ModelType = TypeVar("ModelType", bound=Base)
CreateSchemaType = TypeVar("CreateSchemaType")
UpdateSchemaType = TypeVar("UpdateSchemaType")

class BaseService(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    def __init__(self, repository: BaseRepository[ModelType]):
        self.repository = repository
        
    async def get(self, db: AsyncSession, id: int) -> Optional[ModelType]:
        return await self.repository.get(db, id)
        
    async def get_multi(self, db: AsyncSession, skip: int = 0, limit: int = 100) -> List[ModelType]:
        return await self.repository.get_multi(db, skip, limit)
        
    async def create(self, db: AsyncSession, obj_in: CreateSchemaType) -> ModelType:
        obj_in_data = obj_in.model_dump()
        return await self.repository.create(db, obj_in=obj_in_data)
        
    async def update(self, db: AsyncSession, db_obj: ModelType, obj_in: UpdateSchemaType) -> ModelType:
        obj_in_data = obj_in.model_dump(exclude_unset=True)
        return await self.repository.update(db, db_obj=db_obj, obj_in=obj_in_data)
        
    async def delete(self, db: AsyncSession, id: int) -> ModelType:
        return await self.repository.delete(db, id)
