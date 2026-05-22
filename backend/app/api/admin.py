from fastapi import APIRouter
from app.api.tickets import state

router = APIRouter(prefix="/admin", tags=["admin"])

@router.post("/toggle_ingestion")
async def toggle_ingestion():
    state.enabled = not state.enabled
    return {"message": "Ingestion toggled", "enabled": state.enabled}
