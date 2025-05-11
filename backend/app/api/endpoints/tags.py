from fastapi import APIRouter, Depends, Query, Path, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.tag import (
    TagCreate,
    TagUpdate,
    TagResponse,
    TagsResponse,
)
from app.schemas.snippet import SnippetsResponse
from app.crud import tag as tag_crud
from app.utils.error_handling import NotFoundError, ConflictError, format_error_response


router = APIRouter()


@router.get("", response_model=TagsResponse)
async def get_tags(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(
        100, ge=1, le=100, description="Maximum number of records to return"
    ),
    db: Session = Depends(get_db),
):
    """Get all tags."""
    tags = tag_crud.get_tags(db, skip=skip, limit=limit)
    return {"tags": tags}


@router.get("/{tag_id}", response_model=TagResponse)
async def get_tag(
    tag_id: str = Path(..., description="Tag ID"),
    db: Session = Depends(get_db),
):
    """Get a tag by ID."""
    try:
        tag = tag_crud.get_tag(db, tag_id)
        return {"tag": tag}
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=format_error_response(status.HTTP_404_NOT_FOUND, str(e)),
        )


@router.get("/{tag_id}/snippets", response_model=SnippetsResponse)
async def get_snippets_by_tag(
    tag_id: str = Path(..., description="Tag ID"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(
        100, ge=1, le=100, description="Maximum number of records to return"
    ),
    db: Session = Depends(get_db),
):
    """Get snippets by tag."""
    try:
        snippets = tag_crud.get_snippets_by_tag(db, tag_id, skip=skip, limit=limit)
        return {"snippets": snippets}
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=format_error_response(status.HTTP_404_NOT_FOUND, str(e)),
        )


@router.post("", response_model=TagResponse, status_code=status.HTTP_201_CREATED)
async def create_tag(
    tag_data: TagCreate,
    db: Session = Depends(get_db),
):
    """Create a new tag."""
    try:
        tag = tag_crud.create_tag(db, tag_data)
        return {"tag": tag}
    except ConflictError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=format_error_response(status.HTTP_409_CONFLICT, str(e)),
        )


@router.put("/{tag_id}", response_model=TagResponse)
async def update_tag(
    tag_data: TagUpdate,
    tag_id: str = Path(..., description="Tag ID"),
    db: Session = Depends(get_db),
):
    """Update a tag."""
    try:
        tag = tag_crud.update_tag(db, tag_id, tag_data)
        return {"tag": tag}
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=format_error_response(status.HTTP_404_NOT_FOUND, str(e)),
        )
    except ConflictError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=format_error_response(status.HTTP_409_CONFLICT, str(e)),
        )


@router.delete("/{tag_id}")
async def delete_tag(
    tag_id: str = Path(..., description="Tag ID"),
    db: Session = Depends(get_db),
):
    """Delete a tag."""
    try:
        tag_crud.delete_tag(db, tag_id)
        return {"success": True}
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=format_error_response(status.HTTP_404_NOT_FOUND, str(e)),
        )
