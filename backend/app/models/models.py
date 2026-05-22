import uuid
from datetime import datetime
from typing import Optional, List
from sqlalchemy import String, Text, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column
from pgvector.sqlalchemy import Vector
from app.core.database import Base

class Ticket(Base):
    __tablename__ = "tickets"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, 
        default=uuid.uuid4
    )
    student_id: Mapped[str] = mapped_column(
        String(255), 
        nullable=False, 
        index=True
    )
    subject: Mapped[str] = mapped_column(
        String(255), 
        nullable=False
    )
    topic: Mapped[str] = mapped_column(
        String(255), 
        nullable=False
    )
    text_query: Mapped[str] = mapped_column(
        Text, 
        nullable=False
    )
    image_url: Mapped[Optional[str]] = mapped_column(
        String(512), 
        nullable=True
    )
    status: Mapped[str] = mapped_column(
        String(50), 
        default="pending", 
        nullable=False
    )
    embedding_vector: Mapped[Optional[List[float]]] = mapped_column(
        Vector(384), 
        nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        server_default=func.clock_timestamp(), 
        nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        server_default=func.clock_timestamp(), 
        nullable=False,
        index=True
    )
    deleted_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), 
        nullable=True
    )

    def to_dict(self) -> dict:
        """Convert Ticket model to a dictionary, handles datetime & uuid conversion."""
        return {
            "id": str(self.id),
            "student_id": self.student_id,
            "subject": self.subject,
            "topic": self.topic,
            "text_query": self.text_query,
            "image_url": self.image_url,
            "status": self.status,
            "embedding_vector": self.embedding_vector,
            # Milliseconds since epoch for sync protocol
            "created_at": int(self.created_at.timestamp() * 1000) if self.created_at else None,
            "updated_at": int(self.updated_at.timestamp() * 1000) if self.updated_at else None,
            "deleted_at": int(self.deleted_at.timestamp() * 1000) if self.deleted_at else None,
        }
