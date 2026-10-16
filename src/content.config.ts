import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

/**
 * 文档以「目录式」命名：`quickstart/index.mdx` → `/docs/quickstart`，
 * `index.mdx` → `/docs`。这样每个页面都能拥有同名的局部资源目录。
 */
const docs = defineCollection({
  loader: glob({
    base: './src/content/docs',
    pattern: '**/index.mdx',
    generateId: ({ entry, base }: { entry: string; base: URL | string }) => {
      const dir = typeof base === 'string' ? base : base.pathname;
      const rel = entry
        .replace(dir, '')
        .replace(/\\/g, '/')
        .replace(/^\//, '')
        .replace(/\/index\.mdx$/, '')
        .replace(/\.mdx$/, '');
      return rel === '' ? 'index' : rel;
    },
  }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    /** 侧边栏分组标签 */
    group: z.string().optional(),
    /** 标题旁的提示徽标 */
    badge: z.string().optional(),
  }),
});

export const collections = { docs };
