# Void

使用 [Vite](https://vite.dev) 构建并部署全栈应用，运行于 Cloudflare Workers 之上。

Void 为你和你的编程智能体集成了三款开源工具：

- **Void SDK：** 通过基于文件的 API 路由、服务端渲染页面，以及面向数据库、存储与 AI 的类型化 API，将服务端与客户端的代码一同构建。让类型从数据库查询一路贯穿到 UI。
- **Void CLI：** 构建应用、开通其使用的 Cloudflare 资源、执行迁移，并用一条命令完成部署。通过同一个 CLI 管理资源、查看日志以及回滚。
- **Void Platform：** 在你的 Cloudflare 账户中安装一个共享的部署环境，供团队或客户使用，具备访问控制、资源限额、用量统计，以及请求用户授权部署的[关联应用](https://github.com/voidzero-dev/void/blob/main/docs/guide/platform/administration/connected-apps.md)。

SDK 的各项功能是可选且可组合的。Void 页面可使用 React、Vue、Svelte 或 Solid，也可以沿用某个[受支持的应用框架](https://void.cloud/integrations/frameworks/overview)负责路由与渲染，而由 Void 接管资源 API、迁移和部署。

## 快速开始

请使用 Node.js 24.21.0 或更高版本。在一个空目录中运行：

```sh
npm install -D void
npx void init
npm run dev
```

Vite+ 是默认工具链；初始化过程会为你安装它，并保留你现有的包管理器配置。选择你的 UI 框架与起始模板，然后选择 Cloudflare 即可部署到你的账户：

```sh
npx void deploy
```

Void 会构建应用、开通资源、执行数据库迁移，并打印出你的部署地址。跟随[快速上手](https://void.cloud/guide/quickstart)创建你的第一个应用，或将 Void 接入已有的 Vite 项目。

若要部署到团队平台，请先运行 `npx void connect <url>`，再使用相同的部署命令。参见[安装 Void Platform](https://void.cloud/guide/self-hosted-platform)，在你的 Cloudflare 账户中托管一套平台，或自定义其开源运行时。

## 文档

可在线阅读 [Void 文档](https://void.cloud)，也可以使用随 `void` 包一起提供的 Markdown 指南与参考，位于 `node_modules/void/docs/`。

`void init` 会在新项目中添加一份精简的 `AGENTS.md`，并在修改已有项目的指令前先征求你的同意。它还会为检测到的编程智能体链接打包好的技能。

- [服务端路由](https://void.cloud/guide/server-routing) 与 [页面](https://void.cloud/guide/pages-routing/overview)
- [数据库](https://void.cloud/guide/database) 与 [类型安全](https://void.cloud/guide/type-safety)
- [部署](https://void.cloud/guide/deployment)
- [框架集成](https://void.cloud/integrations/frameworks/overview)
- [API](https://void.cloud/reference/api) 与 [CLI](https://void.cloud/reference/cli) 参考
- [编程智能体](https://void.cloud/integrations/agents)

## 参与贡献

```sh
git clone https://github.com/voidzero-dev/void.git
cd void
vp install
vp run build:all
```

使用 `vp run dev:docs` 预览文档。验证方式参见 [TESTING.md](https://github.com/voidzero-dev/void/blob/main/TESTING.md)，平台改动参见 [Platform Development](https://void.cloud/guide/platform-development)，仓库部署参见 [operations](https://github.com/voidzero-dev/void/blob/main/platform/meta/operations.md)。

## 许可证

MIT
