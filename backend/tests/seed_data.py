"""
Script to populate the database with initial test data.
"""

import uuid

from sqlalchemy.orm import Session

from app.models import Snippet, Category, Tag, Collection
from app.database import SessionLocal


def seed_categories(db: Session):
    """Seed categories."""
    categories = [
        Category(
            id=str(uuid.uuid4()),
            name="JavaScript",
            description="JavaScript code snippets",
        ),
        Category(
            id=str(uuid.uuid4()),
            name="Python",
            description="Python code snippets",
        ),
        Category(
            id=str(uuid.uuid4()),
            name="SQL",
            description="SQL queries",
        ),
        Category(
            id=str(uuid.uuid4()),
            name="HTML/CSS",
            description="HTML and CSS snippets",
        ),
        Category(
            id=str(uuid.uuid4()),
            name="Bash",
            description="Bash scripts",
        ),
    ]

    # Add subcategories
    js_frameworks = Category(
        id=str(uuid.uuid4()),
        name="JS Frameworks",
        description="JavaScript frameworks",
        parent_id=categories[0].id,
    )
    py_frameworks = Category(
        id=str(uuid.uuid4()),
        name="Python Frameworks",
        description="Python frameworks",
        parent_id=categories[1].id,
    )

    categories.extend([js_frameworks, py_frameworks])

    for category in categories:
        db.add(category)

    db.commit()
    return categories


def seed_tags(db: Session):
    """Seed tags."""
    tags = [
        Tag(id=str(uuid.uuid4()), name="algorithm"),
        Tag(id=str(uuid.uuid4()), name="utility"),
        Tag(id=str(uuid.uuid4()), name="frontend"),
        Tag(id=str(uuid.uuid4()), name="backend"),
        Tag(id=str(uuid.uuid4()), name="database"),
        Tag(id=str(uuid.uuid4()), name="api"),
        Tag(id=str(uuid.uuid4()), name="optimization"),
        Tag(id=str(uuid.uuid4()), name="security"),
    ]

    for tag in tags:
        db.add(tag)

    db.commit()
    return tags


def seed_collections(db: Session):
    """Seed collections."""
    collections = [
        Collection(
            id=str(uuid.uuid4()),
            name="Favorite Algorithms",
            description="Collection of my favorite algorithms",
        ),
        Collection(
            id=str(uuid.uuid4()),
            name="API Utilities",
            description="Useful utilities for API development",
        ),
        Collection(
            id=str(uuid.uuid4()),
            name="Database Queries",
            description="Common database queries",
        ),
    ]

    for collection in collections:
        db.add(collection)

    db.commit()
    return collections


def seed_snippets(db: Session, categories, tags, collections):
    """Seed snippets."""
    # JavaScript snippet
    js_snippet = Snippet(
        id=str(uuid.uuid4()),
        title="Debounce Function",
        description="A debounce function to limit the rate at which a function can fire",
        code="""
function debounce(func, wait, immediate) {
  let timeout;
  return function() {
    const context = this, args = arguments;
    const later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}
        """,
        language="javascript",
        category_id=categories[0].id,
        is_favorite=True,
    )
    js_snippet.tags.extend([tags[1], tags[2]])
    js_snippet.collections.append(collections[1])

    # Python snippet
    py_snippet = Snippet(
        id=str(uuid.uuid4()),
        title="Merge Sort",
        description="Implementation of merge sort algorithm in Python",
        code="""
def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    
    return merge(left, right)

def merge(left, right):
    result = []
    i = j = 0
    
    while i < len(left) and j < len(right):
        if left[i] < right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    
    result.extend(left[i:])
    result.extend(right[j:])
    return result
        """,
        language="python",
        category_id=categories[1].id,
        is_favorite=True,
    )
    py_snippet.tags.extend([tags[0], tags[6]])
    py_snippet.collections.append(collections[0])

    # SQL snippet
    sql_snippet = Snippet(
        id=str(uuid.uuid4()),
        title="Common Table Expression",
        description="Example of using a CTE in SQL",
        code="""
WITH ranked_products AS (
    SELECT 
        product_id,
        product_name,
        category_id,
        price,
        ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY price DESC) as price_rank
    FROM products
)
SELECT 
    product_id,
    product_name,
    category_id,
    price
FROM ranked_products
WHERE price_rank <= 3;
        """,
        language="sql",
        category_id=categories[2].id,
    )
    sql_snippet.tags.extend([tags[4], tags[6]])
    sql_snippet.collections.append(collections[2])

    # HTML/CSS snippet
    html_snippet = Snippet(
        id=str(uuid.uuid4()),
        title="Responsive Grid Layout",
        description="CSS Grid layout with responsive breakpoints",
        code="""
.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  grid-gap: 20px;
  padding: 20px;
}

.grid-item {
  background-color: #f1f1f1;
  border-radius: 5px;
  padding: 20px;
  font-size: 150%;
}

@media (max-width: 600px) {
  .grid-container {
    grid-template-columns: 1fr;
  }
}
        """,
        language="css",
        category_id=categories[3].id,
    )
    html_snippet.tags.extend([tags[2], tags[6]])

    # Bash snippet
    bash_snippet = Snippet(
        id=str(uuid.uuid4()),
        title="Find and Replace in Files",
        description="Bash script to find and replace text in multiple files",
        code="""
#!/bin/bash

# Find and replace text in files
# Usage: ./find_replace.sh "search_text" "replace_text" "file_pattern"

if [ $# -ne 3 ]; then
    echo "Usage: $0 search_text replace_text file_pattern"
    exit 1
fi

SEARCH="$1"
REPLACE="$2"
PATTERN="$3"

echo "Replacing '$SEARCH' with '$REPLACE' in files matching '$PATTERN'"

find . -type f -name "$PATTERN" -exec grep -l "$SEARCH" {} \\; | xargs sed -i "s/$SEARCH/$REPLACE/g"

echo "Done!"
        """,
        language="bash",
        category_id=categories[4].id,
    )
    bash_snippet.tags.extend([tags[1], tags[7]])
    bash_snippet.collections.append(collections[1])

    snippets = [js_snippet, py_snippet, sql_snippet, html_snippet, bash_snippet]

    for snippet in snippets:
        db.add(snippet)

    db.commit()
    return snippets


def seed_database():
    """Seed the database with initial data."""
    db = SessionLocal()
    try:
        # Check if data already exists
        existing_categories = db.query(Category).count()
        if existing_categories > 0:
            print("Database already contains data. Skipping seeding.")
            return

        print("Seeding database...")
        categories = seed_categories(db)
        tags = seed_tags(db)
        collections = seed_collections(db)
        snippets = seed_snippets(db, categories, tags, collections)
        print(
            f"Seeded {len(categories)} categories, {len(tags)} tags, {len(collections)} collections, and {len(snippets)} snippets."
        )
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
