from pydantic import BaseModel, Field
from typing import List, Optional
import uuid

class TicketSchema(BaseModel):
    id: uuid.UUID
    student_id: str
    subject: str
    topic: str
    text_query: str
    image_url: Optional[str] = None
    status: str = "pending"
    embedding_vector: Optional[List[float]] = None
    created_at: Optional[int] = Field(None, description="Timestamp in milliseconds since epoch")
    updated_at: Optional[int] = Field(None, description="Timestamp in milliseconds since epoch")
    deleted_at: Optional[int] = Field(None, description="Timestamp in milliseconds since epoch")

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": "e4b11f7c-7d9a-4c28-9d41-36b13e9a7e6b",
                "student_id": "STU12345",
                "subject": "Physics",
                "topic": "Electromagnetism",
                "text_query": "How does Faraday's Law apply to a changing magnetic field?",
                "image_url": "https://example.com/images/ Faraday.jpg",
                "status": "pending",
                "embedding_vector": [0.012, -0.003, 0.45],
                "created_at": 1782062016000,
                "updated_at": 1782062016000,
                "deleted_at": None
            }
        }

class TicketChanges(BaseModel):
    created: List[TicketSchema] = Field(default_factory=list)
    updated: List[TicketSchema] = Field(default_factory=list)
    deleted: List[str] = Field(
        default_factory=list, 
        description="List of stringified UUID IDs of deleted tickets"
    )

class SyncChanges(BaseModel):
    tickets: TicketChanges = Field(default_factory=TicketChanges)

class PullChangesResponse(BaseModel):
    changes: SyncChanges
    timestamp: int = Field(
        ..., 
        description="Current server timestamp in milliseconds since epoch"
    )

class PushChangesRequest(BaseModel):
    changes: SyncChanges
