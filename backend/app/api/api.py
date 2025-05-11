from fastapi import APIRouter

from app.api.endpoints import snippets, categories, tags, collections


api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(snippets.router, prefix="/snippets", tags=["snippets"])
api_router.include_router(categories.router, prefix="/categories", tags=["categories"])
api_router.include_router(tags.router, prefix="/tags", tags=["tags"])
api_router.include_router(
    collections.router, prefix="/collections", tags=["collections"]
)
