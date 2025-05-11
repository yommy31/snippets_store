import uuid
from datetime import datetime
from typing import List, Optional, Dict, Union

from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models import Snippet, Tag, snippet_tag
from app.schemas.snippet import SnippetCreate, SnippetUpdate
from app.utils.error_handling import NotFoundError


def get_snippets(
    db: Session,
    *,
    deleted: Optional[bool] = False,
    favorite: Optional[bool] = None,
    search: Optional[str] = None,
    language: Optional[str] = None,
    category_id: Optional[str] = None,
    tag: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
) -> List[Snippet]:
    """Get snippets with filters.

    Args:
        db: Database session
        deleted: Filter by deleted status
        favorite: Filter by favorite status
        search: Search query
        language: Filter by programming language
        category_id: Filter by category ID
        tag: Filter by tag name
        skip: Number of records to skip
        limit: Maximum number of records to return

    Returns:
        List of snippets
    """
    query = db.query(Snippet)

    # Apply filters
    query = query.filter(Snippet.is_deleted == deleted)

    if favorite is not None:
        query = query.filter(Snippet.is_favorite == favorite)

    if search:
        search_filter = or_(
            Snippet.title.ilike(f"%{search}%"),
            Snippet.description.ilike(f"%{search}%"),
            Snippet.code.ilike(f"%{search}%"),
        )
        query = query.filter(search_filter)

    if language:
        query = query.filter(Snippet.language == language)

    if category_id:
        query = query.filter(Snippet.category_id == category_id)

    if tag:
        tag_obj = db.query(Tag).filter(Tag.name == tag).first()
        if tag_obj:
            query = query.join(snippet_tag).filter(snippet_tag.c.tag_id == tag_obj.id)

    # Apply pagination
    query = query.offset(skip).limit(limit)

    return query.all()


def get_snippet(db: Session, snippet_id: str) -> Snippet:
    """Get a snippet by ID.

    Args:
        db: Database session
        snippet_id: Snippet ID

    Returns:
        Snippet object

    Raises:
        NotFoundError: If snippet not found
    """
    snippet = db.query(Snippet).filter(Snippet.id == snippet_id).first()
    if not snippet:
        raise NotFoundError("snippet", snippet_id)
    return snippet


def create_snippet(db: Session, snippet_data: SnippetCreate) -> Snippet:
    """Create a new snippet.

    Args:
        db: Database session
        snippet_data: Snippet data

    Returns:
        Created snippet
    """
    # Create snippet
    snippet_id = str(uuid.uuid4())
    snippet = Snippet(
        id=snippet_id,
        title=snippet_data.title,
        description=snippet_data.description,
        code=snippet_data.code,
        language=snippet_data.language,
        category_id=snippet_data.category_id,
    )
    db.add(snippet)

    # Add tags
    if snippet_data.tags:
        for tag_name in snippet_data.tags:
            tag = db.query(Tag).filter(Tag.name == tag_name).first()
            if not tag:
                tag = Tag(id=str(uuid.uuid4()), name=tag_name)
                db.add(tag)
            snippet.tags.append(tag)

    db.commit()
    db.refresh(snippet)
    return snippet


def update_snippet(
    db: Session, snippet_id: str, snippet_data: SnippetUpdate
) -> Snippet:
    """Update a snippet.

    Args:
        db: Database session
        snippet_id: Snippet ID
        snippet_data: Snippet data

    Returns:
        Updated snippet

    Raises:
        NotFoundError: If snippet not found
    """
    snippet = get_snippet(db, snippet_id)

    # Update fields if provided
    update_data = snippet_data.dict(exclude_unset=True)

    # Handle tags separately
    tags = update_data.pop("tags", None)

    for field, value in update_data.items():
        setattr(snippet, field, value)

    # Update tags if provided
    if tags is not None:
        # Clear existing tags
        snippet.tags = []

        # Add new tags
        for tag_name in tags:
            tag = db.query(Tag).filter(Tag.name == tag_name).first()
            if not tag:
                tag = Tag(id=str(uuid.uuid4()), name=tag_name)
                db.add(tag)
            snippet.tags.append(tag)

    snippet.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(snippet)
    return snippet


def delete_snippet(db: Session, snippet_id: str) -> bool:
    """Move a snippet to recycle bin.

    Args:
        db: Database session
        snippet_id: Snippet ID

    Returns:
        True if successful

    Raises:
        NotFoundError: If snippet not found
    """
    snippet = get_snippet(db, snippet_id)
    snippet.is_deleted = True
    snippet.updated_at = datetime.utcnow()
    db.commit()
    return True


def restore_snippet(db: Session, snippet_id: str) -> Snippet:
    """Restore a snippet from recycle bin.

    Args:
        db: Database session
        snippet_id: Snippet ID

    Returns:
        Restored snippet

    Raises:
        NotFoundError: If snippet not found
    """
    snippet = get_snippet(db, snippet_id)
    snippet.is_deleted = False
    snippet.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(snippet)
    return snippet


def permanently_delete_snippet(db: Session, snippet_id: str) -> bool:
    """Permanently delete a snippet.

    Args:
        db: Database session
        snippet_id: Snippet ID

    Returns:
        True if successful

    Raises:
        NotFoundError: If snippet not found
    """
    snippet = get_snippet(db, snippet_id)
    db.delete(snippet)
    db.commit()
    return True


def toggle_favorite(db: Session, snippet_id: str, is_favorite: bool) -> Snippet:
    """Toggle favorite status of a snippet.

    Args:
        db: Database session
        snippet_id: Snippet ID
        is_favorite: New favorite status

    Returns:
        Updated snippet

    Raises:
        NotFoundError: If snippet not found
    """
    snippet = get_snippet(db, snippet_id)
    snippet.is_favorite = is_favorite
    snippet.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(snippet)
    return snippet


def get_favorite_snippets(
    db: Session, skip: int = 0, limit: int = 100
) -> List[Snippet]:
    """Get favorite snippets.

    Args:
        db: Database session
        skip: Number of records to skip
        limit: Maximum number of records to return

    Returns:
        List of favorite snippets
    """
    return (
        db.query(Snippet)
        .filter(Snippet.is_favorite == True, Snippet.is_deleted == False)
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_recycle_bin_snippets(
    db: Session, skip: int = 0, limit: int = 100
) -> List[Snippet]:
    """Get snippets in recycle bin.

    Args:
        db: Database session
        skip: Number of records to skip
        limit: Maximum number of records to return

    Returns:
        List of deleted snippets
    """
    return (
        db.query(Snippet)
        .filter(Snippet.is_deleted == True)
        .offset(skip)
        .limit(limit)
        .all()
    )


def batch_operation(
    db: Session, operation: str, snippetIds: List[str]
) -> Dict[str, Union[bool, int]]:
    """Perform batch operation on snippets.

    Args:
        db: Database session
        operation: Operation to perform (delete, restore, favorite, unfavorite, permanent-delete)
        snippetIds: List of snippet IDs

    Returns:
        Result with success status and count
    """
    count = 0

    for snippet_id in snippetIds:
        try:
            if operation == "delete":
                delete_snippet(db, snippet_id)
                count += 1
            elif operation == "restore":
                restore_snippet(db, snippet_id)
                count += 1
            elif operation == "favorite":
                toggle_favorite(db, snippet_id, True)
                count += 1
            elif operation == "unfavorite":
                toggle_favorite(db, snippet_id, False)
                count += 1
            elif operation == "permanent-delete":
                permanently_delete_snippet(db, snippet_id)
                count += 1
        except NotFoundError:
            # Skip not found snippets
            continue

    return {"success": True, "count": count}
