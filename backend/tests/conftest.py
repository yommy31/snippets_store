import os
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

from app.database import Base
from app.main import app


# Use an in-memory SQLite database for testing
TEST_DATABASE_URL = "sqlite:///./test.db"


@pytest.fixture(scope="session")
def test_db_engine():
    """Create a test database engine."""
    engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)

    # Remove the test database file
    if os.path.exists("./test.db"):
        os.remove("./test.db")


@pytest.fixture(scope="function")
def db_session(test_db_engine):
    """Create a test database session."""
    # 创建一个临时会话来清除所有表中的数据
    TestingSessionLocal = sessionmaker(
        autocommit=False, autoflush=False, bind=test_db_engine
    )
    temp_session = TestingSessionLocal()

    # 清除所有表中的数据
    for table in reversed(Base.metadata.sorted_tables):
        temp_session.execute(table.delete())
    temp_session.commit()
    temp_session.close()

    # 创建测试会话
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.rollback()
        session.close()


@pytest.fixture(scope="function")
def client(db_session):
    """Create a test client with a test database session."""

    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    # Override the get_db dependency
    from app.database import get_db

    app.dependency_overrides = {get_db: override_get_db}

    with TestClient(app) as test_client:
        yield test_client
