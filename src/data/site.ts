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
      { title: '类型安全', href: '/docs/type-safety' },
    ],
  },
  {
    label: '数据',
    items: [
      { title: '数据库', href: '/docs/database' },
      { title: 'KV 键值存储', href: '/docs/kv' },
      { title: '对象存储', href: '/docs/storage' },
      { title: 'Durable State', href: '/docs/durable-state' },
      { title: '类型化 fetch', href: '/docs/typed-fetch' },
      { title: '环境变量', href: '/docs/env-vars' },
    ],
  },
  {
    label: '后端能力',
    items: [
      { title: '身份认证', href: '/docs/auth' },
      { title: 'AI', href: '/docs/ai' },
      { title: '队列', href: '/docs/queues' },
      { title: '定时任务', href: '/docs/jobs' },
      { title: 'WebSocket', href: '/docs/websockets' },
    ],
  },
  {
    label: '开发与部署',
    items: [
      { title: '部署', href: '/docs/deployment' },
      { title: 'Void 平台', href: '/docs/platform' },
      { title: '框架集成', href: '/docs/frameworks' },
      { title: '编程智能体', href: '/docs/agents' },
      { title: '配置', href: '/docs/config' },
    ],
  },
];

export const HOME_NAV: NavLink[] = [
  { title: '文档', href: '/docs' },
  { title: '快速开始', href: '/docs/quickstart' },
  { title: '部署', href: '/docs/deployment' },
  { title: 'Void 平台', href: '/docs/platform' },
];
