from datetime import datetime
from typing import List, Optional

from app.schemas.camel_model import CamelModel


# Base Collection Schema
class CollectionBase(CamelModel):
    """Base schema for collection data."""

    name: str
    description: Optional[str] = None


# Schema for creating a collection
class CollectionCreate(CollectionBase):
    """Schema for creating a collection."""

    pass


# Schema for updating a collection
class CollectionUpdate(CamelModel):
    """Schema for updating a collection."""

    name: Optional[str] = None
    description: Optional[str] = None


# Schema for returning a collection
class Collection(CollectionBase):
    """Schema for returning a collection."""

    id: str
    created_at: datetime

    class Config:
        """Pydantic config."""

        from_attributes = True


# Response schemas
class CollectionResponse(CamelModel):
    """Schema for collection response."""

    collection: Collection


class CollectionsResponse(CamelModel):
    """Schema for collections list response."""

    collections: List[Collection]
