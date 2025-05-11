import uuid
from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, String, Table
from sqlalchemy.orm import relationship

from app.database import Base


# Junction table for snippet-tag relationship
snippet_tag = Table(
    "snippet_tags",
    Base.metadata,
    Column("snippet_id", String, ForeignKey("snippets.id"), primary_key=True),
    Column("tag_id", String, ForeignKey("tags.id"), primary_key=True),
)


class Snippet(Base):
    """Snippet model."""

    __tablename__ = "snippets"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    code = Column(String, nullable=False)
    language = Column(String, nullable=False)
    category_id = Column(String, ForeignKey("categories.id"), nullable=True)
    is_favorite = Column(Boolean, default=False)
    is_deleted = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    category = relationship("Category", back_populates="snippets")
    tags = relationship("Tag", secondary=snippet_tag, back_populates="snippets")
    collections = relationship(
        "Collection", secondary="collection_snippets", back_populates="snippets"
    )
