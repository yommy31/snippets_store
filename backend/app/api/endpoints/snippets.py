from typing import Optional, Dict, Any

from fastapi import APIRouter, Depends, Query, Path, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.snippet import Snippet as SnippetModel
from app.schemas.snippet import (
    SnippetCreate,
    SnippetUpdate,
    SnippetResponse,
    SnippetsResponse,
    BatchOperation,
    SuccessResponse,
)
from app.crud import snippet as snippet_crud
from app.utils.error_handling import NotFoundError, format_error_response


def convert_tags_to_names(snippet_obj: SnippetModel) -> Dict[str, Any]:
    """Convert a Snippet model to a dictionary with tag names."""
    snippet_dict = {
        "id": snippet_obj.id,
        "title": snippet_obj.title,
        "description": snippet_obj.description,
        "code": snippet_obj.code,
        "language": snippet_obj.language,
        "category_id": snippet_obj.category_id,
        "is_favorite": snippet_obj.is_favorite,
        "is_deleted": snippet_obj.is_deleted,
        "created_at": snippet_obj.created_at,
        "updated_at": snippet_obj.updated_at,
        "tags": [tag.name for tag in snippet_obj.tags] if snippet_obj.tags else [],
    }
    return snippet_dict


router = APIRouter()


@router.get("", response_model=SnippetsResponse)
async def get_snippets(
    deleted: Optional[bool] = Query(False, description="Filter by deleted status"),
    favorite: Optional[bool] = Query(None, description="Filter by favorite status"),
    search: Optional[str] = Query(
        None, description="Search in title, description, and code"
    ),
    language: Optional[str] = Query(None, description="Filter by programming language"),
    category_id: Optional[str] = Query(None, description="Filter by category ID"),
    tag: Optional[str] = Query(None, description="Filter by tag name"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(
        100, ge=1, le=100, description="Maximum number of records to return"
    ),
    db: Session = Depends(get_db),
):
    """Get snippets with filters."""
    snippet_models = snippet_crud.get_snippets(
        db,
        deleted=deleted,
        favorite=favorite,
        search=search,
        language=language,
        category_id=category_id,
        tag=tag,
        skip=skip,
        limit=limit,
    )

    # Convert each snippet model to a dictionary with tag names
    snippet_dicts = [convert_tags_to_names(snippet) for snippet in snippet_models]
    return {"snippets": snippet_dicts}


@router.get("/search", response_model=SnippetsResponse)
async def search_snippets(
    q: str = Query(..., description="Search query"),
    deleted: Optional[bool] = Query(False, description="Include deleted snippets"),
    favorite: Optional[bool] = Query(None, description="Filter by favorite status"),
    language: Optional[str] = Query(None, description="Filter by programming language"),
    category_id: Optional[str] = Query(None, description="Filter by category ID"),
    tag: Optional[str] = Query(None, description="Filter by tag name"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(
        100, ge=1, le=100, description="Maximum number of records to return"
    ),
    db: Session = Depends(get_db),
):
    """Search snippets."""
    snippet_models = snippet_crud.get_snippets(
        db,
        deleted=deleted,
        favorite=favorite,
        search=q,
        language=language,
        category_id=category_id,
        tag=tag,
        skip=skip,
        limit=limit,
    )

    # Convert each snippet model to a dictionary with tag names
    snippet_dicts = [convert_tags_to_names(snippet) for snippet in snippet_models]
    return {"snippets": snippet_dicts}


@router.get("/favorites", response_model=SnippetsResponse)
async def get_favorite_snippets(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(
        100, ge=1, le=100, description="Maximum number of records to return"
    ),
    db: Session = Depends(get_db),
):
    """Get favorite snippets."""
    snippet_models = snippet_crud.get_favorite_snippets(db, skip=skip, limit=limit)

    # Convert each snippet model to a dictionary with tag names
    snippet_dicts = [convert_tags_to_names(snippet) for snippet in snippet_models]
    return {"snippets": snippet_dicts}


@router.get("/recycle-bin", response_model=SnippetsResponse)
async def get_recycle_bin_snippets(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(
        100, ge=1, le=100, description="Maximum number of records to return"
    ),
    db: Session = Depends(get_db),
):
    """Get snippets in recycle bin."""
    snippet_models = snippet_crud.get_recycle_bin_snippets(db, skip=skip, limit=limit)

    # Convert each snippet model to a dictionary with tag names
    snippet_dicts = [convert_tags_to_names(snippet) for snippet in snippet_models]
    return {"snippets": snippet_dicts}


@router.post("/batch", response_model=SuccessResponse)
async def batch_operation(
    operation_data: BatchOperation,
    db: Session = Depends(get_db),
):
    """Perform batch operation on snippets."""
    result = snippet_crud.batch_operation(
        db,
        operation=operation_data.operation,
        snippetIds=operation_data.snippetIds,
    )
    return result


@router.get("/{snippet_id}", response_model=SnippetResponse)
async def get_snippet(
    snippet_id: str = Path(..., description="Snippet ID"),
    db: Session = Depends(get_db),
):
    """Get a snippet by ID."""
    try:
        snippet_model = snippet_crud.get_snippet(db, snippet_id)
        snippet_dict = convert_tags_to_names(snippet_model)
        return {"snippet": snippet_dict}
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=format_error_response(status.HTTP_404_NOT_FOUND, str(e)),
        )


@router.post("", response_model=SnippetResponse, status_code=status.HTTP_201_CREATED)
async def create_snippet(
    snippet_data: SnippetCreate,
    db: Session = Depends(get_db),
):
    """Create a new snippet."""
    snippet_model = snippet_crud.create_snippet(db, snippet_data)
    snippet_dict = convert_tags_to_names(snippet_model)
    return {"snippet": snippet_dict}


@router.put("/{snippet_id}", response_model=SnippetResponse)
async def update_snippet(
    snippet_data: SnippetUpdate,
    snippet_id: str = Path(..., description="Snippet ID"),
    db: Session = Depends(get_db),
):
    """Update a snippet."""
    try:
        snippet_model = snippet_crud.update_snippet(db, snippet_id, snippet_data)
        snippet_dict = convert_tags_to_names(snippet_model)
        return {"snippet": snippet_dict}
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=format_error_response(status.HTTP_404_NOT_FOUND, str(e)),
        )


@router.delete("/{snippet_id}", response_model=SuccessResponse)
async def delete_snippet(
    snippet_id: str = Path(..., description="Snippet ID"),
    db: Session = Depends(get_db),
):
    """Move a snippet to recycle bin."""
    try:
        snippet_crud.delete_snippet(db, snippet_id)
        return {"success": True}
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=format_error_response(status.HTTP_404_NOT_FOUND, str(e)),
        )


@router.post("/{snippet_id}/restore", response_model=SnippetResponse)
async def restore_snippet(
    snippet_id: str = Path(..., description="Snippet ID"),
    db: Session = Depends(get_db),
):
    """Restore a snippet from recycle bin."""
    try:
        snippet_model = snippet_crud.restore_snippet(db, snippet_id)
        snippet_dict = convert_tags_to_names(snippet_model)
        return {"snippet": snippet_dict}
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=format_error_response(status.HTTP_404_NOT_FOUND, str(e)),
        )


@router.delete("/{snippet_id}/permanent", response_model=SuccessResponse)
async def permanently_delete_snippet(
    snippet_id: str = Path(..., description="Snippet ID"),
    db: Session = Depends(get_db),
):
    """Permanently delete a snippet."""
    try:
        snippet_crud.permanently_delete_snippet(db, snippet_id)
        return {"success": True}
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=format_error_response(status.HTTP_404_NOT_FOUND, str(e)),
        )


@router.post("/{snippet_id}/favorite", response_model=SnippetResponse)
async def toggle_favorite(
    snippet_id: str = Path(..., description="Snippet ID"),
    is_favorite: bool = Query(..., description="Favorite status"),
    db: Session = Depends(get_db),
):
    """Toggle favorite status of a snippet."""
    try:
        snippet_model = snippet_crud.toggle_favorite(db, snippet_id, is_favorite)
        snippet_dict = convert_tags_to_names(snippet_model)
        return {"snippet": snippet_dict}
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=format_error_response(status.HTTP_404_NOT_FOUND, str(e)),
        )
