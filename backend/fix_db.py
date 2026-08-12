import asyncio
from sqlalchemy import text
from app.core.database import AsyncSessionLocal

async def alter():
    async with AsyncSessionLocal() as db:
        try:
            await db.execute(text("ALTER TABLE sessions ALTER COLUMN meeting_link TYPE TEXT;"))
            await db.execute(text("ALTER TABLE sessions ALTER COLUMN host_meeting_link TYPE TEXT;"))
            await db.commit()
            print("Successfully increased column length to TEXT")
        except Exception as e:
            print("Error:", e)

if __name__ == "__main__":
    asyncio.run(alter())
