# Backend API Specification for Code Snippet Manager

This document outlines the API endpoints and functionality required by the frontend implementation of the Code Snippet Manager. The backend should be implemented using Python and FastAPI as specified in the design document.

## Base URL

All API endpoints should be prefixed with `/api`.

## Authentication

Authentication is not required for this version of the application as it's designed for personal use.

## Data Models

### Snippet

```typescript
interface Snippet {
  id: string;                  // UUID
  title: string;               // Snippet title
  description?: string;        // Optional description
  code: string;                // Code content
  language: string;            // Programming language
  categoryId?: string;         // Optional reference to category
  tags: string[];              // Array of tag names
  isFavorite: boolean;         // Whether snippet is favorited
  isDeleted: boolean;          // Whether snippet is in recycle bin
  createdAt: string;           // ISO date string
  updatedAt: string;           // ISO date string
}
```

### Category

```typescript
interface Category {
  id: string;                  // UUID
  name: string;                // Category name
  description?: string;        // Optional description
  parentId?: string;           // Optional reference to parent category (for hierarchical categories)
  createdAt: string;           // ISO date string
}
```

### Tag

```typescript
interface Tag {
  id: string;                  // UUID
  name: string;                // Tag name
  createdAt: string;           // ISO date string
}
```

### Collection

```typescript
interface Collection {
  id: string;                  // UUID
  name: string;                // Collection name
  description?: string;        // Optional description
  createdAt: string;           // ISO date string
}
```

## API Endpoints

### Snippet Endpoints

#### Get All Snippets

```
GET /api/snippets
```

Query Parameters:
- `deleted` (optional): Boolean to filter deleted snippets (true = show only deleted, false = exclude deleted)
- `favorite` (optional): Boolean to filter favorite snippets
- `search` (optional): String to search in title, description, and code
- `language` (optional): Filter by programming language
- `categoryId` (optional): Filter by category ID
- `tag` (optional): Filter by tag name

Response:
```json
{
  "snippets": Snippet[]
}
```

#### Get Snippet by ID

```
GET /api/snippets/{snippet_id}
```

Response:
```json
{
  "snippet": Snippet
}
```

#### Create Snippet

```
POST /api/snippets
```

Request Body:
```json
{
  "title": string,
  "description": string (optional),
  "code": string,
  "language": string,
  "categoryId": string (optional),
  "tags": string[]
}
```

Response:
```json
{
  "snippet": Snippet
}
```

#### Update Snippet

```
PUT /api/snippets/{snippet_id}
```

Request Body:
```json
{
  "title": string (optional),
  "description": string (optional),
  "code": string (optional),
  "language": string (optional),
  "categoryId": string (optional),
  "tags": string[] (optional)
}
```

Response:
```json
{
  "snippet": Snippet
}
```

#### Delete Snippet (Move to Recycle Bin)

```
DELETE /api/snippets/{snippet_id}
```

Response:
```json
{
  "success": true
}
```

#### Restore Snippet from Recycle Bin

```
POST /api/snippets/{snippet_id}/restore
```

Response:
```json
{
  "snippet": Snippet
}
```

#### Permanently Delete Snippet

```
DELETE /api/snippets/{snippet_id}/permanent
```

Response:
```json
{
  "success": true
}
```

#### Toggle Favorite Status

```
POST /api/snippets/{snippet_id}/favorite
```

Request Body:
```json
{
  "isFavorite": boolean
}
```

Response:
```json
{
  "snippet": Snippet
}
```

#### Search Snippets

```
GET /api/snippets/search
```

Query Parameters:
- `q`: Search query string
- `deleted` (optional): Boolean to include deleted snippets
- `favorite` (optional): Boolean to filter favorite snippets
- `language` (optional): Filter by programming language
- `categoryId` (optional): Filter by category ID
- `tag` (optional): Filter by tag name

Response:
```json
{
  "snippets": Snippet[]
}
```

#### Get Favorite Snippets

```
GET /api/snippets/favorites
```

Response:
```json
{
  "snippets": Snippet[]
}
```

#### Get Recycle Bin Snippets

```
GET /api/snippets/recycle-bin
```

Response:
```json
{
  "snippets": Snippet[]
}
```

#### Batch Operations

```
POST /api/snippets/batch
```

Request Body:
```json
{
  "operation": "delete" | "restore" | "favorite" | "unfavorite" | "permanent-delete",
  "snippetIds": string[]
}
```

Response:
```json
{
  "success": true,
  "count": number
}
```

### Category Endpoints

#### Get All Categories

```
GET /api/categories
```

Response:
```json
{
  "categories": Category[]
}
```

#### Get Category by ID

```
GET /api/categories/{category_id}
```

Response:
```json
{
  "category": Category
}
```

#### Get Snippets by Category

```
GET /api/categories/{category_id}/snippets
```

Response:
```json
{
  "snippets": Snippet[]
}
```

#### Create Category

```
POST /api/categories
```

Request Body:
```json
{
  "name": string,
  "description": string (optional),
  "parentId": string (optional)
}
```

Response:
```json
{
  "category": Category
}
```

#### Update Category

```
PUT /api/categories/{category_id}
```

Request Body:
```json
{
  "name": string (optional),
  "description": string (optional),
  "parentId": string (optional)
}
```

Response:
```json
{
  "category": Category
}
```

#### Delete Category

```
DELETE /api/categories/{category_id}
```

Response:
```json
{
  "success": true
}
```

### Tag Endpoints

#### Get All Tags

```
GET /api/tags
```

Response:
```json
{
  "tags": Tag[]
}
```

#### Get Tag by ID

```
GET /api/tags/{tag_id}
```

Response:
```json
{
  "tag": Tag
}
```

#### Get Snippets by Tag

```
GET /api/tags/{tag_id}/snippets
```

Response:
```json
{
  "snippets": Snippet[]
}
```

#### Create Tag

```
POST /api/tags
```

Request Body:
```json
{
  "name": string
}
```

Response:
```json
{
  "tag": Tag
}
```

#### Update Tag

```
PUT /api/tags/{tag_id}
```

Request Body:
```json
{
  "name": string
}
```

Response:
```json
{
  "tag": Tag
}
```

#### Delete Tag

```
DELETE /api/tags/{tag_id}
```

Response:
```json
{
  "success": true
}
```

### Collection Endpoints

#### Get All Collections

```
GET /api/collections
```

Response:
```json
{
  "collections": Collection[]
}
```

#### Get Collection by ID

```
GET /api/collections/{collection_id}
```

Response:
```json
{
  "collection": Collection
}
```

#### Get Snippets in Collection

```
GET /api/collections/{collection_id}/snippets
```

Response:
```json
{
  "snippets": Snippet[]
}
```

#### Create Collection

```
POST /api/collections
```

Request Body:
```json
{
  "name": string,
  "description": string (optional)
}
```

Response:
```json
{
  "collection": Collection
}
```

#### Update Collection

```
PUT /api/collections/{collection_id}
```

Request Body:
```json
{
  "name": string (optional),
  "description": string (optional)
}
```

Response:
```json
{
  "collection": Collection
}
```

#### Delete Collection

```
DELETE /api/collections/{collection_id}
```

Response:
```json
{
  "success": true
}
```

#### Add Snippet to Collection

```
POST /api/collections/{collection_id}/snippets/{snippet_id}
```

Response:
```json
{
  "success": true
}
```

#### Remove Snippet from Collection

```
DELETE /api/collections/{collection_id}/snippets/{snippet_id}
```

Response:
```json
{
  "success": true
}
```

## Error Handling

All API endpoints should return appropriate HTTP status codes:

- 200: Success
- 201: Created
- 400: Bad Request (invalid input)
- 404: Not Found (resource doesn't exist)
- 500: Internal Server Error

Error responses should follow this format:

```json
{
  "status": "error",
  "message": "Error message description",
  "details": {} // Optional additional error details
}
```

## Database Schema

The backend should implement the database schema as described in the design document, with the following tables:

1. `snippets` - Store code snippets
2. `categories` - Store snippet categories
3. `tags` - Store tag names
4. `snippet_tags` - Junction table for snippet-tag relationships
5. `collections` - Store collections
6. `collection_snippets` - Junction table for collection-snippet relationships

## Implementation Notes

1. Use SQLAlchemy as the ORM for database operations
2. Use Pydantic for data validation and serialization
3. Implement proper error handling and logging
4. Add appropriate indexes for performance optimization
5. Implement database migrations for schema changes
6. Use UUID for all IDs
7. Store timestamps in UTC format

This API specification covers all the functionality required by the frontend implementation of the Code Snippet Manager. The backend should implement these endpoints to ensure seamless integration with the frontend.