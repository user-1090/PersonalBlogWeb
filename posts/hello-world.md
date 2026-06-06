---
title: "欢迎来到极简博客"
date: "2026-06-06"
tags: ["说明", "入门"]
summary: "这是一个基于 Markdown 的静态博客示例，支持代码、高亮、公式和图片展示。"
---

# 欢迎

这是一个极简静态博客示例，适合直接部署到 GitHub Pages。你可以通过简单的写作流程管理文章：

- 新建 Markdown 文件
- 放入 `posts` 目录
- 图片放入 `images` 目录
- 运行 `node scripts/build.js` 或手动更新 `posts/index.json`

> 写作的核心是内容，视觉保持平静。

## 文章结构

示例表格：

| 功能 | 是否支持 |
| --- | --- |
| 标题 | ✅ |
| 粗体 / 斜体 | ✅ |
| 引用 | ✅ |
| 列表 | ✅ |
| 表格 | ✅ |
| 代码块 | ✅ |
| 图片 | ✅ |
| 数学公式 | ✅ |
| 目录导航 | ✅ |

## 代码示例

```js
function hello() {
  console.log('欢迎来到极简博客');
}
hello();
```

## 图片展示

![示例图片](images/sample-image.svg)

## 数学公式

行内公式：$E = mc^2$。

块级公式：

$$
\int_{0}^{1} x^2 \, dx = \frac{1}{3}
$$

## 链接

你可以在 Markdown 中写链接，例如 [GitHub](https://github.com)。
