from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime, timedelta
import pytz
from app.core.database import get_db
from app.models.models import Ticket

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/spikes")
async def get_analytics_spikes(db: AsyncSession = Depends(get_db)):
    now = datetime.now(pytz.utc)
    last_24h = now - timedelta(hours=24)
    
    # Volume in last 24h by topic
    recent_stmt = select(Ticket.topic, func.count(Ticket.id).label("recent_count")).filter(Ticket.created_at >= last_24h).group_by(Ticket.topic)
    recent_result = await db.execute(recent_stmt)
    recent_data = {row.topic: row.recent_count for row in recent_result}
    
    # Baseline volume (all time before last 24h, normalized per 24h)
    baseline_stmt = select(Ticket.topic, func.count(Ticket.id).label("total_count"), func.min(Ticket.created_at).label("first_seen")).filter(Ticket.created_at < last_24h).group_by(Ticket.topic)
    baseline_result = await db.execute(baseline_stmt)
    
    baseline_data = {}
    for row in baseline_result:
        topic = row.topic
        total_count = row.total_count
        first_seen = row.first_seen
        if first_seen:
            days_diff = (last_24h - first_seen).days
            days_diff = max(1, days_diff)  # Avoid division by zero
            baseline_data[topic] = total_count / days_diff
            
    # Calculate spikes
    results = []
    for topic, recent_count in recent_data.items():
        baseline_avg = baseline_data.get(topic, 0)
        # If baseline is 0, we can consider it an anomaly if count is somewhat high, or just use 1 as min
        baseline_avg = max(1.0, baseline_avg)
        
        ratio = recent_count / baseline_avg
        is_anomaly = ratio > 3.0  # >300% of baseline means it's an anomaly
        
        results.append({
            "topic": topic,
            "recent_volume": recent_count,
            "baseline_avg_per_day": round(baseline_avg, 2),
            "is_anomaly": is_anomaly
        })
        
    return results
