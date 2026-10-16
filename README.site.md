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
│   ├── react/            SearchDialog（唯一的 React 岛，按需载入）
│   ├── docs/             文档专用组件（侧边栏、目录、Callout、表格…）
│   ├── home/             落地页各区块
│   ├── SearchTrigger.astro  搜索触发按钮（原生，零框架）
│   ├── ThemeToggle.astro    主题切换（原生）
│   ├── MobileMenu.astro     移动端抽屉（原生）
│   ├── CodeBlock.astro   带标题栏与复制按钮的代码块
│   ├── ShikiCode.astro   双主题 Shiki 高亮（跟随站点主题）
│   └── SiteHeader.astro / SiteFooter.astro
├── content/docs/         文档正文（MDX），目录式命名
├── layouts/              BaseLayout（通用） / DocsLayout（文档）
├── pages/
│   ├── index.astro       落地页
│   ├── docs/[...slug].astro
│   ├── 404.astro
│   ├── robots.txt.ts     构建期生成的 robots（sitemap 跟随 site 配置）
│   ├── search-index.json.ts  构建期生成的站内搜索索引
├── scripts/
│   ├── code-blocks.ts    代码块 / 表格的渐进增强
│   └── search-launcher.ts   搜索对话框的按需载入器（单例）
├── styles/global.css         设计系统（Tailwind v4 `@theme`）
└── data/site.ts              站点信息与文档导航树

scripts/
├── static-server.mjs         本地静态预览服务器
└── gen-og-image.py           生成 public/og.png 分享图（需 Pillow）
```

## 内容约定

文档放在 `src/content/docs/<slug>/index.mdx`，slug 为空时映射到 `/docs`。新增页面时同步更新 `src/data/site.ts` 中的 `DOCS_NAV`，否则它不会出现在侧边栏、目录入口和搜索索引里。

```mdx
---
title: 页面标题
description: 一句话摘要
badge: 可选徽标
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

## 交互岛

首屏不加载任何前端框架：主题切换、移动菜单与搜索触发按钮都是零 JS 框架的原生组件，
只有搜索对话框（`SearchDialog.tsx`）使用 React，并且在用户点击搜索按钮或按 ⌘K 时
才由 `scripts/search-launcher.ts` 动态载入、挂载为全局唯一实例——首屏 JS 约 3.5KB，
React 与 react-dom（约 227KB）只在产生搜索意图后才下载。

| 交互           | 实现          | 职责                                  |
| -------------- | ------------- | ------------------------------------- |
| `SearchDialog` | React（按需） | ⌘K 命令面板，按子序列匹配支持中文检索 |
| `ThemeToggle`  | 原生 Astro    | 深浅色切换                            |
| `MobileMenu`   | 原生 Astro    | 抽屉式导航                            |
| 代码块复制按钮 | 原生脚本      | 由 `code-blocks.ts` 注入              |

搜索索引由 `src/pages/search-index.json.ts` 在构建期从内容集合生成，运行时按需拉取。

> **dev 模式注意**：`astro.config.mjs` 中将 `SearchDialog.tsx` 排除出了
> `@vitejs/plugin-react`。否则 dev 下动态导入该组件时，其模块体的
> `$RefreshSig$()` 调用会因 Astro 不为无岛页面注入 react-refresh 前置脚本而报错，
> 搜索在 `astro dev` 下失效。排除后它走 tsconfig 的默认 JSX 转换，dev 与生产
> 行为一致；代价是编辑该文件时触发整页刷新而非 fast refresh。

## 部署

产物是纯静态文件，可部署到 Cloudflare Pages、Vercel、Netlify 或任意静态托管。

```toml title="wrangler.toml"
name = "void-cn"
pages_build_output_dir = "dist"
```

部署前记得把 `astro.config.mjs` 中的 `site` 改成真实域名。`robots.txt` 由
`src/pages/robots.txt.ts` 在构建期生成，sitemap 地址会自动跟随该配置。

## 致谢

内容来自 [voidzero-dev/void](https://github.com/voidzero-dev/void)（MIT）。如与官方文档有出入，以 [英文原站](https://void.cloud/guide/) 为准。
