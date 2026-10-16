# Void 中文站

Void 的中文落地页与文档站点。内容翻译自官方 [void.cloud/guide](https://void.cloud/guide/) 与仓库 `README.md`，并按中文阅读习惯重新编辑。

技术栈：**Astro + TypeScript + React + MDX + Tailwind CSS + Bun**（TypeScript 6.x，其余依赖使用最新稳定版）。

---

## 快速开始

```sh
bun install
bun dev          # http://localhost:4321
bun run build    # 输出到 dist/
bun run preview  # 用 scripts/static-server.mjs 预览 dist/
bun run check    # astro check
```

`bun run preview` 启动的是 `scripts/static-server.mjs` —— 一个约 60 行的零依赖静态服务器，
用于在本地验证生产构建（支持 `/docs/xxx` → `/docs/xxx/index.html` 的目录式回退）。

> 修改 `astro.config.mjs` 后，如果 dev 服务器出现 `_jsxDEV is not a function` 之类的 React 预打包错误，
> 删除 `node_modules/.vite` 与 `.astro` 后重新启动即可。这是 Vite 依赖预打包在配置热重载后的已知副作用，
> 生产构建不受影响。

## 目录结构

```text
src/
├── components/
│   ├── react/            React 岛（搜索、主题、移动菜单、复制按钮）
│   ├── docs/             文档专用组件（侧边栏、目录、Callout、表格…）
│   ├── home/             落地页各区块
│   ├── CodeBlock.astro   带标题栏与复制按钮的代码块
│   ├── ShikiCode.astro   双主题 Shiki 高亮（跟随站点主题）
│   └── SiteHeader.astro / SiteFooter.astro
├── content/docs/         文档正文（MDX），目录式命名
├── layouts/              BaseLayout（通用） / DocsLayout（文档）
├── pages/
│   ├── index.astro       落地页
│   ├── docs/[...slug].astro
│   ├── 404.astro
│   ├── search-index.json.ts  构建期生成的站内搜索索引
├── scripts/code-blocks.ts    代码块 / 表格的渐进增强
├── styles/global.css         设计系统（Tailwind v4 `@theme`）
└── data/site.ts              站点信息与文档导航树

scripts/
└── static-server.mjs         本地静态预览服务器
```

## 内容约定

文档放在 `src/content/docs/<slug>/index.mdx`，slug 为空时映射到 `/docs`。新增页面时同步更新 `src/data/site.ts` 中的 `DOCS_NAV`，否则它不会出现在侧边栏、目录入口和搜索索引里。

```mdx
---
title: 页面标题
description: 一句话摘要
group: 分组标签
---

正文，支持 MDX 组件：<Callout>、<CardGrid>/<Card>、<Steps>、<ApiTable>、<CodeBlock>。
```

普通代码块直接用围栏语法即可 —— `src/scripts/code-blocks.ts` 会自动加上标题栏、语言标签与复制按钮，并把表格包进横向滚动容器。

## 设计系统

所有颜色、圆角、字号都定义在 `src/styles/global.css` 的 `@theme` 中，通过 CSS 变量 `--c-*` 输出。深浅色主题各自定义一套 `--c-*`，Tailwind 工具类不需要关心具体值。

```css
:root        { --c-bg: #fbfbfd; --c-fg: #0b0d14; --c-violet: #5b48f5; … }
.dark        { --c-bg: #07080c; --c-fg: #e9ebf2; --c-violet: #9b8cff; … }
```

主题通过 `<html class="dark">` 切换，选择结果保存在 `localStorage` 的 `void-theme`，默认跟随系统偏好。

## React 岛

只有需要交互的部分才用 React，其余全部是零 JS 的 Astro 组件：

| 岛             | 位置           | 职责                                  |
| -------------- | -------------- | ------------------------------------- |
| `SearchDialog` | 顶栏 / 404     | ⌘K 命令面板，按子序列匹配支持中文检索 |
| `ThemeToggle`  | 顶栏           | 深浅色切换                            |
| `MobileMenu`   | 顶栏（移动端） | 抽屉式导航                            |
| `CopyButton`   | 代码块         | 复制到剪贴板                          |

搜索索引由 `src/pages/search-index.json.ts` 在构建期从内容集合生成，运行时按需拉取。

## 部署

产物是纯静态文件，可部署到 Cloudflare Pages、Vercel、Netlify 或任意静态托管。

```toml title="wrangler.toml"
name = "void-cn"
pages_build_output_dir = "dist"
```

部署前记得把 `astro.config.mjs` 中的 `site` 改成真实域名，`public/robots.txt` 里的 sitemap 地址也一并更新。

## 致谢

内容来自 [voidzero-dev/void](https://github.com/voidzero-dev/void)（MIT）。如与官方文档有出入，以 [英文原站](https://void.cloud/guide/) 为准。
