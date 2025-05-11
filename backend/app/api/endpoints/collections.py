from fastapi import APIRouter, Depends, Query, Path, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.collection import (
    CollectionCreate,
    CollectionUpdate,
    CollectionResponse,
    CollectionsResponse,
)
from app.schemas.snippet import SnippetsResponse
from app.crud import collection as collection_crud
from app.utils.error_handling import NotFoundError, format_error_response


router = APIRouter()


@router.get("", response_model=CollectionsResponse)
async def get_collections(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(
        100, ge=1, le=100, description="Maximum number of records to return"
    ),
    db: Session = Depends(get_db),
):
    """Get all collections."""
    collections = collection_crud.get_collections(db, skip=skip, limit=limit)
    return {"collections": collections}


@router.get("/{collection_id}", response_model=CollectionResponse)
async def get_collection(
    collection_id: str = Path(..., description="Collection ID"),
    db: Session = Depends(get_db),
):
    """Get a collection by ID."""
    try:
        collection = collection_crud.get_collection(db, collection_id)
        return {"collection": collection}
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=format_error_response(status.HTTP_404_NOT_FOUND, str(e)),
        )


@router.get("/{collection_id}/snippets", response_model=SnippetsResponse)
async def get_snippets_in_collection(
    collection_id: str = Path(..., description="Collection ID"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(
        100, ge=1, le=100, description="Maximum number of records to return"
    ),
    db: Session = Depends(get_db),
):
    """Get snippets in a collection."""
    try:
        snippets = collection_crud.get_snippets_in_collection(
            db, collection_id, skip=skip, limit=limit
        )
        return {"snippets": snippets}
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=format_error_response(status.HTTP_404_NOT_FOUND, str(e)),
        )


@router.post("", response_model=CollectionResponse, status_code=status.HTTP_201_CREATED)
async def create_collection(
    collection_data: CollectionCreate,
    db: Session = Depends(get_db),
):
    """Create a new collection."""
    collection = collection_crud.create_collection(db, collection_data)
    return {"collection": collection}


@router.put("/{collection_id}", response_model=CollectionResponse)
async def update_collection(
    collection_data: CollectionUpdate,
    collection_id: str = Path(..., description="Collection ID"),
    db: Session = Depends(get_db),
):
    """Update a collection."""
    try:
        collection = collection_crud.update_collection(
            db, collection_id, collection_data
        )
        return {"collection": collection}
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=format_error_response(status.HTTP_404_NOT_FOUND, str(e)),
        )


@router.delete("/{collection_id}")
async def delete_collection(
    collection_id: str = Path(..., description="Collection ID"),
    db: Session = Depends(get_db),
):
    """Delete a collection."""
    try:
        collection_crud.delete_collection(db, collection_id)
        return {"success": True}
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=format_error_response(status.HTTP_404_NOT_FOUND, str(e)),
        )


@router.post("/{collection_id}/snippets/{snippet_id}")
async def add_snippet_to_collection(
    collection_id: str = Path(..., description="Collection ID"),
    snippet_id: str = Path(..., description="Snippet ID"),
    db: Session = Depends(get_db),
):
    """Add a snippet to a collection."""
    try:
        collection_crud.add_snippet_to_collection(db, collection_id, snippet_id)
        return {"success": True}
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=format_error_response(status.HTTP_404_NOT_FOUND, str(e)),
        )


@router.delete("/{collection_id}/snippets/{snippet_id}")
async def remove_snippet_from_collection(
    collection_id: str = Path(..., description="Collection ID"),
    snippet_id: str = Path(..., description="Snippet ID"),
    db: Session = Depends(get_db),
):
    """Remove a snippet from a collection."""
    try:
        collection_crud.remove_snippet_from_collection(db, collection_id, snippet_id)
        return {"success": True}
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=format_error_response(status.HTTP_404_NOT_FOUND, str(e)),
        )
