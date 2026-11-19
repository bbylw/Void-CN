export const SITE = {
  name: 'Void',
  title: 'Void — Cloudflare Workers 上的全栈框架',
  tagline: '由 Vite 驱动的全栈框架',
  description:
    'Void 是一个运行在 Cloudflare Workers 之上、由 Vite 驱动的全栈框架。用 React、Vue、Svelte 或 Solid 构建界面，在同一个项目里编写服务端代码，让类型从数据库查询一路贯穿到 UI。',
  docsBase: '/docs',
  repo: 'https://github.com/voidzero-dev/void',
  upstream: 'https://void.cloud',
  upstreamGuide: 'https://void.cloud/guide/',
  npm: 'https://www.npmjs.com/package/void',
  social: {
    github: 'https://github.com/voidzero-dev',
    x: 'https://x.com/voidzerodev',
    bluesky: 'https://bsky.app/profile/voidzero.dev',
    discord: 'https://discord.gg/cC6TEVFKSx',
  },
} as const;

export type NavLink = {
  title: string;
  href: string;
  description?: string;
};

export type NavGroup = {
  label: string;
  items: NavLink[];
};

/** 文档侧边栏导航（与 src/content/docs 下的 MDX 文件一一对应） */
export const DOCS_NAV: NavGroup[] = [
  {
    label: '开始',
    items: [
      { title: '介绍', href: '/docs' },
      { title: '快速开始', href: '/docs/quickstart' },
      { title: '支持的应用类型', href: '/docs/app-types' },
      { title: '项目协作', href: '/docs/project-collaboration' },
    ],
  },
  {
    label: '路由与渲染',
    items: [
      { title: '服务端路由', href: '/docs/server-routing' },
      {
        title: '页面路由',
        href: '/docs/pages-routing',
        description: 'loaders、actions、布局与表单',
      },
      { title: 'Loader 与 Props', href: '/docs/pages-routing/loaders' },
      { title: '布局与共享数据', href: '/docs/pages-routing/layouts' },
      { title: 'Action 与表单', href: '/docs/pages-routing/actions-and-forms' },
      { title: 'Islands', href: '/docs/pages-routing/islands' },
      { title: 'Head 管理', href: '/docs/pages-routing/head' },
      { title: '未找到与错误', href: '/docs/pages-routing/errors' },
      { title: 'Markdown', href: '/docs/pages-routing/markdown' },
      { title: 'View Transitions', href: '/docs/pages-routing/view-transitions' },
      { title: '类型安全', href: '/docs/type-safety' },
      { title: '类型化 fetch', href: '/docs/typed-fetch' },
      { title: '静态站点生成（SSG）', href: '/docs/ssg' },
      { title: '自定义 SSR', href: '/docs/ssr' },
      { title: 'Live 事件流', href: '/docs/live' },
      { title: '服务器发送事件（SSE）', href: '/docs/sse' },
    ],
  },
  {
    label: '边缘能力',
    items: [
      { title: '边缘预渲染', href: '/docs/edge/prerendering' },
      { title: '重新验证（ISR）', href: '/docs/edge/revalidation' },
      { title: '自定义响应头', href: '/docs/edge/headers' },
      { title: '重定向', href: '/docs/edge/redirects' },
      { title: 'Rewrites', href: '/docs/edge/rewrites' },
      { title: '静态资源缓存', href: '/docs/edge/static-assets' },
    ],
  },
  {
    label: '数据',
    items: [
      { title: '数据库', href: '/docs/database' },
      { title: 'D1（SQLite）', href: '/docs/database/d1' },
      { title: 'PostgreSQL', href: '/docs/database/postgresql' },
      { title: 'MySQL', href: '/docs/database/mysql' },
      { title: 'KV 键值存储', href: '/docs/kv' },
      { title: '对象存储', href: '/docs/storage' },
      { title: 'Durable State', href: '/docs/durable-state' },
      { title: '环境变量', href: '/docs/env-vars' },
    ],
  },
  {
    label: '后端能力',
    items: [
      { title: '身份认证', href: '/docs/auth' },
      { title: 'AI', href: '/docs/ai' },
      { title: '邮件', href: '/docs/email' },
      { title: '发送邮件', href: '/docs/email/sending' },
      { title: '接收邮件', href: '/docs/email/receiving' },
      { title: '邮件域名与配置', href: '/docs/email/domains' },
      { title: '队列', href: '/docs/queues' },
      { title: '定时任务', href: '/docs/jobs' },
      { title: 'WebSocket', href: '/docs/websockets' },
      { title: '沙箱', href: '/docs/sandboxes' },
    ],
  },
  {
    label: '开发与部署',
    items: [
      { title: '部署', href: '/docs/deployment' },
      { title: '测试', href: '/docs/testing' },
      { title: '远程开发', href: '/docs/remote-dev' },
      { title: '框架集成', href: '/docs/frameworks' },
      { title: 'TanStack Start', href: '/docs/frameworks/tanstack-start' },
      { title: 'React Router v7', href: '/docs/frameworks/react-router' },
      { title: 'SvelteKit', href: '/docs/frameworks/sveltekit' },
      { title: 'Nuxt', href: '/docs/frameworks/nuxt' },
      { title: 'Analog', href: '/docs/frameworks/analog' },
      { title: 'Astro', href: '/docs/frameworks/astro' },
      { title: 'Cloudflare', href: '/docs/integrations/cloudflare' },
      { title: 'Hono', href: '/docs/integrations/hono' },
      { title: 'Node.js、Bun 与 Deno', href: '/docs/integrations/nodejs-bun-deno' },
      { title: '编程智能体', href: '/docs/agents' },
      { title: '配置', href: '/docs/config' },
    ],
  },
  {
    label: 'Void 平台',
    items: [
      { title: 'Void 平台', href: '/docs/platform' },
      { title: '平台管理', href: '/docs/platform/administration' },
      { title: '登录与访问', href: '/docs/platform/administration/access' },
      { title: '用户与项目', href: '/docs/platform/administration/projects' },
      { title: '计划与限额', href: '/docs/platform/administration/plans' },
      { title: '关联应用', href: '/docs/platform/administration/connected-apps' },
      { title: '平台邮件', href: '/docs/platform/administration/email' },
      { title: '运维', href: '/docs/platform/administration/operations' },
      { title: '项目零信任', href: '/docs/platform/administration/zero-trust' },
      { title: '安装与配置登录', href: '/docs/platform/installation/setup' },
      { title: '前置条件', href: '/docs/platform/installation/prerequisites' },
      { title: '凭据', href: '/docs/platform/installation/credentials' },
      { title: '域名与资源', href: '/docs/platform/installation/domains' },
      { title: '首次部署', href: '/docs/platform/installation/first-deployment' },
      { title: '从 CI 安装', href: '/docs/platform/installation/ci' },
      { title: '维护与恢复', href: '/docs/platform/installation/maintenance' },
      { title: '禁用与卸载', href: '/docs/platform/installation/uninstall' },
      { title: '开发 Void 平台', href: '/docs/platform/development' },
      { title: '本地开发', href: '/docs/platform/development/local' },
      { title: '运行时与源码构建', href: '/docs/platform/development/runtime' },
      { title: 'Schema 与 CI', href: '/docs/platform/development/schema-ci' },
    ],
  },
  {
    label: '参考',
    items: [
      { title: 'API 参考', href: '/docs/reference/api' },
      { title: '处理器与中间件', href: '/docs/reference/api/handlers' },
      { title: 'Pages 适配器', href: '/docs/reference/api/pages' },
      { title: '身份认证 API', href: '/docs/reference/api/auth' },
      { title: 'Fetch 客户端 API', href: '/docs/reference/api/client' },
      { title: '数据库与数据填充 API', href: '/docs/reference/api/database' },
      { title: 'Durable State 与 WebSocket API', href: '/docs/reference/api/durable' },
      { title: '环境变量 API', href: '/docs/reference/api/env' },
      { title: '资源客户端', href: '/docs/reference/api/resources' },
      { title: '部署产物 API', href: '/docs/reference/api/deploy' },
      { title: 'URL 重写', href: '/docs/reference/api/rewrites' },
      { title: '插件与配置', href: '/docs/reference/api/plugin' },
      { title: '类型', href: '/docs/reference/api/types' },
      { title: 'CLI 参考', href: '/docs/reference/cli' },
      { title: '项目初始化命令', href: '/docs/reference/cli/setup' },
      { title: '连接与认证', href: '/docs/reference/cli/auth' },
      { title: '部署命令', href: '/docs/reference/cli/deploy' },
      { title: '数据库命令', href: '/docs/reference/cli/database' },
      { title: '代码生成命令', href: '/docs/reference/cli/generate' },
      { title: '密钥与环境变量命令', href: '/docs/reference/cli/secrets' },
      { title: '自定义域名命令', href: '/docs/reference/cli/domains' },
      { title: '邮件命令', href: '/docs/reference/cli/email' },
      { title: '项目命令', href: '/docs/reference/cli/project' },
      { title: 'GitHub 与构建命令', href: '/docs/reference/cli/github' },
      { title: '平台管理命令', href: '/docs/reference/cli/platform' },
      { title: '平台安装命令', href: '/docs/reference/cli/platform-installation' },
      { title: '平台配置命令', href: '/docs/reference/cli/platform-config' },
      { title: '平台用户命令', href: '/docs/reference/cli/platform-users' },
      { title: '平台邮件命令', href: '/docs/reference/cli/platform-email' },
      { title: '平台运维命令', href: '/docs/reference/cli/platform-operations' },
      { title: '平台零信任命令', href: '/docs/reference/cli/platform-zero-trust' },
      { title: '资源推断', href: '/docs/reference/resource-inference' },
      { title: '项目结构', href: '/docs/reference/structure' },
    ],
  },
];

export const HOME_NAV: NavLink[] = [
  { title: '文档', href: '/docs' },
  { title: '快速开始', href: '/docs/quickstart' },
  { title: '部署', href: '/docs/deployment' },
  { title: 'Void 平台', href: '/docs/platform' },
];
