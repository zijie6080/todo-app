# Todo App — mengzijie

一个美观的 To Do List 应用，支持账号登录、任务分类、优先级、子任务和截止日期。

## 技术栈
- React 18 + TypeScript
- Tailwind CSS
- Vite
- Lucide React Icons

## 本地开发

```bash
npm install
npm run dev
```

## 部署到 Vercel

1. 将此目录推送到 GitHub
2. 在 Vercel 中导入该 GitHub 仓库
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. 在 Vercel 域名设置中添加 `todo.mengzijie.com`

## 阿里云 DNS 配置

在阿里云 DNS 控制台添加：
- 记录类型：CNAME
- 主机记录：todo
- 记录值：cname.vercel-dns.com
- TTL：600

## 数据存储

当前版本使用 localStorage 存储数据（可在多设备间使用，数据存于浏览器）。
如需跨设备同步，可接入 Base44 后端 API。
