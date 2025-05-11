from typing import Any, Dict, Optional

from fastapi import HTTPException, status
from pydantic import BaseModel


class ErrorResponse(BaseModel):
    """Standard error response model."""

    status: str = "error"
    message: str
    details: Optional[Dict[str, Any]] = None


class NotFoundError(HTTPException):
    """Exception raised when a resource is not found."""

    def __init__(self, resource_type: str, resource_id: str):
        """Initialize the exception.

        Args:
            resource_type: Type of resource (e.g., "snippet", "category")
            resource_id: ID of the resource
        """
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{resource_type.capitalize()} with id {resource_id} not found",
        )


class BadRequestError(HTTPException):
    """Exception raised for bad requests."""

    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        """Initialize the exception.

        Args:
            message: Error message
            details: Additional error details
        """
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"message": message, "details": details},
        )


class ConflictError(HTTPException):
    """Exception raised when there's a conflict."""

    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        """Initialize the exception.

        Args:
            message: Error message
            details: Additional error details
        """
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail={"message": message, "details": details},
        )


def format_error_response(
    status_code: int, message: str, details: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """Format error response.

    Args:
        status_code: HTTP status code
        message: Error message
        details: Additional error details

    Returns:
        Formatted error response
    """
    return {"status": "error", "message": message, "details": details}
