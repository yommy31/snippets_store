from datetime import datetime
from typing import List, Optional

from app.schemas.camel_model import CamelModel


# Base Category Schema
class CategoryBase(CamelModel):
    """Base schema for category data."""

    name: str
    description: Optional[str] = None
    parent_id: Optional[str] = None


# Schema for creating a category
class CategoryCreate(CategoryBase):
    """Schema for creating a category."""

    pass


# Schema for updating a category
class CategoryUpdate(CamelModel):
    """Schema for updating a category."""

    name: Optional[str] = None
    description: Optional[str] = None
    parent_id: Optional[str] = None


# Schema for returning a category
class Category(CategoryBase):
    """Schema for returning a category."""

    id: str
    created_at: datetime

    class Config:
        """Pydantic config."""

        from_attributes = True


# Response schemas
class CategoryResponse(CamelModel):
    """Schema for category response."""

    category: Category


class CategoriesResponse(CamelModel):
    """Schema for categories list response."""

    categories: List[Category]
