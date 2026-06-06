# 极简个人博客

这是一个可直接部署到 GitHub Pages 的静态个人博客，使用 HTML、CSS、JavaScript 和本地 Markdown 文件。

## 特性

- 纯静态，无后台、无数据库
- Markdown 文章管理
- 首页文章列表、标签筛选、搜索
- 文章页 Markdown 渲染、图片预览、代码高亮、数学公式、目录导航
- `sitemap.xml` 和 `robots.txt` 支持

## 目录结构

```
/
├── index.html
├── about.html
├── post.html
├── posts/
│   ├── hello-world.md
│   ├── minimal-design.md
│   └── index.json
├── images/
│   └── .gitkeep
├── css/
│   └── style.css
├── js/
│   └── app.js
├── assets/
│   └── favicon.svg
├── scripts/
│   └── build.js
├── sitemap.xml
├── robots.txt
├── package.json
├── README.md
└── .nojekyll
```

## 使用说明

1. 将新的 Markdown 文件放入 `posts/` 目录。
2. 将图片放入 `images/` 目录，在 Markdown 中使用相对路径引用，如 `images/photo.jpg`。
3. 运行 `node scripts/build.js` 更新 `posts/index.json` 和 `sitemap.xml`。
4. 将项目推送到 GitHub 仓库，并开启 GitHub Pages。

## 注意

- 请将 `sitemap.xml` 和 `robots.txt` 中的 `https://yourname.github.io/your-repo-name` 替换为你的实际 GitHub Pages 地址。
- 组件使用了静态 CDN 资源，因此部署时可以直接访问。

## 本地预览

如果需要本地预览，请使用简单的静态服务器，如：

```bash
npx http-server .
```

或在 VS Code 中使用 Live Server 插件。
