import uuid
from typing import List, Optional

from sqlalchemy.orm import Session

from app.models import Tag, Snippet, snippet_tag
from app.schemas.tag import TagCreate, TagUpdate
from app.utils.error_handling import NotFoundError, ConflictError


def get_tags(db: Session, skip: int = 0, limit: int = 100) -> List[Tag]:
    """Get all tags.

    Args:
        db: Database session
        skip: Number of records to skip
        limit: Maximum number of records to return

    Returns:
        List of tags with snippet counts
    """
    from sqlalchemy import func
    
    # 获取所有标签
    tags = db.query(Tag).offset(skip).limit(limit).all()
    
    # 为每个标签计算代码片段数量
    for tag in tags:
        snippet_count = db.query(func.count(Snippet.id)).join(
            snippet_tag, Snippet.id == snippet_tag.c.snippet_id
        ).filter(
            snippet_tag.c.tag_id == tag.id,
            Snippet.is_deleted == False
        ).scalar()
        setattr(tag, "snippet_count", snippet_count or 0)
    
    return tags


def get_tag(db: Session, tag_id: str) -> Tag:
    """Get a tag by ID.

    Args:
        db: Database session
        tag_id: Tag ID

    Returns:
        Tag object with snippet count

    Raises:
        NotFoundError: If tag not found
    """
    from sqlalchemy import func
    
    tag = db.query(Tag).filter(Tag.id == tag_id).first()
    if not tag:
        raise NotFoundError("tag", tag_id)
    
    # 计算该标签下的代码片段数量
    snippet_count = db.query(func.count(Snippet.id)).join(
        snippet_tag, Snippet.id == snippet_tag.c.snippet_id
    ).filter(
        snippet_tag.c.tag_id == tag_id,
        Snippet.is_deleted == False
    ).scalar()
    setattr(tag, "snippet_count", snippet_count or 0)
    
    return tag


def get_tag_by_name(db: Session, name: str) -> Optional[Tag]:
    """Get a tag by name.

    Args:
        db: Database session
        name: Tag name

    Returns:
        Tag object or None if not found
    """
    return db.query(Tag).filter(Tag.name == name).first()


def create_tag(db: Session, tag_data: TagCreate) -> Tag:
    """Create a new tag.

    Args:
        db: Database session
        tag_data: Tag data

    Returns:
        Created tag

    Raises:
        ConflictError: If tag with the same name already exists
    """
    # Check if tag already exists
    existing_tag = get_tag_by_name(db, tag_data.name)
    if existing_tag:
        raise ConflictError(f"Tag with name '{tag_data.name}' already exists")

    tag_id = str(uuid.uuid4())
    tag = Tag(
        id=tag_id,
        name=tag_data.name,
    )
    db.add(tag)
    db.commit()
    db.refresh(tag)
    return tag


def update_tag(db: Session, tag_id: str, tag_data: TagUpdate) -> Tag:
    """Update a tag.

    Args:
        db: Database session
        tag_id: Tag ID
        tag_data: Tag data

    Returns:
        Updated tag

    Raises:
        NotFoundError: If tag not found
        ConflictError: If tag with the same name already exists
    """
    tag = get_tag(db, tag_id)

    # Check if new name already exists
    if tag_data.name != tag.name:
        existing_tag = get_tag_by_name(db, tag_data.name)
        if existing_tag:
            raise ConflictError(f"Tag with name '{tag_data.name}' already exists")

    tag.name = tag_data.name
    db.commit()
    db.refresh(tag)
    return tag


def delete_tag(db: Session, tag_id: str) -> bool:
    """Delete a tag.

    Args:
        db: Database session
        tag_id: Tag ID

    Returns:
        True if successful

    Raises:
        NotFoundError: If tag not found
    """
    tag = get_tag(db, tag_id)
    db.delete(tag)
    db.commit()
    return True


def get_snippets_by_tag(
    db: Session, tag_id: str, skip: int = 0, limit: int = 100
) -> List[Snippet]:
    """Get snippets by tag.

    Args:
        db: Database session
        tag_id: Tag ID
        skip: Number of records to skip
        limit: Maximum number of records to return

    Returns:
        List of snippets with the tag

    Raises:
        NotFoundError: If tag not found
    """
    # Verify tag exists
    get_tag(db, tag_id)

    return (
        db.query(Snippet)
        .join(snippet_tag, Snippet.id == snippet_tag.c.snippet_id)
        .filter(snippet_tag.c.tag_id == tag_id, Snippet.is_deleted == False)
        .offset(skip)
        .limit(limit)
        .all()
    )
