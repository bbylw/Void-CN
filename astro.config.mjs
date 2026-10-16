// @ts-check
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://void-cn.pages.dev',
  trailingSlash: 'ignore',
  integrations: [
    react({
      /**
       * SearchDialog 由 scripts/search-launcher.ts 在用户意图时才动态导入。
       * 若纳入 @vitejs/plugin-react，dev 下其模块体的 $RefreshSig$() 调用会因
       * Astro 不为「无岛页面」注入 refresh 前置脚本而抛错，导致搜索在 dev 下失效。
       * 排除后该文件走默认 JSX 转换（tsconfig: react-jsx），dev 与生产行为一致；
       * 代价是编辑它时触发整页刷新而非 fast refresh。
       */
      exclude: [/src[\\/]components[\\/]react[\\/]SearchDialog\.tsx$/],
    }),
    mdx(),
    sitemap({
      i18n: {
        defaultLocale: 'zh-CN',
        locales: { 'zh-CN': 'zh-CN' },
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  },
  markdown: {
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'vesper',
      },
      wrap: true,
    },
  },
});
