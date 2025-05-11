"""
Tests for snippet CRUD operations.
"""

import uuid
import pytest
from sqlalchemy.orm import Session

from app.crud import snippet as snippet_crud
from app.crud import category as category_crud
from app.crud import tag as tag_crud
from app.schemas.snippet import SnippetCreate, SnippetUpdate
from app.schemas.category import CategoryCreate
from app.schemas.tag import TagCreate
from app.utils.error_handling import NotFoundError


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


def test_create_snippet(db_session: Session, test_category, test_tags):
    """Test creating a snippet."""
    # Create snippet data
    snippet_data = SnippetCreate(
        title="Test Snippet",
        description="Test snippet description",
        code="print('Hello, World!')",
        language="python",
        category_id=test_category.id,
        tags=[tag.name for tag in test_tags],
    )

    # Create snippet
    snippet = snippet_crud.create_snippet(db_session, snippet_data)

    # Check snippet
    assert snippet.title == "Test Snippet"
    assert snippet.description == "Test snippet description"
    assert snippet.code == "print('Hello, World!')"
    assert snippet.language == "python"
    assert snippet.category_id == test_category.id
    assert snippet.is_favorite is False
    assert snippet.is_deleted is False
    assert len(snippet.tags) == 2
    assert test_tags[0].name in [tag.name for tag in snippet.tags]
    assert test_tags[1].name in [tag.name for tag in snippet.tags]


def test_get_snippet(db_session: Session, test_category):
    """Test getting a snippet by ID."""
    # Create a snippet
    snippet_data = SnippetCreate(
        title="Test Snippet",
        description="Test snippet description",
        code="print('Hello, World!')",
        language="python",
        category_id=test_category.id,
    )
    created_snippet = snippet_crud.create_snippet(db_session, snippet_data)

    # Get the snippet
    snippet = snippet_crud.get_snippet(db_session, created_snippet.id)

    # Check the snippet
    assert snippet.id == created_snippet.id
    assert snippet.title == "Test Snippet"

    # Test getting a non-existent snippet
    with pytest.raises(NotFoundError):
        snippet_crud.get_snippet(db_session, "non-existent-id")


def test_get_snippets(db_session: Session, test_category):
    """Test getting snippets with filters."""
    # Create snippets with unique titles to identify them
    unique_suffix = str(uuid.uuid4())[:8]
    snippet1_data = SnippetCreate(
        title=f"Python Snippet {unique_suffix}",
        description="Python snippet description",
        code="print('Hello, Python!')",
        language="python",
        category_id=test_category.id,
    )
    snippet2_data = SnippetCreate(
        title=f"JavaScript Snippet {unique_suffix}",
        description="JavaScript snippet description",
        code="console.log('Hello, JavaScript!');",
        language="javascript",
    )
    snippet1 = snippet_crud.create_snippet(db_session, snippet1_data)
    snippet2 = snippet_crud.create_snippet(db_session, snippet2_data)

    # Filter by language and our unique title
    python_snippets = snippet_crud.get_snippets(
        db_session, language="python", search=unique_suffix
    )
    assert len(python_snippets) == 1
    assert python_snippets[0].language == "python"
    assert python_snippets[0].id == snippet1.id

    # Filter by category and our unique title
    category_snippets = snippet_crud.get_snippets(
        db_session, category_id=test_category.id, search=unique_suffix
    )
    assert len(category_snippets) == 1
    assert category_snippets[0].category_id == test_category.id
    assert category_snippets[0].id == snippet1.id

    # Filter by title only
    search_snippets = snippet_crud.get_snippets(db_session, search="JavaScript")

    # Find our specific snippet in the results
    our_snippets = [s for s in search_snippets if s.id == snippet2.id]
    assert len(our_snippets) == 1


def test_update_snippet(db_session: Session, test_category, test_tags):
    """Test updating a snippet."""
    # Create a snippet
    snippet_data = SnippetCreate(
        title="Test Snippet",
        description="Test snippet description",
        code="print('Hello, World!')",
        language="python",
        category_id=test_category.id,
    )
    created_snippet = snippet_crud.create_snippet(db_session, snippet_data)

    # Update the snippet
    update_data = SnippetUpdate(
        title="Updated Snippet",
        description="Updated description",
        code="print('Updated!')",
        language="python",
        tags=[test_tags[0].name],
        is_favorite=True,
    )
    updated_snippet = snippet_crud.update_snippet(
        db_session, created_snippet.id, update_data
    )

    # Check the updated snippet
    assert updated_snippet.id == created_snippet.id
    assert updated_snippet.title == "Updated Snippet"
    assert updated_snippet.description == "Updated description"
    assert updated_snippet.code == "print('Updated!')"
    assert updated_snippet.is_favorite is True
    assert len(updated_snippet.tags) == 1
    assert updated_snippet.tags[0].name == test_tags[0].name


def test_delete_snippet(db_session: Session, test_category):
    """Test deleting a snippet (moving to recycle bin)."""
    # Create a snippet
    snippet_data = SnippetCreate(
        title="Test Snippet",
        description="Test snippet description",
        code="print('Hello, World!')",
        language="python",
        category_id=test_category.id,
    )
    created_snippet = snippet_crud.create_snippet(db_session, snippet_data)

    # Delete the snippet
    result = snippet_crud.delete_snippet(db_session, created_snippet.id)
    assert result is True

    # Check the snippet is marked as deleted
    snippet = snippet_crud.get_snippet(db_session, created_snippet.id)
    assert snippet.is_deleted is True

    # Check the snippet appears in the recycle bin
    recycle_bin_snippets = snippet_crud.get_recycle_bin_snippets(db_session)
    assert len(recycle_bin_snippets) == 1
    assert recycle_bin_snippets[0].id == created_snippet.id


def test_restore_snippet(db_session: Session, test_category):
    """Test restoring a snippet from the recycle bin."""
    # Create a snippet with unique title
    unique_suffix = str(uuid.uuid4())[:8]
    snippet_data = SnippetCreate(
        title=f"Test Restore Snippet {unique_suffix}",
        description="Test snippet description",
        code="print('Hello, World!')",
        language="python",
        category_id=test_category.id,
    )
    created_snippet = snippet_crud.create_snippet(db_session, snippet_data)

    # Delete the snippet
    snippet_crud.delete_snippet(db_session, created_snippet.id)

    # Restore the snippet
    restored_snippet = snippet_crud.restore_snippet(db_session, created_snippet.id)

    # Check the snippet is no longer marked as deleted
    assert restored_snippet.is_deleted is False

    # Check our specific snippet is no longer in the recycle bin
    recycle_bin_snippets = snippet_crud.get_recycle_bin_snippets(db_session)
    restored_snippets = [s for s in recycle_bin_snippets if s.id == created_snippet.id]
    assert len(restored_snippets) == 0


def test_permanently_delete_snippet(db_session: Session, test_category):
    """Test permanently deleting a snippet."""
    # Create a snippet
    snippet_data = SnippetCreate(
        title="Test Snippet",
        description="Test snippet description",
        code="print('Hello, World!')",
        language="python",
        category_id=test_category.id,
    )
    created_snippet = snippet_crud.create_snippet(db_session, snippet_data)

    # Permanently delete the snippet
    result = snippet_crud.permanently_delete_snippet(db_session, created_snippet.id)
    assert result is True

    # Check the snippet no longer exists
    with pytest.raises(NotFoundError):
        snippet_crud.get_snippet(db_session, created_snippet.id)


def test_toggle_favorite(db_session: Session, test_category):
    """Test toggling favorite status of a snippet."""
    # Create a snippet with unique title
    unique_suffix = str(uuid.uuid4())[:8]
    snippet_data = SnippetCreate(
        title=f"Test Favorite Snippet {unique_suffix}",
        description="Test snippet description",
        code="print('Hello, World!')",
        language="python",
        category_id=test_category.id,
    )
    created_snippet = snippet_crud.create_snippet(db_session, snippet_data)

    # Toggle favorite to True
    snippet = snippet_crud.toggle_favorite(db_session, created_snippet.id, True)
    assert snippet.is_favorite is True

    # Check our specific snippet appears in favorites
    favorite_snippets = snippet_crud.get_favorite_snippets(db_session)
    our_favorites = [s for s in favorite_snippets if s.id == created_snippet.id]
    assert len(our_favorites) == 1

    # Toggle favorite to False
    snippet = snippet_crud.toggle_favorite(db_session, created_snippet.id, False)
    assert snippet.is_favorite is False

    # Check our specific snippet no longer appears in favorites
    favorite_snippets = snippet_crud.get_favorite_snippets(db_session)
    our_favorites = [s for s in favorite_snippets if s.id == created_snippet.id]
    assert len(our_favorites) == 0


def test_batch_operation(db_session: Session, test_category):
    """Test batch operations on snippets."""
    # Create snippets with unique titles
    unique_suffix = str(uuid.uuid4())[:8]
    snippet1_data = SnippetCreate(
        title=f"Batch Snippet 1 {unique_suffix}",
        description="Snippet 1 description",
        code="print('Snippet 1')",
        language="python",
        category_id=test_category.id,
    )
    snippet2_data = SnippetCreate(
        title=f"Batch Snippet 2 {unique_suffix}",
        description="Snippet 2 description",
        code="print('Snippet 2')",
        language="python",
        category_id=test_category.id,
    )
    snippet1 = snippet_crud.create_snippet(db_session, snippet1_data)
    snippet2 = snippet_crud.create_snippet(db_session, snippet2_data)

    # Batch favorite
    result = snippet_crud.batch_operation(
        db_session, "favorite", [snippet1.id, snippet2.id]
    )
    assert result["success"] is True
    assert result["count"] == 2

    # Check our specific snippets are favorited
    favorite_snippets = snippet_crud.get_favorite_snippets(db_session)
    our_favorites = [s for s in favorite_snippets if s.id in [snippet1.id, snippet2.id]]
    assert len(our_favorites) == 2

    # Batch delete
    result = snippet_crud.batch_operation(
        db_session, "delete", [snippet1.id, snippet2.id]
    )
    assert result["success"] is True
    assert result["count"] == 2

    # Check our specific snippets are in recycle bin
    recycle_bin_snippets = snippet_crud.get_recycle_bin_snippets(db_session)
    our_deleted = [
        s for s in recycle_bin_snippets if s.id in [snippet1.id, snippet2.id]
    ]
    assert len(our_deleted) == 2
