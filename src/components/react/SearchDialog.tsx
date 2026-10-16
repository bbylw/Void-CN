import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type Entry = {
  url: string;
  title: string;
  group: string;
  headings: string[];
  body: string;
};

type Hit = { entry: Entry; score: number; snippet: string };

/** 依次匹配查询中的每个字符，返回命中位置（用于中文等无空格分词的语言）。 */
function subsequence(text: string, query: string): number[] | null {
  const hay = text.toLowerCase();
  const needle = query.toLowerCase();
  const positions: number[] = [];
  let at = 0;
  for (let i = 0; i < needle.length; i++) {
    const ch = needle[i]!;
    if (ch === ' ') continue;
    const found = hay.indexOf(ch, at);
    if (found === -1) return null;
    positions.push(found);
    at = found + 1;
  }
  return positions.length ? positions : null;
}

function score(text: string, query: string, weight: number): number | null {
  const pos = subsequence(text, query);
  if (!pos) return null;
  const spread = pos[pos.length - 1]! - pos[0]!;
  const bonus = text.toLowerCase().startsWith(query.toLowerCase()) ? 60 : 0;
  const literal = text.toLowerCase().includes(query.toLowerCase()) ? 80 : 0;
  const density = 1 / (1 + spread / 40);
  return weight * (10 + density * 10) + bonus + literal - Math.min(text.length / 400, 4);
}

function search(entries: Entry[], query: string): Hit[] {
  const q = query.trim();
  if (!q) return [];
  const hits: Hit[] = [];
  for (const entry of entries) {
    const s = Math.max(
      score(entry.title, q, 6) ?? -Infinity,
      score(entry.headings.join(' '), q, 3.5) ?? -Infinity,
      score(entry.body.slice(0, 6000), q, 1) ?? -Infinity,
    );
    if (s === -Infinity) continue;
    hits.push({ entry, score: s, snippet: snippet(entry, q) });
  }
  return hits.sort((a, b) => b.score - a.score).slice(0, 24);
}

/** 取一段以命中位置为中心的正文摘要，便于判断这条结果是否相关 */
function snippet(entry: Entry, query: string): string {
  const text = entry.body.replace(/\s+/g, ' ').trim();
  const span = 92;
  const pos = subsequence(text, query);
  if (!pos) return text.length > span ? `${text.slice(0, span)}…` : text;
  const start = Math.max(0, pos[0]! - 26);
  const end = Math.min(text.length, start + span);
  return `${start > 0 ? '…' : ''}${text.slice(start, end)}${end < text.length ? '…' : ''}`;
}

function Highlight({ text, query }: { text: string; query: string }) {
  const pos = useMemo(() => subsequence(text, query.trim()), [text, query]);
  if (!pos) return <>{text}</>;
  const set = new Set(pos);
  const out: React.ReactNode[] = [];
  let buf = '';
  let active = false;
  for (let i = 0; i < text.length; i++) {
    const on = set.has(i);
    if (on && !active) {
      if (buf) out.push(buf);
      buf = '';
      active = true;
    } else if (!on && active) {
      out.push(
        <mark
          key={i}
          className="rounded-[3px] px-0.5 text-[color:var(--c-accent)]"
          style={{ background: 'color-mix(in oklab, var(--c-accent) 16%, transparent)' }}
        >
          {buf}
        </mark>,
      );
      buf = '';
      active = false;
    }
    buf += text[i];
  }
  if (buf)
    out.push(
      active ? (
        <mark
          key="t"
          style={{ background: 'color-mix(in oklab, var(--c-accent) 16%, transparent)' }}
        >
          {buf}
        </mark>
      ) : (
        buf
      ),
    );
  return <>{out}</>;
}

interface Props {
  /** 由按需加载器挂载时直接以展开状态出现 */
  initialOpen?: boolean;
}

/**
 * 站内搜索对话框。
 *
 * 本组件不在首屏挂载：页面只渲染原生的 `SearchTrigger` 按钮，
 * 用户点击或按 ⌘K 时由 `scripts/search-launcher.ts` 动态载入并挂载为单例。
 * 因此全局同一时刻只会有一个实例，⌘K 的切换行为也由本组件自行处理。
 */
export default function SearchDialog({ initialOpen = false }: Props) {
  const [open, setOpen] = useState(initialOpen);
  const [query, setQuery] = useState('');
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => search(entries, query), [entries, query]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // 已挂载后，触发按钮通过自定义事件请求展开
  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener('search:open', onOpen);
    return () => window.removeEventListener('search:open', onOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    setCursor(0);
    requestAnimationFrame(() => inputRef.current?.focus());
    if (entries.length) return;
    setLoading(true);
    fetch('/search-index.json')
      .then((r) => r.json())
      .then((d: Entry[]) => setEntries(d))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [open, entries.length]);

  // 展开时：锁定背景滚动 + 焦点陷阱 + 关闭后恢复焦点
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    const prevFocus = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !panelRef.current) return;
      const focusables = panelRef.current.querySelectorAll<HTMLElement>(
        'button, input, a[href], [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables.length) return;
      const first = focusables[0]!;
      const last = focusables[focusables.length - 1]!;
      const active = document.activeElement;
      if (e.shiftKey && (active === first || !panelRef.current.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      prevFocus?.focus?.();
    };
  }, [open]);

  useEffect(() => setCursor(0), [query]);

  useEffect(() => {
    if (!open || !listRef.current) return;
    listRef.current.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [cursor, open]);

  const go = useCallback((url: string) => {
    setOpen(false);
    window.location.href = url;
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
    } else if (e.key === 'Enter' && results[cursor]) {
      e.preventDefault();
      go(results[cursor].entry.url);
    }
  };

  let lastGroup = '';

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[12vh]"
      role="dialog"
      aria-modal="true"
      aria-label="搜索文档"
    >
      <button
        className="absolute inset-0 cursor-default"
        style={{
          background: 'color-mix(in oklab, var(--c-bg-sunken) 78%, transparent)',
          backdropFilter: 'blur(4px)',
        }}
        onClick={() => setOpen(false)}
        aria-label="关闭搜索"
        tabIndex={-1}
      />
      <div
        ref={panelRef}
        className="relative flex max-h-[68vh] w-full max-w-[42rem] flex-col overflow-hidden rounded-[var(--radius-panel)] border shadow-[var(--shadow-pop)]"
        style={{ background: 'var(--c-surface)', borderColor: 'var(--c-line-strong)' }}
      >
        <div
          className="flex items-center gap-3 border-b px-4"
          style={{ borderColor: 'var(--c-line)' }}
        >
          <svg
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.6}
            strokeLinecap="round"
            className="size-4 shrink-0"
            style={{ color: 'var(--c-fg-subtle)' }}
            aria-hidden="true"
          >
            <path d="M9 15.5a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13Zm4.6.6 4 4" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="搜索页面标题、章节或正文…"
            className="h-12 flex-1 bg-transparent text-[0.95rem] outline-none placeholder:text-[color:var(--c-fg-subtle)]"
            style={{ color: 'var(--c-fg)' }}
            autoComplete="off"
            spellCheck={false}
          />
          <button
            onClick={() => setOpen(false)}
            className="rounded border px-1.5 py-0.5 font-mono text-[0.62rem] leading-none transition-colors"
            style={{ borderColor: 'var(--c-line)', color: 'var(--c-fg-subtle)' }}
          >
            ESC
          </button>
        </div>

        <ul ref={listRef} className="scroll-thin flex-1 overflow-y-auto p-2">
          {loading && (
            <li className="px-3 py-8 text-center text-sm" style={{ color: 'var(--c-fg-subtle)' }}>
              正在加载索引…
            </li>
          )}
          {!loading && !query && (
            <li className="px-3 py-10 text-center text-sm" style={{ color: 'var(--c-fg-subtle)' }}>
              输入关键词开始搜索全部文档
            </li>
          )}
          {!loading && query && results.length === 0 && (
            <li className="px-3 py-10 text-center text-sm" style={{ color: 'var(--c-fg-subtle)' }}>
              没有找到 “{query}” 相关的内容
            </li>
          )}
          {results.map((hit, i) => {
            const showGroup = hit.entry.group !== lastGroup;
            lastGroup = hit.entry.group;
            return (
              <li key={hit.entry.url}>
                {showGroup && (
                  <div
                    className="px-3 pt-3 pb-1.5 font-mono text-[0.62rem] tracking-[0.18em] uppercase"
                    style={{ color: 'var(--c-fg-subtle)' }}
                  >
                    {hit.entry.group}
                  </div>
                )}
                <button
                  data-active={i === cursor}
                  onMouseEnter={() => setCursor(i)}
                  onClick={() => go(hit.entry.url)}
                  className="flex w-full flex-col gap-0.5 rounded-lg px-3 py-2.5 text-left transition-colors"
                  style={{
                    background:
                      i === cursor
                        ? 'color-mix(in oklab, var(--c-fg) 7%, transparent)'
                        : 'transparent',
                  }}
                >
                  <span className="text-[0.875rem] font-medium" style={{ color: 'var(--c-fg)' }}>
                    <Highlight text={hit.entry.title} query={query} />
                  </span>
                  <span
                    className="line-clamp-1 text-[0.75rem]"
                    style={{ color: 'var(--c-fg-subtle)' }}
                  >
                    <Highlight text={hit.snippet} query={query} />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <div
          className="flex items-center gap-4 border-t px-4 py-2 font-mono text-[0.65rem]"
          style={{ borderColor: 'var(--c-line)', color: 'var(--c-fg-subtle)' }}
        >
          <span>↑↓ 选择</span>
          <span>↵ 打开</span>
          <span className="ml-auto">{results.length > 0 ? `${results.length} 条结果` : ''}</span>
        </div>
      </div>
    </div>
  );
}
