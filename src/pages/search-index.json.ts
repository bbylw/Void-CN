import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { DOCS_NAV } from '../data/site';

type Entry = { url: string; title: string; group: string; headings: string[]; body: string };

/** 把 MDX 源码压成便于检索的纯文本 */
function toPlain(mdx: string): string {
  return mdx
    .replace(/^---\n[\s\S]*?\n---/, ' ')
    .replace(/^import\s.+$/gm, ' ')
    .replace(/<\/?[A-Z][^>]*>/g, ' ')
    .replace(/```[\s\S]*?```/g, (m) => m.replace(/```\w*\n?/g, ' '))
    .replace(/`([^`]*)`/g, '$1')
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#>*_~|-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export const GET: APIRoute = async () => {
  const groupOf = new Map<string, string>();
  for (const g of DOCS_NAV)
    for (const i of g.items) groupOf.set(i.href.replace(/\/$/, ''), g.label);

  const entries = await getCollection('docs');
  const index: Entry[] = entries.map((entry) => {
    const slug = entry.id === 'index' ? '' : entry.id;
    const url = `/docs${slug ? `/${slug}` : ''}`;
    return {
      url,
      title: entry.data.title,
      group: groupOf.get(url.replace(/\/$/, '')) ?? '文档',
      headings: [],
      body: toPlain(entry.body ?? ''),
    };
  });

  // 注入章节标题，让「关键词 → 锚点」也能命中
  const docByUrl = new Map(index.map((e) => [e.url, e]));
  for (const entry of entries) {
    const slug = entry.id === 'index' ? '' : entry.id;
    const url = `/docs${slug ? `/${slug}` : ''}`;
    const target = docByUrl.get(url);
    if (!target || !entry.body) continue;
    target.headings = [...entry.body.matchAll(/^#{2,3}\s+(.+)$/gm)].map((m) =>
      m[1]!.replace(/[`*]/g, '').trim(),
    );
  }

  return new Response(JSON.stringify(index), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
