# Product Context

This file provides a high-level overview of the project and the expected product that will be created. Initially it is based upon projectBrief.md (if provided) and all other available project-related information in the working directory. This file is intended to be updated as the project evolves, and should be used to inform all other modes of the project's goals and context.
2025-05-14 21:56:00 - Log of updates made will be appended as footnotes to the end of this file.

*

## Project Goal

* 构建一个轻量级的个人代码片段管理器，帮助开发者高效地存储、分类、搜索和重用常用代码片段，提高开发效率。

## Key Features

* **代码片段管理**：创建、编辑、删除、恢复代码片段
* **分类系统**：支持层级分类结构，便于组织代码片段
* **标签系统**：通过标签灵活标记和筛选代码片段
* **收藏功能**：标记常用代码片段为收藏
* **回收站**：临时存储已删除的代码片段，支持恢复
* **集合功能**：创建代码片段集合，组织相关代码片段
* **搜索功能**：支持多条件搜索，快速找到需要的代码片段
* **语法高亮**：支持多种编程语言的语法高亮显示

## Overall Architecture

* **前端**：React + Next.js + Tailwind CSS + shadcn/ui
* **后端**：Python + FastAPI
* **数据库**：SQLite
* **部署**：可轻量级部署在个人服务器或云平台

### 系统架构
```
┌───────────────┐       ┌───────────────┐       ┌───────────────┐
│               │       │               │       │               │
│  React 前端   │◄─────►│  FastAPI 后端 │◄─────►│  SQLite 数据库 │
│               │       │               │       │               │
└───────────────┘       └───────────────┘       └───────────────┘
```

### 数据模型
项目使用SQLite数据库，包含以下主要数据表：
- snippets：存储代码片段信息
- categories：存储分类信息
- tags：存储标签信息
- snippet_tags：片段-标签关联表
- collections：存储集合信息
- collection_snippets：集合-片段关联表