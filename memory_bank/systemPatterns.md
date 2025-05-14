# System Patterns *Optional*

This file documents recurring patterns and standards used in the project.
It is optional, but recommended to be updated as the project evolves.
2025-05-14 21:58:00 - Log of updates made.

*

## Coding Patterns

* **后端模式**：
  * 使用Pydantic模型进行数据验证和序列化
  * CRUD操作封装在专用模块中
  * 使用依赖注入处理数据库会话
  * 统一的错误处理和响应格式
* **前端模式**：
  * 组件化开发，UI和逻辑分离
  * 使用自定义hooks封装通用逻辑
  * 状态管理使用Zustand store
  * 使用SWR进行数据获取和缓存

## Architectural Patterns

* **API设计模式**：
  * RESTful API设计
  * 资源命名遵循复数形式（snippets, categories等）
  * 使用HTTP方法表示操作（GET, POST, PUT, DELETE）
  * 查询参数用于过滤和分页
* **数据库模式**：
  * 使用UUID作为主键
  * 软删除模式（is_deleted标志）
  * 时间戳记录（created_at, updated_at）
  * 多对多关系使用关联表

## Testing Patterns

* **后端测试**：
  * 单元测试使用pytest
  * 测试数据库使用内存SQLite
  * 使用fixtures提供测试数据
  * API测试使用TestClient
* **前端测试**(低优先级)：
  * 组件测试使用React Testing Library
  * 单元测试使用Jest
  * 使用Mock Service Worker模拟API请求