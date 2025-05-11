import uuid
from typing import List

from sqlalchemy.orm import Session

from app.models import Category, Snippet
from app.schemas.category import CategoryCreate, CategoryUpdate
from app.utils.error_handling import NotFoundError


def get_categories(db: Session, skip: int = 0, limit: int = 100) -> List[Category]:
    """Get all categories.

    Args:
        db: Database session
        skip: Number of records to skip
        limit: Maximum number of records to return

    Returns:
        List of categories
    """
    return db.query(Category).offset(skip).limit(limit).all()


def get_category(db: Session, category_id: str) -> Category:
    """Get a category by ID.

    Args:
        db: Database session
        category_id: Category ID

    Returns:
        Category object

    Raises:
        NotFoundError: If category not found
    """
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise NotFoundError("category", category_id)
    return category


def create_category(db: Session, category_data: CategoryCreate) -> Category:
    """Create a new category.

    Args:
        db: Database session
        category_data: Category data

    Returns:
        Created category
    """
    category_id = str(uuid.uuid4())
    category = Category(
        id=category_id,
        name=category_data.name,
        description=category_data.description,
        parent_id=category_data.parent_id,
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


def update_category(
    db: Session, category_id: str, category_data: CategoryUpdate
) -> Category:
    """Update a category.

    Args:
        db: Database session
        category_id: Category ID
        category_data: Category data

    Returns:
        Updated category

    Raises:
        NotFoundError: If category not found
    """
    category = get_category(db, category_id)

    # Update fields if provided
    update_data = category_data.dict(exclude_unset=True)

    for field, value in update_data.items():
        setattr(category, field, value)

    db.commit()
    db.refresh(category)
    return category


def delete_category(db: Session, category_id: str) -> bool:
    """Delete a category.

    Args:
        db: Database session
        category_id: Category ID

    Returns:
        True if successful

    Raises:
        NotFoundError: If category not found
    """
    category = get_category(db, category_id)

    # Update snippets to remove category reference
    db.query(Snippet).filter(Snippet.category_id == category_id).update(
        {"category_id": None}
    )

    # Update child categories to remove parent reference
    db.query(Category).filter(Category.parent_id == category_id).update(
        {"parent_id": None}
    )

    db.delete(category)
    db.commit()
    return True


def get_snippets_by_category(
    db: Session, category_id: str, skip: int = 0, limit: int = 100
) -> List[Snippet]:
    """Get snippets by category.

    Args:
        db: Database session
        category_id: Category ID
        skip: Number of records to skip
        limit: Maximum number of records to return

    Returns:
        List of snippets in the category

    Raises:
        NotFoundError: If category not found
    """
    # Verify category exists
    get_category(db, category_id)

    return (
        db.query(Snippet)
        .filter(Snippet.category_id == category_id, Snippet.is_deleted == False)
        .offset(skip)
        .limit(limit)
        .all()
    )
