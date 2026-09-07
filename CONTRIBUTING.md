# 贡献指南

## 开发环境

- Node.js 22 LTS
- pnpm 11+
- Ghost CLI 1.32+
- Git 2.40+

## 开发流程

1. Fork 本仓库
2. 创建功能分支：`git checkout -b feature/your-feature`
3. 提交修改：`git commit -m "feat: 描述"`
4. 推送到分支：`git push origin feature/your-feature`
5. 创建 Pull Request

## 提交规范

遵循 [Conventional Commits](https://www.conventionalcommits.org/)：

- `feat:` 新功能
- `fix:` Bug 修复
- `docs:` 文档更新
- `style:` 样式调整
- `refactor:` 重构
- `test:` 测试相关
- `chore:` 构建/工具相关

## 主题开发

```bash
cd theme/oss-blog-theme
npm install
npm run dev    # 开发模式
npm run zip    # 打包主题
npm test       # 运行 gscan 主题检查
```

## 代码审查

PR 合并前需完成：
- [ ] 自检清单全部通过
- [ ] 至少一次自我 Code Review
- [ ] 测试用例通过
- [ ] 无敏感信息泄露

## 许可证

提交的代码需与项目 MIT 许可证兼容。
