# 代码片段管理器设计文档

## 1. 项目概述

### 1.1 项目目标

构建一个轻量级的个人代码片段管理器，帮助开发者高效地存储、分类、搜索和重用常用代码片段，提高开发效率。

### 1.2 技术栈

- **前端**：React + Next.js + Tailwind CSS + shadcn/ui
- **后端**：Python + FastAPI
- **数据库**：SQLite
- **部署**：可轻量级部署在个人服务器或云平台

## 2. 系统架构

### 2.1 整体架构

```
┌───────────────┐       ┌───────────────┐       ┌───────────────┐
│               │       │               │       │               │
│  React 前端   │◄─────►│  FastAPI 后端 │◄─────►│  SQLite 数据库 │
│               │       │               │       │               │
└───────────────┘       └───────────────┘       └───────────────┘
```

### 2.2 前端架构

采用基于组件的架构设计，主要分为以下几个部分：

1. **页面组件**：负责整体布局和页面路由
2. **容器组件**：管理状态和数据流
3. **UI组件**：负责具体的界面展示和交互
4. **自定义Hooks**：封装通用逻辑

### 2.3 后端架构

采用REST API架构，通过FastAPI实现轻量级高性能的API服务，主要包括：

1. **API路由层**：处理HTTP请求和响应
2. **业务逻辑层**：处理具体的业务逻辑
3. **数据访问层**：与数据库交互
4. **模型层**：定义数据模型和验证逻辑

## 3. 数据库设计

### 3.1 ER图

```
┌───────────┐     ┌───────────┐     ┌───────────┐
│  Snippets │     │   Tags    │     │Categories │
├───────────┤     ├───────────┤     ├───────────┤
│  id       │─┐   │  id       │     │  id       │
│  title    │ │   │  name     │     │  name     │
│  desc     │ │   └───────────┘     │  desc     │
│  code     │ │         ▲           └───────────┘
│  lang     │ │         │                 ▲
│  cat_id   │─┘   ┌───────────┐           │
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

### 3.2 数据表设计

#### 代码片段表 (snippets)

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | TEXT | 主键 |
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
| id | TEXT | 主键 |
| name | TEXT | 分类名称 |
| description | TEXT | 分类描述 |
| parent_id | TEXT | 外键，关联自身(支持层级分类) |
| created_at | TIMESTAMP | 创建时间 |

#### 标签表 (tags)

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | TEXT | 主键 |
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
| id | TEXT | 主键 |
| name | TEXT | 集合名称 |
| description | TEXT | 集合描述 |
| created_at | TIMESTAMP | 创建时间 |

#### 集合-片段关联表 (collection_snippets)

| 字段名 | 类型 | 说明 |
|--------|------|------|
| collection_id | TEXT | 外键，关联collections表 |
| snippet_id | TEXT | 外键，关联snippets表 |

### 3.3 索引设计

为提高查询效率，建立以下索引：

- snippets表的category_id字段
- snippets表的language字段和is_deleted字段的组合索引
- snippet_tags表的tag_id字段
- collection_snippets表的collection_id字段

## 4. 前端设计

### 4.1 界面布局

保留原设计的四区域布局：

1. **顶部菜单栏**：应用Logo、设置入口
2. **左侧导航栏**：分类、标签、集合等导航结构
3. **中部列表区**：片段列表和搜索功能
4. **右侧详情/编辑区**：查看和编辑片段内容

### 4.2 组件结构

```
App
├── Layout
│   ├── TopMenuBar
│   │   └── SettingsButton
│   ├── Sidebar
│   │   └── NavigationItem (递归组件)
│   ├── SnippetListWithSearch
│   │   ├── SearchBar
│   │   └── SnippetList
│   │       └── SnippetListItem
│   └── SnippetDetailEditArea
│       ├── SnippetDetailView
│       │   └── CodeBlock
│       └── SnippetForm
│           ├── CategoryDisplay
│           ├── TagInput
│           └── CodeEditor
├── Modal / Dialog 组件
└── Toast 通知组件
```

### 4.3 状态管理

使用Zustand进行状态管理，主要状态包括：

```typescript
interface AppState {
  // 数据状态
  snippets: Snippet[];
  categories: Category[];
  tags: Tag[];
  collections: Collection[];
  
  // UI状态
  currentView: 'all' | 'category' | 'tag' | 'collection' | 'favorites' | 'recycleBin';
  currentViewId?: string;  // 当前选中的分类/标签/集合ID
  searchQuery: string;
  selectedSnippetId?: string;
  editorMode: 'view' | 'edit' | 'create';
  sidebarExpanded: boolean;
  
  // 加载状态
  isLoading: boolean;
  error: string | null;
}
```

### 4.4 路由设计

基于Next.js的App Router：

```
app/
├── page.js                 # 主页面
├── snippets/
│   ├── [id]/page.js        # 单个片段详情/编辑页面
│   └── page.js             # 所有片段列表
├── categories/
│   ├── [id]/page.js        # 分类下的片段
│   └── page.js             # 分类管理
├── tags/
│   ├── [id]/page.js        # 标签下的片段
│   └── page.js             # 标签管理
├── collections/
│   ├── [id]/page.js        # 集合下的片段
│   └── page.js             # 集合管理
└── settings/
    └── page.js             # 设置页面
```

### 4.5 性能优化

1. **虚拟列表**：使用react-window处理大量片段的显示
2. **代码分割**：使用Next.js的动态导入功能
3. **数据预取与缓存**：使用SWR或React Query进行数据获取和缓存
4. **懒加载**：非首屏组件懒加载

## 5. 后端设计

### 5.1 API路由设计

保留原设计的API路由，并按RESTful原则组织：

#### 片段相关

- `GET /api/snippets` - 获取所有片段列表
- `GET /api/snippets/{snippet_id}` - 获取单个片段详情
- `POST /api/snippets` - 创建新片段
- `PUT /api/snippets/{snippet_id}` - 更新现有片段
- `DELETE /api/snippets/{snippet_id}` - 删除片段(移入回收站)
- `POST /api/snippets/{snippet_id}/restore` - 恢复回收站中的片段
- `DELETE /api/snippets/{snippet_id}/permanent` - 永久删除片段
- `POST /api/snippets/{snippet_id}/favorite` - 标记片段为收藏
- `DELETE /api/snippets/{snippet_id}/favorite` - 取消标记片段为收藏
- `GET /api/snippets/search?q={keyword}` - 搜索片段
- `GET /api/snippets/favorites` - 获取收藏的片段列表
- `GET /api/snippets/recycle-bin` - 获取回收站的片段列表

#### 分类相关

- `GET /api/categories` - 获取所有分类列表
- `GET /api/categories/{category_id}/snippets` - 获取特定分类下的片段
- `POST /api/categories` - 创建新分类
- `PUT /api/categories/{category_id}` - 更新分类
- `DELETE /api/categories/{category_id}` - 删除分类

#### 标签相关

- `GET /api/tags` - 获取所有标签列表
- `GET /api/tags/{tag_id}/snippets` - 获取包含特定标签的片段
- `POST /api/tags` - 创建新标签
- `PUT /api/tags/{tag_id}` - 更新标签
- `DELETE /api/tags/{tag_id}` - 删除标签

#### 集合相关

- `GET /api/collections` - 获取所有集合列表
- `GET /api/collections/{collection_id}/snippets` - 获取集合中的片段
- `POST /api/collections` - 创建新集合
- `PUT /api/collections/{collection_id}` - 更新集合
- `DELETE /api/collections/{collection_id}` - 删除集合
- `POST /api/collections/{collection_id}/snippets/{snippet_id}` - 将片段添加到集合
- `DELETE /api/collections/{collection_id}/snippets/{snippet_id}` - 从集合中移除片段

#### 批量操作API (新增)

- `POST /api/snippets/batch` - 批量操作片段(删除、收藏、标签等)

### 5.2 数据模型

使用Pydantic定义数据模型：

```python
# 基本模型示例
class SnippetBase(BaseModel):
    title: str
    description: Optional[str] = None
    code: str
    language: str
    category_id: Optional[str] = None
    
class SnippetCreate(SnippetBase):
    pass
    
class SnippetUpdate(SnippetBase):
    title: Optional[str] = None
    code: Optional[str] = None
    language: Optional[str] = None
    is_favorite: Optional[bool] = None
    
class Snippet(SnippetBase):
    id: str
    is_favorite: bool = False
    is_deleted: bool = False
    created_at: datetime
    updated_at: datetime
    tags: List[str] = []
    
    class Config:
        orm_mode = True
```

### 5.3 数据访问层

使用SQLAlchemy作为ORM：

```python
# 数据库模型示例
class SnippetModel(Base):
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
    
    category = relationship("CategoryModel", back_populates="snippets")
    tags = relationship("TagModel", secondary="snippet_tags", back_populates="snippets")
```

## 6. 功能增强与优化

### 6.1 用户体验增强

1. **代码编辑器增强**
   - 集成CodeMirror或Monaco Editor
   - 支持语法高亮、自动完成
   - 支持多种主题切换
   - 添加自动保存功能

2. **搜索功能增强**
   - 支持多条件组合搜索(标题、内容、语言等)
   - 实时搜索结果更新
   - 搜索结果高亮关键词

3. **离线支持**
   - 基于IndexedDB的离线存储
   - 添加PWA支持，可安装到桌面

### 6.2 性能优化

1. **数据加载优化**
   - 实现分页加载
   - 使用虚拟列表渲染大量数据

2. **缓存策略**
   - 前端状态缓存
   - API响应缓存

3. **代码分割与懒加载**
   - 路由级别代码分割
   - 组件懒加载

### 6.3 扩展功能

1. **导入/导出功能**
   - 支持JSON、Markdown格式导入导出
   - GitHub Gist集成

2. **代码片段版本历史**
   - 保存编辑历史
   - 版本比较功能

3. **快捷键支持**
   - 常用操作快捷键
   - 自定义快捷键

## 7. 安全性设计

### 7.1 数据安全

1. **输入验证**
   - 前端表单验证
   - 后端使用Pydantic进行数据验证

2. **SQL注入防护**
   - 使用ORM和参数化查询
   - 避免动态SQL构造

### 7.2 错误处理

1. **统一错误响应格式**
   ```json
   {
     "status": "error",
     "message": "错误信息描述",
     "details": {} // 可选，详细错误信息
   }
   ```

2. **错误日志记录**
   - 记录API错误
   - 实现错误追踪

## 8. 部署与维护

### 8.1 部署方案

**轻量级部署**
- 前端静态文件部署
- 后端FastAPI应用部署
- SQLite数据库文件存储

### 8.2 备份与恢复

1. **数据备份策略**
   - 定期备份SQLite数据库文件
   - 导出功能作为用户级备份

2. **应用更新**
   - 无缝更新策略
   - 数据迁移方案

## 9. 测试策略

### 9.1 前端测试

- 组件单元测试
- 交互功能测试
- 响应式布局测试

### 9.2 后端测试

- API端点测试
- 数据模型测试
- 业务逻辑测试

## 10. 项目路线图

### 10.1 核心功能 (MVP)

- 基本的代码片段CRUD操作
- 分类与标签管理
- 简单搜索功能

### 10.2 增强功能

- 收藏与回收站功能
- 高级搜索与过滤
- 代码编辑器增强

### 10.3 高级功能

- 导入/导出功能
- 片段版本历史
- 离线支持与PWA
- 数据统计与分析

## 结语

这份设计文档概述了代码片段管理器应用的主要架构和功能。设计注重轻量级和易用性，同时保留了扩展的可能性。实际开发过程中可根据需求优先级和资源情况灵活调整。
