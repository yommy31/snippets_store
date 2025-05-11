"""
Tests for snippet API endpoints.
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.crud import snippet as snippet_crud
from app.crud import category as category_crud
from app.crud import tag as tag_crud
from app.schemas.category import CategoryCreate
from app.schemas.tag import TagCreate
from app.schemas.snippet import SnippetCreate
import uuid


@pytest.fixture
def test_category(db_session: Session):
    """Create a test category."""
    category_data = CategoryCreate(
        name="Test Category",
        description="Test category description",
    )
    return category_crud.create_category(db_session, category_data)


@pytest.fixture
def test_tags(db_session: Session):
    """Create test tags."""
    # Use unique tag names for each test run
    unique_suffix = str(uuid.uuid4())[:8]
    tag1_data = TagCreate(name=f"test-tag-1-{unique_suffix}")
    tag2_data = TagCreate(name=f"test-tag-2-{unique_suffix}")
    tag1 = tag_crud.create_tag(db_session, tag1_data)
    tag2 = tag_crud.create_tag(db_session, tag2_data)
    return [tag1, tag2]


@pytest.fixture
def test_snippet(db_session: Session, test_category, test_tags):
    """Create a test snippet."""
    # Use a unique ID for each test run
    snippet_data = SnippetCreate(
        title="Test Snippet",
        description="Test snippet description",
        code="print('Hello, World!')",
        language="python",
        category_id=test_category.id,
        tags=[tag.name for tag in test_tags],
    )
    return snippet_crud.create_snippet(db_session, snippet_data)


def test_get_snippets(client: TestClient):
    """Test GET /api/snippets endpoint."""
    response = client.get("/api/snippets")
    assert response.status_code == 200
    data = response.json()
    assert "snippets" in data
    assert isinstance(data["snippets"], list)


def test_get_snippet(client: TestClient, test_snippet):
    """Test GET /api/snippets/{snippet_id} endpoint."""
    response = client.get(f"/api/snippets/{test_snippet.id}")
    assert response.status_code == 200
    data = response.json()
    assert "snippet" in data
    assert data["snippet"]["id"] == test_snippet.id
    assert data["snippet"]["title"] == test_snippet.title

    # Test getting a non-existent snippet
    response = client.get("/api/snippets/non-existent-id")
    assert response.status_code == 404


def test_create_snippet(client: TestClient, test_category, test_tags):
    """Test POST /api/snippets endpoint."""
    snippet_data = {
        "title": "New Snippet",
        "description": "New snippet description",
        "code": "print('New snippet')",
        "language": "python",
        "category_id": test_category.id,
        "tags": [tag.name for tag in test_tags],
    }
    response = client.post("/api/snippets", json=snippet_data)
    assert response.status_code == 201
    data = response.json()
    assert "snippet" in data
    assert data["snippet"]["title"] == "New Snippet"
    assert data["snippet"]["description"] == "New snippet description"
    assert data["snippet"]["code"] == "print('New snippet')"
    assert data["snippet"]["language"] == "python"
    assert data["snippet"]["category_id"] == test_category.id
    assert len(data["snippet"]["tags"]) == 2
    assert test_tags[0].name in data["snippet"]["tags"]
    assert test_tags[1].name in data["snippet"]["tags"]


def test_update_snippet(client: TestClient, test_snippet, test_tags):
    """Test PUT /api/snippets/{snippet_id} endpoint."""
    update_data = {
        "title": "Updated Snippet",
        "description": "Updated description",
        "code": "print('Updated!')",
        "tags": [test_tags[0].name],
    }
    response = client.put(f"/api/snippets/{test_snippet.id}", json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert "snippet" in data
    assert data["snippet"]["id"] == test_snippet.id
    assert data["snippet"]["title"] == "Updated Snippet"
    assert data["snippet"]["description"] == "Updated description"
    assert data["snippet"]["code"] == "print('Updated!')"
    assert len(data["snippet"]["tags"]) == 1
    assert test_tags[0].name in data["snippet"]["tags"]

    # Test updating a non-existent snippet
    response = client.put("/api/snippets/non-existent-id", json=update_data)
    assert response.status_code == 404


def test_delete_snippet(client: TestClient, test_snippet):
    """Test DELETE /api/snippets/{snippet_id} endpoint."""
    response = client.delete(f"/api/snippets/{test_snippet.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True

    # Check the snippet is marked as deleted
    response = client.get("/api/snippets/recycle-bin")
    assert response.status_code == 200
    data = response.json()
    assert len(data["snippets"]) == 1
    assert data["snippets"][0]["id"] == test_snippet.id

    # Test deleting a non-existent snippet
    response = client.delete("/api/snippets/non-existent-id")
    assert response.status_code == 404


def test_restore_snippet(client: TestClient, test_snippet):
    """Test POST /api/snippets/{snippet_id}/restore endpoint."""
    # First, delete the snippet
    client.delete(f"/api/snippets/{test_snippet.id}")

    # Then, restore it
    response = client.post(f"/api/snippets/{test_snippet.id}/restore")
    assert response.status_code == 200
    data = response.json()
    assert "snippet" in data
    assert data["snippet"]["id"] == test_snippet.id
    assert data["snippet"]["is_deleted"] is False

    # Check the snippet is no longer in the recycle bin
    response = client.get("/api/snippets/recycle-bin")
    assert response.status_code == 200
    data = response.json()
    assert len(data["snippets"]) == 0

    # Test restoring a non-existent snippet
    response = client.post("/api/snippets/non-existent-id/restore")
    assert response.status_code == 404


def test_permanently_delete_snippet(client: TestClient, test_snippet):
    """Test DELETE /api/snippets/{snippet_id}/permanent endpoint."""
    response = client.delete(f"/api/snippets/{test_snippet.id}/permanent")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True

    # Check the snippet no longer exists
    response = client.get(f"/api/snippets/{test_snippet.id}")
    assert response.status_code == 404

    # Test permanently deleting a non-existent snippet
    response = client.delete("/api/snippets/non-existent-id/permanent")
    assert response.status_code == 404


def test_toggle_favorite(client: TestClient, test_snippet):
    """Test POST /api/snippets/{snippet_id}/favorite endpoint."""
    # Toggle favorite to True
    response = client.post(
        f"/api/snippets/{test_snippet.id}/favorite", params={"is_favorite": True}
    )
    assert response.status_code == 200
    data = response.json()
    assert "snippet" in data
    assert data["snippet"]["id"] == test_snippet.id
    assert data["snippet"]["is_favorite"] is True

    # Check the snippet appears in favorites
    response = client.get("/api/snippets/favorites")
    assert response.status_code == 200
    data = response.json()
    assert len(data["snippets"]) == 1
    assert data["snippets"][0]["id"] == test_snippet.id

    # Toggle favorite to False
    response = client.post(
        f"/api/snippets/{test_snippet.id}/favorite", params={"is_favorite": False}
    )
    assert response.status_code == 200
    data = response.json()
    assert "snippet" in data
    assert data["snippet"]["id"] == test_snippet.id
    assert data["snippet"]["is_favorite"] is False

    # Check the snippet no longer appears in favorites
    response = client.get("/api/snippets/favorites")
    assert response.status_code == 200
    data = response.json()
    assert len(data["snippets"]) == 0

    # Test toggling favorite for a non-existent snippet
    response = client.post(
        "/api/snippets/non-existent-id/favorite", params={"is_favorite": True}
    )
    assert response.status_code == 404


def test_search_snippets(client: TestClient, test_snippet):
    """Test GET /api/snippets/search endpoint."""
    # Search by title
    response = client.get("/api/snippets/search", params={"q": "Test"})
    assert response.status_code == 200
    data = response.json()
    assert len(data["snippets"]) == 1
    assert data["snippets"][0]["id"] == test_snippet.id

    # Search by language
    response = client.get(
        "/api/snippets/search", params={"q": "Hello", "language": "python"}
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data["snippets"]) == 1
    assert data["snippets"][0]["id"] == test_snippet.id

    # Search with no results
    response = client.get("/api/snippets/search", params={"q": "nonexistent"})
    assert response.status_code == 200
    data = response.json()
    assert len(data["snippets"]) == 0


def test_batch_operations(client: TestClient, db_session: Session, test_category):
    """Test POST /api/snippets/batch endpoint."""
    # Create snippets with unique titles
    unique_suffix = str(uuid.uuid4())[:8]
    snippet1_data = SnippetCreate(
        title=f"API Batch Snippet 1 {unique_suffix}",
        description="Batch snippet 1 description",
        code="print('Batch 1')",
        language="python",
        category_id=test_category.id,
    )
    snippet2_data = SnippetCreate(
        title=f"API Batch Snippet 2 {unique_suffix}",
        description="Batch snippet 2 description",
        code="print('Batch 2')",
        language="python",
        category_id=test_category.id,
    )
    snippet1 = snippet_crud.create_snippet(db_session, snippet1_data)
    snippet2 = snippet_crud.create_snippet(db_session, snippet2_data)

    # Batch favorite
    batch_data = {
        "operation": "favorite",
        "snippetIds": [snippet1.id, snippet2.id],
    }
    response = client.post("/api/snippets/batch", json=batch_data)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["count"] == 2
