from pydantic_settings import BaseSettings
from pathlib import Path


class Settings(BaseSettings):
    """Application settings."""

    # Base settings
    APP_NAME: str = "Code Snippet Manager"
    API_PREFIX: str = "/api"
    DEBUG: bool = True

    # Database settings
    DATABASE_URL: str = f"sqlite:///{Path(__file__).parent.parent}/snippets.db"

    # CORS settings
    CORS_ORIGINS: list[str] = ["*"]
    CORS_ALLOW_CREDENTIALS: bool = True
    CORS_ALLOW_METHODS: list[str] = ["*"]
    CORS_ALLOW_HEADERS: list[str] = ["*"]


settings = Settings()
