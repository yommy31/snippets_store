import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, String, Table
from sqlalchemy.orm import relationship

from app.database import Base


# Junction table for collection-snippet relationship
collection_snippet = Table(
    "collection_snippets",
    Base.metadata,
    Column("collection_id", String, ForeignKey("collections.id"), primary_key=True),
    Column("snippet_id", String, ForeignKey("snippets.id"), primary_key=True),
)


class Collection(Base):
    """Collection model."""

    __tablename__ = "collections"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    snippets = relationship(
        "Snippet", secondary=collection_snippet, back_populates="collections"
    )
