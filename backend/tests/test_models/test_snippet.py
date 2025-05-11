"""
Tests for the Snippet model.
"""

import uuid
from sqlalchemy.orm import Session

from app.models import Snippet, Category, Tag, Collection


def test_create_snippet(db_session: Session):
    """Test creating a snippet."""
    # Create a category
    category_id = str(uuid.uuid4())
    category = Category(
        id=category_id,
        name="Test Category",
        description="Test category description",
    )
    db_session.add(category)
    db_session.commit()

    # Create a snippet
    snippet_id = str(uuid.uuid4())
    snippet = Snippet(
        id=snippet_id,
        title="Test Snippet",
        description="Test snippet description",
        code="print('Hello, World!')",
        language="python",
        category_id=category.id,
        is_favorite=True,
    )
    db_session.add(snippet)
    db_session.commit()

    # Retrieve the snippet
    db_snippet = db_session.query(Snippet).filter(Snippet.id == snippet_id).first()

    # Check the snippet
    assert db_snippet is not None
    assert db_snippet.id == snippet_id
    assert db_snippet.title == "Test Snippet"
    assert db_snippet.description == "Test snippet description"
    assert db_snippet.code == "print('Hello, World!')"
    assert db_snippet.language == "python"
    assert db_snippet.category_id == category.id
    assert db_snippet.is_favorite is True
    assert db_snippet.is_deleted is False
    assert db_snippet.created_at is not None
    assert db_snippet.updated_at is not None


def test_snippet_category_relationship(db_session: Session):
    """Test snippet-category relationship."""
    # Create a category
    category_id = str(uuid.uuid4())
    category = Category(
        id=category_id,
        name="Test Category",
        description="Test category description",
    )
    db_session.add(category)
    db_session.commit()

    # Create a snippet
    snippet_id = str(uuid.uuid4())
    snippet = Snippet(
        id=snippet_id,
        title="Test Snippet",
        description="Test snippet description",
        code="print('Hello, World!')",
        language="python",
        category_id=category.id,
    )
    db_session.add(snippet)
    db_session.commit()

    # Check the relationship
    assert snippet.category is not None
    assert snippet.category.id == category.id
    assert snippet.category.name == "Test Category"
    assert snippet in category.snippets


def test_snippet_tag_relationship(db_session: Session):
    """Test snippet-tag relationship."""
    # Create a snippet
    snippet_id = str(uuid.uuid4())
    snippet = Snippet(
        id=snippet_id,
        title="Test Snippet",
        description="Test snippet description",
        code="print('Hello, World!')",
        language="python",
    )
    db_session.add(snippet)

    # Create tags
    tag1_id = str(uuid.uuid4())
    tag2_id = str(uuid.uuid4())
    tag1 = Tag(id=tag1_id, name="Tag 1")
    tag2 = Tag(id=tag2_id, name="Tag 2")
    db_session.add_all([tag1, tag2])
    db_session.commit()

    # Add tags to snippet
    snippet.tags.append(tag1)
    snippet.tags.append(tag2)
    db_session.commit()

    # Check the relationship
    assert len(snippet.tags) == 2
    assert tag1 in snippet.tags
    assert tag2 in snippet.tags
    assert snippet in tag1.snippets
    assert snippet in tag2.snippets


def test_snippet_collection_relationship(db_session: Session):
    """Test snippet-collection relationship."""
    # Create a snippet
    snippet_id = str(uuid.uuid4())
    snippet = Snippet(
        id=snippet_id,
        title="Test Snippet",
        description="Test snippet description",
        code="print('Hello, World!')",
        language="python",
    )
    db_session.add(snippet)

    # Create collections
    collection1_id = str(uuid.uuid4())
    collection2_id = str(uuid.uuid4())
    collection1 = Collection(
        id=collection1_id,
        name="Collection 1",
        description="Test collection 1",
    )
    collection2 = Collection(
        id=collection2_id,
        name="Collection 2",
        description="Test collection 2",
    )
    db_session.add_all([collection1, collection2])
    db_session.commit()

    # Add snippet to collections
    collection1.snippets.append(snippet)
    collection2.snippets.append(snippet)
    db_session.commit()

    # Check the relationship
    assert len(snippet.collections) == 2
    assert collection1 in snippet.collections
    assert collection2 in snippet.collections
    assert snippet in collection1.snippets
    assert snippet in collection2.snippets
