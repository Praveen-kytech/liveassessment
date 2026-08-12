import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from fastapi.testclient import TestClient
import httpx

from app.main import app
from app.models.base import Base
from app.core.security import get_current_active_user

# Ephemeral SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

engine = create_async_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}, poolclass=None
)

TestingSessionLocal = async_sessionmaker(autocommit=False, autoflush=False, bind=engine, class_=AsyncSession)

@pytest_asyncio.fixture(scope="session", autouse=True)
async def prepare_database():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest_asyncio.fixture()
async def db_session() -> AsyncSession:
    async with TestingSessionLocal() as session:
        yield session

@pytest.fixture()
def client():
    # Dependency override for auth
    def override_get_current_active_user():
        return {"id": 1, "email": "test@example.com"}
    
    app.dependency_overrides[get_current_active_user] = override_get_current_active_user
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture()
def unauth_client():
    # No dependency overrides, uses the real one which fails without token
    with TestClient(app) as test_client:
        yield test_client
