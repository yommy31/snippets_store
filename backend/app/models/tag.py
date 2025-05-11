import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, String
from sqlalchemy.orm import relationship

from app.database import Base
from app.models.snippet import snippet_tag


class Tag(Base):
    """Tag model."""

    __tablename__ = "tags"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False, unique=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    snippets = relationship("Snippet", secondary=snippet_tag, back_populates="tags")
