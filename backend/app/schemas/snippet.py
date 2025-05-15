from datetime import datetime
from typing import List, Optional, Any

from pydantic import Field, model_validator

from app.schemas.camel_model import CamelModel


# Base Snippet Schema
class SnippetFavoriteToggleQuery(CamelModel):
    """toggle favorite status of a snippet."""
    is_favorite: bool
    

# Base Snippet Schema
class SnippetBase(CamelModel):
    """Base schema for snippet data."""

    title: str
    description: Optional[str] = None
    code: str
    language: str
    category_id: Optional[str] = None


# Schema for creating a snippet
class SnippetCreate(SnippetBase):
    """Schema for creating a snippet."""

    tags: List[str] = []


# Schema for updating a snippet
class SnippetUpdate(CamelModel):
    """Schema for updating a snippet."""

    title: Optional[str] = None
    description: Optional[str] = None
    code: Optional[str] = None
    language: Optional[str] = None
    category_id: Optional[str] = None
    tags: Optional[List[str]] = None
    is_favorite: Optional[bool] = None


# Schema for returning a snippet
class Snippet(SnippetBase):
    """Schema for returning a snippet."""

    id: str
    is_favorite: bool = False
    is_deleted: bool = False
    created_at: datetime
    updated_at: datetime
    tags: List[str] = []

    class Config:
        """Pydantic config."""

        from_attributes = True

    @model_validator(mode="before")
    @classmethod
    def convert_tags_to_names(cls, data: Any) -> Any:
        """Convert Tag objects to tag names."""
        # 处理字典情况（通常是从API请求或手动创建的数据）
        if isinstance(data, dict) and "tags" in data and data["tags"]:
            if data["tags"] and hasattr(data["tags"][0], "name"):
                data["tags"] = [tag.name for tag in data["tags"]]
        # 处理ORM模型情况（通常是从数据库查询返回的对象）
        elif hasattr(data, "tags") and data.tags:
            # 确保tags属性存在且非空
            if hasattr(data.tags[0], "name"):
                data = dict(data.__dict__)
                data["tags"] = [tag.name for tag in data["tags"]]
        return data


# Schema for batch operations
class BatchOperation(CamelModel):
    """Schema for batch operations."""

    operation: str = Field(
        ...,
        description="Operation to perform: delete, restore, favorite, unfavorite, permanent-delete",
    )
    snippetIds: List[str] = Field(..., description="List of snippet IDs to operate on")


# Response schemas
class SnippetResponse(CamelModel):
    """Schema for snippet response."""

    snippet: Snippet


class SnippetsResponse(CamelModel):
    """Schema for snippets list response."""

    snippets: List[Snippet]


class SuccessResponse(CamelModel):
    """Schema for success response."""

    success: bool
    count: Optional[int] = None
