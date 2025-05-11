import uuid
from typing import List

from sqlalchemy.orm import Session

from app.models import Collection, Snippet, collection_snippet
from app.schemas.collection import CollectionCreate, CollectionUpdate
from app.utils.error_handling import NotFoundError


def get_collections(db: Session, skip: int = 0, limit: int = 100) -> List[Collection]:
    """Get all collections.

    Args:
        db: Database session
        skip: Number of records to skip
        limit: Maximum number of records to return

    Returns:
        List of collections
    """
    return db.query(Collection).offset(skip).limit(limit).all()


def get_collection(db: Session, collection_id: str) -> Collection:
    """Get a collection by ID.

    Args:
        db: Database session
        collection_id: Collection ID

    Returns:
        Collection object

    Raises:
        NotFoundError: If collection not found
    """
    collection = db.query(Collection).filter(Collection.id == collection_id).first()
    if not collection:
        raise NotFoundError("collection", collection_id)
    return collection


def create_collection(db: Session, collection_data: CollectionCreate) -> Collection:
    """Create a new collection.

    Args:
        db: Database session
        collection_data: Collection data

    Returns:
        Created collection
    """
    collection_id = str(uuid.uuid4())
    collection = Collection(
        id=collection_id,
        name=collection_data.name,
        description=collection_data.description,
    )
    db.add(collection)
    db.commit()
    db.refresh(collection)
    return collection


def update_collection(
    db: Session, collection_id: str, collection_data: CollectionUpdate
) -> Collection:
    """Update a collection.

    Args:
        db: Database session
        collection_id: Collection ID
        collection_data: Collection data

    Returns:
        Updated collection

    Raises:
        NotFoundError: If collection not found
    """
    collection = get_collection(db, collection_id)

    # Update fields if provided
    update_data = collection_data.dict(exclude_unset=True)

    for field, value in update_data.items():
        setattr(collection, field, value)

    db.commit()
    db.refresh(collection)
    return collection


def delete_collection(db: Session, collection_id: str) -> bool:
    """Delete a collection.

    Args:
        db: Database session
        collection_id: Collection ID

    Returns:
        True if successful

    Raises:
        NotFoundError: If collection not found
    """
    collection = get_collection(db, collection_id)
    db.delete(collection)
    db.commit()
    return True


def get_snippets_in_collection(
    db: Session, collection_id: str, skip: int = 0, limit: int = 100
) -> List[Snippet]:
    """Get snippets in a collection.

    Args:
        db: Database session
        collection_id: Collection ID
        skip: Number of records to skip
        limit: Maximum number of records to return

    Returns:
        List of snippets in the collection

    Raises:
        NotFoundError: If collection not found
    """
    # Verify collection exists
    get_collection(db, collection_id)

    return (
        db.query(Snippet)
        .join(collection_snippet, Snippet.id == collection_snippet.c.snippet_id)
        .filter(
            collection_snippet.c.collection_id == collection_id,
            Snippet.is_deleted == False,
        )
        .offset(skip)
        .limit(limit)
        .all()
    )


def add_snippet_to_collection(db: Session, collection_id: str, snippet_id: str) -> bool:
    """Add a snippet to a collection.

    Args:
        db: Database session
        collection_id: Collection ID
        snippet_id: Snippet ID

    Returns:
        True if successful

    Raises:
        NotFoundError: If collection or snippet not found
    """
    # Verify collection and snippet exist
    collection = get_collection(db, collection_id)

    from app.crud.snippet import get_snippet

    snippet = get_snippet(db, snippet_id)

    # Check if snippet is already in collection
    if snippet in collection.snippets:
        return True

    collection.snippets.append(snippet)
    db.commit()
    return True


def remove_snippet_from_collection(
    db: Session, collection_id: str, snippet_id: str
) -> bool:
    """Remove a snippet from a collection.

    Args:
        db: Database session
        collection_id: Collection ID
        snippet_id: Snippet ID

    Returns:
        True if successful

    Raises:
        NotFoundError: If collection or snippet not found
    """
    # Verify collection and snippet exist
    collection = get_collection(db, collection_id)

    from app.crud.snippet import get_snippet

    snippet = get_snippet(db, snippet_id)

    # Check if snippet is in collection
    if snippet not in collection.snippets:
        return True

    collection.snippets.remove(snippet)
    db.commit()
    return True
