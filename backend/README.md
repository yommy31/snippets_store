# 代码片段管理器后端文档

## 项目概述

代码片段管理器是一个轻量级的个人代码片段存储和管理工具，帮助开发者高效地存储、分类、搜索和重用常用代码片段，提高开发效率。本文档详细介绍了后端的实现细节。

## 技术栈

- **语言**: Python 3.12
- **Web框架**: FastAPI
- **ORM**: SQLAlchemy
- **数据验证**: Pydantic
- **数据库**: SQLite
- **包管理器**: uv

## 项目结构

```
backend/
├── app/                    # 应用主目录
│   ├── api/                # API路由层
│   │   ├── endpoints/      # API端点
│   │   └── api.py          # API路由注册
│   ├── crud/               # 数据访问层
│   ├── models/             # 数据库模型
│   ├── schemas/            # Pydantic模型
│   ├── utils/              # 工具函数
│   ├── config.py           # 配置文件
│   ├── database.py         # 数据库连接
│   └── main.py             # 应用入口
├── tests/                  # 测试目录
│   ├── test_api/           # API测试
│   ├── test_crud/          # CRUD操作测试
│   ├── test_models/        # 数据库模型测试
│   ├── conftest.py         # 测试配置
│   ├── run_tests.py        # 测试运行脚本
│   └── seed_data.py        # 测试数据生成
├── pyproject.toml          # 项目依赖配置
├── run.py                  # 应用启动脚本
└── seed_db.py              # 数据库初始化脚本
```

## 数据库设计

### 数据表结构

#### 代码片段表 (snippets)

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | TEXT | 主键，UUID |
| title | TEXT | 标题 |
| description | TEXT | 描述 |
| code | TEXT | 代码内容 |
| language | TEXT | 编程语言 |
| category_id | TEXT | 外键，关联categories表 |
| is_favorite | BOOLEAN | 是否收藏 |
| is_deleted | BOOLEAN | 是否已删除(回收站) |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

#### 分类表 (categories)

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | TEXT | 主键，UUID |
| name | TEXT | 分类名称 |
| description | TEXT | 分类描述 |
| parent_id | TEXT | 外键，关联自身(支持层级分类) |
| created_at | TIMESTAMP | 创建时间 |

#### 标签表 (tags)

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | TEXT | 主键，UUID |
| name | TEXT | 标签名称 |
| created_at | TIMESTAMP | 创建时间 |

#### 片段-标签关联表 (snippet_tags)

| 字段名 | 类型 | 说明 |
|--------|------|------|
| snippet_id | TEXT | 外键，关联snippets表 |
| tag_id | TEXT | 外键，关联tags表 |

#### 集合表 (collections)

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | TEXT | 主键，UUID |
| name | TEXT | 集合名称 |
| description | TEXT | 集合描述 |
| created_at | TIMESTAMP | 创建时间 |

#### 集合-片段关联表 (collection_snippets)

| 字段名 | 类型 | 说明 |
|--------|------|------|
| collection_id | TEXT | 外键，关联collections表 |
| snippet_id | TEXT | 外键，关联snippets表 |

### 关系图

```plain
┌───────────┐     ┌───────────┐     ┌───────────┐
│  Snippets │     │   Tags    │     │Categories │
├───────────┤     ├───────────┤     ├───────────┤
│  id       │─┐   │  id       │     │  id       │
│  title    │ │   │  name     │     │  name     │
│  desc     │ │   └───────────┘     │  desc     │
│  code     │ │         ▲           │  parent_id│
│  lang     │ │         │           └───────────┘
│  cat_id   │─┘   ┌───────────┐           ▲
│  favorite │◄────┤Snippet_Tags│           │
│  deleted  │     ├───────────┤           │
└───────────┘     │snippet_id │           │
      ▲           │tag_id     │           │
      │           └───────────┘           │
      │                                   │
      │           ┌───────────┐           │
      │           │Collections│           │
      │           ├───────────┤           │
      │           │  id       │           │
      │           │  name     │           │
      │           │  desc     │           │
      │           └───────────┘           │
      │                 ▲                 │
      │                 │                 │
      │           ┌───────────┐           │
      └───────────┤Coll_Snippets│         │
                  ├───────────┤           │
                  │coll_id    │           │
                  │snippet_id │           │
                  └───────────┘           │
```

## API设计

### 基础URL

所有API端点都以 `/api` 为前缀。

### 片段相关API

#### 获取所有片段

```
GET /api/snippets
```

查询参数:
- `deleted`: 是否已删除 (布尔值)
- `favorite`: 是否收藏 (布尔值)
- `search`: 搜索关键词
- `language`: 编程语言
- `category_id`: 分类ID
- `tag`: 标签名称
- `skip`: 跳过记录数
- `limit`: 返回记录数上限

#### 获取单个片段

```
GET /api/snippets/{snippet_id}
```

#### 创建新片段

```
POST /api/snippets
```

请求体:
```json
{
  "title": "片段标题",
  "description": "片段描述",
  "code": "代码内容",
  "language": "编程语言",
  "category_id": "分类ID",
  "tags": ["标签1", "标签2"]
}
```

#### 更新片段

```
PUT /api/snippets/{snippet_id}
```

请求体:
```json
{
  "title": "更新的标题",
  "description": "更新的描述",
  "code": "更新的代码",
  "language": "更新的语言",
  "category_id": "更新的分类ID",
  "tags": ["更新的标签1", "更新的标签2"],
  "is_favorite": true
}
```

#### 删除片段(移入回收站)

```
DELETE /api/snippets/{snippet_id}
```

#### 恢复回收站中的片段

```
POST /api/snippets/{snippet_id}/restore
```

#### 永久删除片段

```
DELETE /api/snippets/{snippet_id}/permanent
```

#### 标记/取消标记片段为收藏

```
POST /api/snippets/{snippet_id}/favorite
```

查询参数:
- `is_favorite`: 收藏状态 (布尔值)

#### 搜索片段

```
GET /api/snippets/search
```

查询参数:
- `q`: 搜索关键词
- 其他过滤参数同 `GET /api/snippets`

#### 获取收藏的片段

```
GET /api/snippets/favorites
```

#### 获取回收站的片段

```
GET /api/snippets/recycle-bin
```

#### 批量操作片段

```
POST /api/snippets/batch
```

请求体:
```json
{
  "operation": "delete|restore|favorite|unfavorite|permanent-delete",
  "snippetIds": ["id1", "id2", "id3"]
}
```

### 分类相关API

#### 获取所有分类

```
GET /api/categories
```

#### 获取单个分类

```
GET /api/categories/{category_id}
```

#### 获取特定分类下的片段

```
GET /api/categories/{category_id}/snippets
```

#### 创建新分类

```
POST /api/categories
```

#### 更新分类

```
PUT /api/categories/{category_id}
```

#### 删除分类

```
DELETE /api/categories/{category_id}
```

### 标签相关API

#### 获取所有标签

```
GET /api/tags
```

#### 获取单个标签

```
GET /api/tags/{tag_id}
```

#### 获取包含特定标签的片段

```
GET /api/tags/{tag_id}/snippets
```

#### 创建新标签

```
POST /api/tags
```

#### 更新标签

```
PUT /api/tags/{tag_id}
```

#### 删除标签

```
DELETE /api/tags/{tag_id}
```

### 集合相关API

#### 获取所有集合

```
GET /api/collections
```

#### 获取单个集合

```
GET /api/collections/{collection_id}
```

#### 获取集合中的片段

```
GET /api/collections/{collection_id}/snippets
```

#### 创建新集合

```
POST /api/collections
```

#### 更新集合

```
PUT /api/collections/{collection_id}
```

#### 删除集合

```
DELETE /api/collections/{collection_id}
```

#### 将片段添加到集合

```
POST /api/collections/{collection_id}/snippets/{snippet_id}
```

#### 从集合中移除片段

```
DELETE /api/collections/{collection_id}/snippets/{snippet_id}
```

## 代码实现细节

### 数据库模型

数据库模型使用SQLAlchemy ORM定义，位于`app/models/`目录下。每个模型对应一个数据库表，并定义了表之间的关系。

例如，片段模型(`snippet.py`)定义了代码片段的结构和与其他表的关系：

```python
class Snippet(Base):
    __tablename__ = "snippets"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    code = Column(String, nullable=False)
    language = Column(String, nullable=False)
    category_id = Column(String, ForeignKey("categories.id"), nullable=True)
    is_favorite = Column(Boolean, default=False)
    is_deleted = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    category = relationship("Category", back_populates="snippets")
    tags = relationship("Tag", secondary="snippet_tags", back_populates="snippets")
    collections = relationship("Collection", secondary="collection_snippets", back_populates="snippets")
```

### 数据验证

数据验证使用Pydantic模型，位于`app/schemas/`目录下。这些模型用于验证API请求和响应的数据格式。

例如，片段模式(`snippet.py`)定义了创建和更新片段的数据格式：

```python
class SnippetCreate(SnippetBase):
    """Schema for creating a snippet."""
    
    tags: List[str] = []

class SnippetUpdate(BaseModel):
    """Schema for updating a snippet."""
    
    title: Optional[str] = None
    description: Optional[str] = None
    code: Optional[str] = None
    language: Optional[str] = None
    category_id: Optional[str] = None
    tags: Optional[List[str]] = None
    is_favorite: Optional[bool] = None
```

### 数据访问层

数据访问层位于`app/crud/`目录下，包含了对数据库的CRUD操作。每个文件对应一个数据库表的操作。

例如，片段CRUD操作(`snippet.py`)包含了对片段的增删改查操作：

```python
def create_snippet(db: Session, snippet_data: SnippetCreate) -> Snippet:
    """Create a new snippet."""
    snippet_id = str(uuid.uuid4())
    snippet = Snippet(
        id=snippet_id,
        title=snippet_data.title,
        description=snippet_data.description,
        code=snippet_data.code,
        language=snippet_data.language,
        category_id=snippet_data.category_id,
    )
    
    # Add tags
    for tag_name in snippet_data.tags:
        tag = get_or_create_tag(db, tag_name)
        snippet.tags.append(tag)
    
    db.add(snippet)
    db.commit()
    db.refresh(snippet)
    return snippet
```

### API路由

API路由位于`app/api/endpoints/`目录下，定义了API端点的处理逻辑。每个文件对应一组相关的API端点。

例如，片段API端点(`snippets.py`)定义了对片段的API操作：

```python
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
```

### 错误处理

错误处理位于`app/utils/error_handling.py`，定义了自定义异常和错误响应格式。

```python
class NotFoundError(Exception):
    """Exception raised when a resource is not found."""
    pass

class ConflictError(Exception):
    """Exception raised when there is a conflict."""
    pass

def format_error_response(status_code: int, message: str, details: Optional[Dict] = None) -> Dict:
    """Format error response."""
    return {
        "status": "error",
        "message": message,
        "details": details,
    }
```

## 测试

测试位于`tests/`目录下，包含了对数据库模型、CRUD操作和API端点的测试。

### 模型测试

模型测试位于`tests/test_models/`目录下，测试数据库模型的创建和关系。

### CRUD测试

CRUD测试位于`tests/test_crud/`目录下，测试数据访问层的CRUD操作。

### API测试

API测试位于`tests/test_api/`目录下，测试API端点的请求和响应。

## 运行项目

### 安装依赖

```bash
cd backend
uv sync
```

### 初始化数据库

```bash
uv run python seed_db.py
```

### 运行服务器

```bash
uv run python run.py
```

服务器将在 http://localhost:8000 上运行。API文档可在 http://localhost:8000/docs 查看。

## 结语

代码片段管理器后端采用了现代Python Web开发技术栈，实现了完整的代码片段管理功能。通过FastAPI提供高性能的API服务，SQLAlchemy实现数据库操作，Pydantic进行数据验证，为前端提供了强大的后端支持。