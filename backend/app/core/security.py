from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from typing import Optional

# Mock implementation of OAuth2
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    # In reality, this would decode the JWT token and fetch the user
    if not token or token == "invalid":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return {"id": 1, "email": "admin@example.com"}

async def get_current_active_user(current_user: dict = Depends(get_current_user)):
    # Further checks like is_active could be done here
    return current_user
