# 许可证与来源声明 (NOTICE)

本项目基于开源软件进行二次开发，以下声明所有上游项目和第三方资源的许可证与来源。

## 上游项目

### Ghost

- **项目名称**：Ghost
- **仓库地址**：https://github.com/TryGhost/Ghost
- **使用版本**：v6.59.0
- **许可证**：MIT License
- **用途**：作为博客平台的运行基线，提供内容管理、会员系统、评论系统等核心功能
- **修改情况**：未修改 Ghost 核心代码，仅通过主题和 Content API 进行扩展

Ghost MIT License 摘要：
> Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions: The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

### Source 主题

- **项目名称**：Source (Ghost Theme)
- **仓库地址**：https://github.com/TryGhost/Source
- **基础版本**：v1.7.2
- **许可证**：MIT License
- **用途**：作为自定义主题的基线模板
- **修改情况**：在其基础上进行了二次开发，修改了主题名称、版本、文章卡片模板，新增了本地全文搜索功能

Source 主题 MIT License 摘要：
> Copyright (c) 2013-2024 Ghost Foundation

### RealWorld 规范

- **项目名称**：RealWorld
- **仓库地址**：https://github.com/gothinkster/realworld
- **许可证**：MIT License
- **用途**：作为博客业务规范和 API 设计的参考
- **使用情况**：本实验采用 Ghost 路线，未直接使用 RealWorld 的代码实现，仅参考其业务规范

## 二次开发部分

本项目的二次开发代码（包括但不限于自定义主题修改、本地全文搜索实现、文档和脚本）基于 MIT 许可证发布。

### 修改的文件

以下文件基于 Source 主题 v1.7.2 修改：

| 文件 | 修改内容 |
|------|----------|
| `theme/oss-blog-theme/package.json` | 修改主题名称、版本号、描述 |
| `theme/oss-blog-theme/default.hbs` | 添加搜索弹窗组件、搜索脚本引用、搜索样式 |
| `theme/oss-blog-theme/partials/post-card.hbs` | 添加阅读时长显示 |

### 新增的文件

以下文件为本项目原创：

| 文件 | 说明 | 许可证 |
|------|------|--------|
| `theme/oss-blog-theme/partials/search-modal.hbs` | 搜索弹窗组件模板 | MIT |
| `theme/oss-blog-theme/assets/js/search.js` | 本地全文搜索核心逻辑 | MIT |
| `docs/baseline.md` | 实验基线记录 | MIT |
| `docs/architecture.md` | 系统架构文档 | MIT |
| `tests/acceptance.md` | 验收测试用例 | MIT |
| `scripts/create_demo_content.py` | 演示内容创建脚本 | MIT |
| `scripts/activate_theme.py` | 主题激活脚本 | MIT |
| `scripts/export_backup.py` | 备份导出脚本 | MIT |
| `README.md` | 项目说明文档 | MIT |

## 第三方资源

### 图片资源

- 本项目未使用任何第三方图片资源
- 演示文章未包含特色图片，使用 Ghost 默认无图布局

### 字体资源

- 主题使用 Source 主题内置的字体（Inter、EB Garamond、JetBrains Mono）
- 字体许可证遵循 Source 主题的原始许可证

### 代码库

- 本项目未引入额外的第三方 JavaScript 库
- 本地全文搜索功能使用原生 JavaScript 实现，无第三方依赖
- Python 脚本使用 `requests` 和 `PyJWT` 库（均为开源库，仅用于开发辅助）

## 演示数据

- 演示文章内容为本项目原创，用于实验展示
- 演示账号（admin@demo.com、user1@demo.com、user2@demo.com）为测试账号，非真实用户数据
- 所有演示数据均可通过 Ghost 导出功能导出为 JSON 文件

## 许可证兼容性

- Ghost (MIT) → 兼容
- Source 主题 (MIT) → 兼容
- 本项目二次开发 (MIT) → 兼容
- 所有组件均为 MIT 许可证，可自由使用、修改和分发

## 归属说明

- Ghost 是 Ghost Foundation 的商标
- Source 主题由 Ghost Foundation 开发和维护
- 本项目的二次开发部分由实验开发者完成
- 本项目仅用于学习和实验目的，不代表 Ghost Foundation 的官方产品

---

**最后更新**：2026-09-07
