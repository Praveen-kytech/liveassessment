import asyncio
from datetime import datetime
from app.core.database import AsyncSessionLocal
from app.models.session import Session

async def test_insert():
    async with AsyncSessionLocal() as db:
        try:
            session = Session(
                assessment_id=1,
                start_time=datetime.utcnow(),
                delivery_mode='ONLINE',
                meeting_provider='ZOOM',
                meeting_link='https://zoom.us/j/123456789',
                host_meeting_link='https://zoom.us/s/123456789'
            )
            db.add(session)
            await db.commit()
            print("Successfully inserted session")
        except Exception as e:
            print("Database error:", e)

if __name__ == "__main__":
    asyncio.run(test_insert())
