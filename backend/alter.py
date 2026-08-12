import asyncio
from sqlalchemy import text
from app.core.database import AsyncSessionLocal

async def alter():
    async with AsyncSessionLocal() as db:
        try:
            await db.execute(text("ALTER TABLE sessions ADD COLUMN host_meeting_link VARCHAR(255);"))
            await db.commit()
            print("Altered")
        except Exception as e:
            print("Error:", e)

if __name__ == "__main__":
    asyncio.run(alter())
