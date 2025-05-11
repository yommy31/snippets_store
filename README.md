# 代码片段管理器 (Snippets Store)

## 项目概述

代码片段管理器是一个轻量级的个人代码片段存储和管理工具，帮助开发者高效地存储、分类、搜索和重用常用代码片段，提高开发效率。该项目包含完整的前后端实现，支持代码片段的创建、编辑、分类、标签、收藏、搜索等功能。

## 功能特点

- **代码片段管理**：创建、编辑、删除、恢复代码片段
- **分类系统**：支持层级分类结构，便于组织代码片段
- **标签系统**：通过标签灵活标记和筛选代码片段
- **收藏功能**：标记常用代码片段为收藏
- **回收站**：临时存储已删除的代码片段，支持恢复
- **集合功能**：创建代码片段集合，组织相关代码片段
- **搜索功能**：支持多条件搜索，快速找到需要的代码片段
- **语法高亮**：支持多种编程语言的语法高亮显示

## 技术栈

### 前端

- **框架**：React + Next.js
- **UI库**：Tailwind CSS + shadcn/ui
- **状态管理**：Zustand
- **数据获取**：SWR

### 后端

- **语言**：Python 3.12
- **Web框架**：FastAPI
- **ORM**：SQLAlchemy
- **数据验证**：Pydantic
- **数据库**：SQLite
- **包管理器**：uv

## 项目结构

```plain
snippets_store/
├── backend/                # 后端代码
│   ├── app/                # 应用主目录
│   │   ├── api/            # API路由层
│   │   ├── crud/           # 数据访问层
│   │   ├── models/         # 数据库模型
│   │   ├── schemas/        # Pydantic模型
│   │   └── utils/          # 工具函数
│   ├── tests/              # 测试目录
│   └── README.md           # 后端文档
├── frontend/               # 前端代码
│   ├── app/                # Next.js应用目录
│   ├── components/         # React组件
│   ├── lib/                # 工具函数和状态管理
│   └── public/             # 静态资源
├── design-doc.md           # 设计文档
└── README.md               # 项目总体文档
```

## 数据库设计

项目使用SQLite数据库，包含以下主要数据表：

- **snippets**：存储代码片段信息
- **categories**：存储分类信息
- **tags**：存储标签信息
- **snippet_tags**：片段-标签关联表
- **collections**：存储集合信息
- **collection_snippets**：集合-片段关联表

详细的数据库设计请参考[设计文档](design-doc.md)。

## API设计

后端提供RESTful API，主要包括以下几组端点：

- **/api/snippets**：代码片段相关操作
- **/api/categories**：分类相关操作
- **/api/tags**：标签相关操作
- **/api/collections**：集合相关操作

详细的API规范请参考[API规范文档](backend-api-specification.md)。

## 前端界面

前端界面采用四区域布局：

1. **顶部菜单栏**：应用Logo、设置入口
2. **左侧导航栏**：分类、标签、集合等导航结构
3. **中部列表区**：片段列表和搜索功能
4. **右侧详情/编辑区**：查看和编辑片段内容

## 运行项目

### 后端

```bash
# 进入后端目录
cd backend

# 安装依赖
uv sync

# 初始化数据库
uv run python seed_db.py

# 运行服务器
uv run python run.py
```

后端服务器将在 http://localhost:8000 上运行。API文档可在 http://localhost:8000/docs 查看。

### 前端

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 运行开发服务器
npm run dev
```

前端开发服务器将在 http://localhost:3000 上运行。

## 部署

项目设计为轻量级应用，可以部署在个人服务器或云平台上。

### 后端部署

可以使用Uvicorn或Gunicorn作为ASGI服务器部署FastAPI应用。

### 前端部署

可以使用Next.js的静态导出功能生成静态文件，部署在任何静态文件服务器上。

## 未来计划

- **离线支持**：基于IndexedDB的离线存储
- **PWA支持**：可安装到桌面
- **导入/导出功能**：支持JSON、Markdown格式导入导出
- **GitHub Gist集成**：与GitHub Gist同步
- **代码片段版本历史**：保存编辑历史，支持版本比较
- **快捷键支持**：常用操作快捷键，支持自定义

## 贡献

欢迎贡献代码、报告问题或提出改进建议。

## 许可证

MIT