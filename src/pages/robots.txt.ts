import type { APIRoute } from 'astro';

/**
 * robots.txt 由站点配置动态生成，sitemap 地址始终跟随 astro.config.mjs 的 `site`。
 */
export const GET: APIRoute = ({ site }) => {
  const base = site ?? 'https://void-cn.pages.dev';
  const sitemap = new URL('sitemap-index.xml', base).href;
  const body = `User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
