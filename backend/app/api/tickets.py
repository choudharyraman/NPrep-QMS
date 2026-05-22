from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.core.database import get_db
from app.models.models import Ticket
from sentence_transformers import SentenceTransformer
import pytesseract
from PIL import Image
import io
import json
from pywebpush import webpush, WebPushException
import os
from typing import List, Optional
from pydantic import BaseModel

router = APIRouter(prefix="/tickets", tags=["tickets"])

# Load model globally (will be loaded once when module is imported)
embedder = SentenceTransformer('all-MiniLM-L6-v2')

class ResolveBulkRequest(BaseModel):
    ticket_ids: List[str]

# Global state to act as a toggle for ingestion
class IngestionState:
    enabled: bool = True

state = IngestionState()

def check_ingestion():
    if not state.enabled:
        raise HTTPException(status_code=403, detail="Ticket ingestion is currently disabled.")

# VAPID keys setup (in production these should be loaded from env)
VAPID_PRIVATE_KEY = os.environ.get("VAPID_PRIVATE_KEY", "uE2r799V1U4-H1NqXv2S7bX4C3rB3xP9kFq7H3rB3xM")  # Dummy
VAPID_PUBLIC_KEY = os.environ.get("VAPID_PUBLIC_KEY", "BKG_oK2sN23-L_4y5Gv6R2YkR5G2p7Z2n3x2S3rB3xM") # Dummy
VAPID_CLAIMS = {"sub": "mailto:admin@example.com"}

@router.post("/submit", dependencies=[Depends(check_ingestion)])
async def submit_ticket(
    student_id: str = Form(...),
    subject: str = Form(...),
    topic: str = Form(...),
    text_query: str = Form(""),
    image: Optional[UploadFile] = File(None),
    push_subscription: Optional[str] = Form(None), # JSON string of push subscription
    db: AsyncSession = Depends(get_db)
):
    ocr_text = ""
    if image:
        try:
            image_bytes = await image.read()
            pil_image = Image.open(io.BytesIO(image_bytes))
            ocr_text = pytesseract.image_to_string(pil_image)
        except Exception as e:
            print(f"OCR Error: {e}")
            pass
            
    combined_text = f"{text_query} {ocr_text}".strip()
    if not combined_text:
        raise HTTPException(status_code=400, detail="Either text_query or image with text is required.")
        
    embedding = embedder.encode(combined_text).tolist()
    
    # Query DB for tickets where cosine similarity > 85%
    # pgvector uses cosine distance: distance = 1 - cosine_similarity
    # So similarity > 0.85 means distance < 0.15
    stmt = select(Ticket).filter(Ticket.embedding_vector.cosine_distance(embedding) < 0.15)
    result = await db.execute(stmt)
    similar_tickets = result.scalars().all()
    
    # Insert new ticket
    new_ticket = Ticket(
        student_id=student_id,
        subject=subject,
        topic=topic,
        text_query=combined_text,
        embedding_vector=embedding,
        status="pending"
    )
    db.add(new_ticket)
    await db.commit()
    await db.refresh(new_ticket)
    
    # Web Push
    if similar_tickets and push_subscription:
        try:
            sub_info = json.loads(push_subscription)
            webpush(
                subscription_info=sub_info,
                data=json.dumps({"message": "A similar question was found! Check your tickets.", "similar_count": len(similar_tickets)}),
                vapid_private_key=VAPID_PRIVATE_KEY,
                vapid_claims=VAPID_CLAIMS
            )
        except Exception as e:
            print(f"Web Push Error: {e}")
            
    return {"message": "Ticket submitted", "ticket_id": str(new_ticket.id), "similar_found": len(similar_tickets)}

@router.get("/clusters")
async def get_ticket_clusters(db: AsyncSession = Depends(get_db)):
    # Simple Python-side clustering for open tickets
    stmt = select(Ticket).filter(Ticket.status == "pending")
    result = await db.execute(stmt)
    open_tickets = result.scalars().all()
    
    clusters = []
    visited = set()
    
    for i, t1 in enumerate(open_tickets):
        if t1.id in visited:
            continue
        cluster = [t1]
        visited.add(t1.id)
        if not t1.embedding_vector:
            continue
            
        t1_emb = embedder.encode(t1.text_query) # Recompute or just use DB vector if fetched correctly
        # Actually t1.embedding_vector is loaded, but it might be string or list.
        # Let's use DB to find similar to t1
        stmt_sim = select(Ticket).filter(
            Ticket.status == "pending",
            Ticket.id != t1.id,
            Ticket.embedding_vector.cosine_distance(t1.embedding_vector) < 0.2
        )
        sim_result = await db.execute(stmt_sim)
        sim_tickets = sim_result.scalars().all()
        
        for st in sim_tickets:
            if st.id not in visited:
                cluster.append(st)
                visited.add(st.id)
                
        clusters.append({
            "cluster_id": str(t1.id),
            "size": len(cluster),
            "topic": t1.topic,
            "tickets": [t.to_dict() for t in cluster]
        })
        
    return clusters

@router.post("/resolve_bulk")
async def resolve_bulk_tickets(request: ResolveBulkRequest, db: AsyncSession = Depends(get_db)):
    stmt = update(Ticket).where(Ticket.id.in_(request.ticket_ids)).values(status="resolved")
    await db.execute(stmt)
    await db.commit()
    return {"message": f"Resolved {len(request.ticket_ids)} tickets"}
