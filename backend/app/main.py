from fastapi import FastAPI, Depends
from app.api.routers import live, results, zoom
from app.core.exceptions import add_exception_handlers
from app.core.security import get_current_active_user

app = FastAPI(title="Live Assessment API")

add_exception_handlers(app)

app.include_router(live.router, prefix="/api/live", tags=["Live Assessment"])
app.include_router(results.router, prefix="/api/results", tags=["Results & Certificates"], dependencies=[Depends(get_current_active_user)])
app.include_router(zoom.router, prefix="/api/zoom", tags=["Zoom Integration"], dependencies=[Depends(get_current_active_user)])

@app.get("/")
def read_root():
    return {"message": "Welcome to Live Assessment Platform API"}

