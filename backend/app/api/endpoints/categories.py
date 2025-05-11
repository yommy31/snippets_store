from fastapi import APIRouter, Depends, Query, Path, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.category import (
    CategoryCreate,
    CategoryUpdate,
    CategoryResponse,
    CategoriesResponse,
)
from app.schemas.snippet import SnippetsResponse
from app.crud import category as category_crud
from app.utils.error_handling import NotFoundError, format_error_response


router = APIRouter()


@router.get("", response_model=CategoriesResponse)
async def get_categories(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(
        100, ge=1, le=100, description="Maximum number of records to return"
    ),
    db: Session = Depends(get_db),
):
    """Get all categories."""
    categories = category_crud.get_categories(db, skip=skip, limit=limit)
    return {"categories": categories}


@router.get("/{category_id}", response_model=CategoryResponse)
async def get_category(
    category_id: str = Path(..., description="Category ID"),
    db: Session = Depends(get_db),
):
    """Get a category by ID."""
    try:
        category = category_crud.get_category(db, category_id)
        return {"category": category}
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=format_error_response(status.HTTP_404_NOT_FOUND, str(e)),
        )


@router.get("/{category_id}/snippets", response_model=SnippetsResponse)
async def get_snippets_by_category(
    category_id: str = Path(..., description="Category ID"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(
        100, ge=1, le=100, description="Maximum number of records to return"
    ),
    db: Session = Depends(get_db),
):
    """Get snippets by category."""
    try:
        snippets = category_crud.get_snippets_by_category(
            db, category_id, skip=skip, limit=limit
        )
        return {"snippets": snippets}
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=format_error_response(status.HTTP_404_NOT_FOUND, str(e)),
        )


@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(
    category_data: CategoryCreate,
    db: Session = Depends(get_db),
):
    """Create a new category."""
    category = category_crud.create_category(db, category_data)
    return {"category": category}


@router.put("/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_data: CategoryUpdate,
    category_id: str = Path(..., description="Category ID"),
    db: Session = Depends(get_db),
):
    """Update a category."""
    try:
        category = category_crud.update_category(db, category_id, category_data)
        return {"category": category}
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=format_error_response(status.HTTP_404_NOT_FOUND, str(e)),
        )


@router.delete("/{category_id}")
async def delete_category(
    category_id: str = Path(..., description="Category ID"),
    db: Session = Depends(get_db),
):
    """Delete a category."""
    try:
        category_crud.delete_category(db, category_id)
        return {"success": True}
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=format_error_response(status.HTTP_404_NOT_FOUND, str(e)),
        )
