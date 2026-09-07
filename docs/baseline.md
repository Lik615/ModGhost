# 实验基线记录

## 环境信息

| 项目 | 版本/值 |
|------|---------|
| 操作系统 | Windows 11 家庭版 中文版 (v10.0.26200) |
| Node.js | v22.23.2 (LTS) |
| npm | 10.9.8 |
| pnpm | 12.3.4 |
| Git | 2.54.0.windows.1 |
| Ghost CLI | 1.32.3 |
| Ghost | 6.59.0 |
| 数据库 | SQLite3 (ghost-dev.db) |
| 运行端口 | 2368 |
| 安装日期 | 2026-09-07 |

## 上游项目信息

### Ghost (TryGhost/Ghost)
- 仓库：https://github.com/TryGhost/Ghost
- 固定版本：v6.59.0
- 许可证：MIT
- 用途：可直接运行的内容与会员博客平台
- 技术栈：Node.js、JavaScript、Ember、Handlebars、SQLite/MySQL

### 上游主题 Source
- 仓库：https://github.com/TryGhost/Source
- 基础版本：v1.7.2
- 许可证：MIT
- 用途：自定义主题的基线

## 基线验证记录

### 安装验证
- [x] Ghost CLI 安装成功（ghost --version 验证）
- [x] Ghost v6.59.0 本地安装成功
- [x] 前台 http://localhost:2368/ 可访问（HTTP 200）
- [x] 管理端 http://localhost:2368/ghost/ 可访问（HTTP 200）
- [x] 管理员账号初始化完成
- [x] SQLite 数据库自动创建

### 基线功能清单（未修改前）
- [x] 管理员可登录管理后台
- [x] 可发布文章（默认 "Coming soon" 文章）
- [x] 可创建标签（默认 News 标签）
- [x] 前台可浏览文章列表
- [x] 前台可查看文章详情
- [x] 会员注册/登录功能可用
- [x] 评论功能可配置

### 管理员账号
- 邮箱：admin@demo.com
- 姓名：Admin
- 角色：Owner（管理员）
- 博客标题：开源个人博客

### 演示会员账号
| 姓名 | 邮箱 | 角色 |
|------|------|------|
| 演示用户一 | user1@demo.com | 免费会员 |
| 演示用户二 | user2@demo.com | 免费会员 |

## 二次开发范围

### 本人修改内容
1. 自定义主题 oss-blog-theme v1.0.0（基于 Source v1.7.2）
   - 修改主题名称、版本和描述
   - 文章卡片添加阅读时长显示
   - 新增本地全文索引搜索功能（搜索弹窗、搜索高亮、无结果建议）
   - 新增搜索样式

2. 演示内容
   - 8篇演示文章（覆盖技术、生活、随笔等标签）
   - 4个标签（News、技术、生活、随笔）
   - 2个演示会员账号

### 未修改内容
- Ghost 核心代码（versions/6.59.0/core/）
- Ghost 管理后台
- 数据库结构
- 认证和会员系统
- 评论系统

## 启动/停止命令

```bash
# 进入运行目录
cd runtime

# 启动 Ghost
ghost start

# 停止 Ghost
ghost stop

# 查看运行状态
ghost ls

# 查看日志
ghost log
```
