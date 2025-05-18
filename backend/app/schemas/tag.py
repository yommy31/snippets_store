from datetime import datetime
from typing import List

from app.schemas.camel_model import CamelModel


# Base Tag Schema
class TagBase(CamelModel):
    """Base schema for tag data."""

    name: str


# Schema for creating a tag
class TagCreate(TagBase):
    """Schema for creating a tag."""

    pass


# Schema for updating a tag
class TagUpdate(TagBase):
    """Schema for updating a tag."""

    pass


# Schema for returning a tag
class Tag(TagBase):
    """Schema for returning a tag."""

    id: str
    created_at: datetime
    snippet_count: int = 0

    class Config:
        """Pydantic config."""

        from_attributes = True


# Response schemas
class TagResponse(CamelModel):
    """Schema for tag response."""

    tag: Tag


class TagsResponse(CamelModel):
    """Schema for tags list response."""

    tags: List[Tag]
