import asyncio
from sqlalchemy import text
from app.core.database import AsyncSessionLocal, engine
from app.models.base import Base
# Import all models to ensure they are registered with Base.metadata
from app.models import *

async def alter():
    # Create new tables (ProctoringLog, SessionEvent)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        print("Created new tables.")
        
    # Alter existing tables
    async with AsyncSessionLocal() as db:
        try:
            await db.execute(text("ALTER TABLE results ADD COLUMN IF NOT EXISTS is_passed BOOLEAN DEFAULT FALSE;"))
            await db.execute(text("ALTER TABLE results ADD COLUMN IF NOT EXISTS certificate_issued BOOLEAN DEFAULT FALSE;"))
            await db.commit()
            print("Successfully added is_passed and certificate_issued to results table")
        except Exception as e:
            print("Error altering results:", e)

if __name__ == "__main__":
    asyncio.run(alter())
