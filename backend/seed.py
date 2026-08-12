import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import AsyncSessionLocal
from app.models.organization import Organization
from app.models.role import Role
from sqlalchemy.future import select

async def seed():
    async with AsyncSessionLocal() as db:
        # Check if org exists
        result = await db.execute(select(Organization).filter_by(id=1))
        org = result.scalars().first()
        if not org:
            org = Organization(id=1, name="Acme Corp")
            db.add(org)
            
        # Check roles
        result = await db.execute(select(Role).filter_by(id=1))
        admin = result.scalars().first()
        if not admin:
            admin = Role(id=1, name="Admin")
            db.add(admin)
            
        result = await db.execute(select(Role).filter_by(id=2))
        participant = result.scalars().first()
        if not participant:
            participant = Role(id=2, name="Participant")
            db.add(participant)
            
        await db.commit()
        print("Database seeded with default Organization and Roles.")

if __name__ == "__main__":
    asyncio.run(seed())
