import time
import logging
from fastapi import APIRouter, Depends, Query, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas.sync_schemas import PullChangesResponse, PushChangesRequest, SyncChanges, TicketChanges

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/sync", tags=["sync"])

@router.get("/pull", response_model=PullChangesResponse)
async def pull_changes(
    last_pulled_at: int = Query(0, description="Timestamp (ms since epoch) of the last successful pull"),
    db: AsyncSession = Depends(get_db)
):
    """
    Pull changes from the server that occurred after last_pulled_at.
    
    This endpoint:
    1. Determines changes (created, updated, deleted) that happened since last_pulled_at.
    2. Uses soft delete column `deleted_at` to detect deleted records.
    3. Returns them partitioned by operation, alongside a fresh server timestamp.
    """
    logger.info(f"Sync pull requested with last_pulled_at: {last_pulled_at}")
    
    # Generate the current server timestamp in milliseconds
    server_timestamp_ms = int(time.time() * 1000)
    
    try:
        # TODO: Implement database queries using SQLAlchemy async API:
        # 1. Fetch newly created tickets:
        #    query where updated_at == created_at AND updated_at > last_pulled_at_datetime AND deleted_at IS NULL
        # 2. Fetch updated tickets:
        #    query where updated_at > created_at AND updated_at > last_pulled_at_datetime AND deleted_at IS NULL
        # 3. Fetch deleted tickets:
        #    query where deleted_at > last_pulled_at_datetime
        
        # Currently returns a clean, mock/empty structure conforming to the sync protocol
        empty_changes = SyncChanges(
            tickets=TicketChanges(
                created=[],
                updated=[],
                deleted=[]
            )
        )
        
        return PullChangesResponse(
            changes=empty_changes,
            timestamp=server_timestamp_ms
        )
        
    except Exception as e:
        logger.error(f"Error pulling changes: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to pull database changes."
        )

@router.post("/push", status_code=status.HTTP_200_OK)
async def push_changes(
    payload: PushChangesRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Push changes from the client to the server.
    
    This endpoint:
    1. Accepts lists of tickets created, updated, and deleted locally.
    2. Performs upset/insert operations on the database.
    3. Soft-deletes any tickets sent in the deleted list.
    """
    logger.info(f"Sync push requested. Created: {len(payload.changes.tickets.created)}, "
                f"Updated: {len(payload.changes.tickets.updated)}, "
                f"Deleted: {len(payload.changes.tickets.deleted)}")
    
    try:
        # TODO: Process each category of changes within the database transaction:
        # - Created tickets: Save new records to database.
        # - Updated tickets: Merge/update existing records in database.
        # - Deleted tickets: Soft-delete records by setting deleted_at = current_time.
        
        # Simulating successful synchronization
        return {"status": "ok"}
        
    except Exception as e:
        logger.error(f"Error pushing changes: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to push database changes."
        )
