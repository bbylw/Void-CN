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

/**
 * 样式注入：面板外观仍由 Tailwind 类承担，这里只写 Tailwind 表达不了的部分
 * ——::backdrop 视觉、top-layer 进出动画（animate-to-from-top-layer）、
 * 以及 prevent-page-scroll-under-modal-dialog 要求的滚动链 containment。
 */
const DIALOG_CSS = `
/* 关闭态收回：dialog 的 UA display:none 会被打开态规则覆盖，必须成对声明 */
dialog[data-search-dialog] {
  display: none;
}
dialog[data-search-dialog][open] {
  display: flex;
}
dialog[data-search-dialog] {
  position: fixed;
  inset: 0;
  z-index: 100;
  margin: 0;
  padding: 12vh 1rem 0;          /* 等价于旧的 pt-[12vh] px-4 */
  align-items: flex-start;
  justify-content: center;
  width: auto;
  height: auto;
  min-width: 0;                 /* 覆盖 UA 的 min-width:min-content，否则窄屏会被内容撑出视口 */
  max-width: none;
  min-height: 0;
  max-height: none;
  border: 0;
  border-radius: 0;
  background: transparent;       /* 底色交给内部面板：dialog 盒＝背板命中区，light dismiss 判定才可靠 */
  box-shadow: none;
  color: inherit;
  opacity: 0;
  /* 滚动锁定：不再改 body/html 的 overflow，避免抽走滚动条造成的横向跳动 */
  overscroll-behavior: contain;
  transition-property: opacity, display, overlay;
  transition-duration: 0.18s;
  transition-timing-function: ease-out;
  transition-behavior: allow-discrete;
}
dialog[data-search-dialog]::backdrop {
  background: color-mix(in oklab, var(--c-bg-sunken) 78%, transparent);
  -webkit-backdrop-filter: blur(4px);
  backdrop-filter: blur(4px);
  overflow: hidden;              /* ::backdrop 默认不是滚动容器，加 overflow 才吃 overscroll-behavior */
  overscroll-behavior: contain;
  opacity: 0;
  transition-property: opacity, display, overlay;
  transition-duration: 0.18s;
  transition-timing-function: ease-out;
  transition-behavior: allow-discrete;
}
dialog[data-search-dialog] [data-search-panel] {
  transition: transform 0.18s ease-out;
}
/* 打开态：:where(:not([data-closing])) 让降级路径能在元素仍留在 top-layer 时播退出 */
dialog[data-search-dialog][open]:where(:not([data-closing])) {
  opacity: 1;
}
dialog[data-search-dialog][open]:where(:not([data-closing]))::backdrop {
  opacity: 1;
}
@starting-style {
  dialog[data-search-dialog][open] {
    opacity: 0;
  }
  dialog[data-search-dialog][open]::backdrop {
    opacity: 0;
  }
}
@media (prefers-reduced-motion: no-preference) {
  dialog[data-search-dialog] [data-search-panel] {
    transform: scale(0.97) translateY(-10px);
  }
  dialog[data-search-dialog][open]:where(:not([data-closing])) [data-search-panel] {
    transform: none;
  }
  @starting-style {
    dialog[data-search-dialog][open] [data-search-panel] {
      transform: scale(0.97) translateY(-10px);
    }
  }
}
@media (prefers-reduced-motion: reduce) {
  /* 位移只存在于 no-preference 分支；这里再把淡入压到极短（全局 CSS 还会再夹一次） */
  dialog[data-search-dialog],
  dialog[data-search-dialog]::backdrop {
    transition-duration: 0.1s;
  }
}
`;

let displayTransitionCache: boolean | undefined;

/**
 * 探测「离散 display 过渡」是否真的生效。
 * 不能只看 CSS.supports：Firefox 会解析 allow-discrete 却不实现（bug 1882408），
 * 于是退出时元素直接消失，动画看不到。
 */
function canTransitionDisplay(): boolean {
  if (displayTransitionCache !== undefined) return displayTransitionCache;
  if (!window.CSS?.supports?.('transition-behavior', 'allow-discrete') || !document.body)
    return false;
  const probe = document.createElement('div');
  // 这里故意用 transition 简写：不解析 allow-discrete 的浏览器会丢掉整条声明，display:none 立即生效
  probe.style.cssText = 'transition: display 1s allow-discrete !important; display: block;';
  document.body.appendChild(probe);
  getComputedStyle(probe).display;
  probe.style.display = 'none';
  displayTransitionCache = getComputedStyle(probe).display === 'block';
  probe.remove();
  return displayTransitionCache;
}

/** overlay 与离散 display 都能过渡时，退出动画可以完全交给 CSS，不需要 JS 兜底。 */
function supportsTopLayerExit(): boolean {
  return !!window.CSS?.supports?.('overlay', 'auto') && canTransitionDisplay();
}

/**
 * 关闭对话框并保证退出动画可见：
 * 支持的浏览器直接 close()（CSS 让元素留在 top-layer 播完淡出）；
 * 其余浏览器先打 data-closing 触发退出过渡，等动画结束再 close()。
 */
async function animateCloseDialog(dialog: HTMLDialogElement): Promise<void> {
  if (!dialog.open) return;
  if (supportsTopLayerExit()) {
    dialog.close();
    return;
  }
  dialog.setAttribute('data-closing', '');
  const animations = dialog.getAnimations({ subtree: true });
  if (animations.length) {
    await Promise.race([
      Promise.allSettled(animations.map((a) => a.finished)),
      new Promise((resolve) => setTimeout(resolve, 2000)), // 兜底：动画异常不结束也能关闭
    ]);
  }
  if (!dialog.hasAttribute('data-closing')) return; // 动画期间被 ⌘K 重新打开
  dialog.removeAttribute('data-closing');
  dialog.close();
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
 *
 * 模态层交给原生 <dialog>：焦点陷阱、Esc / 平台返回手势、top-layer、
 * light dismiss 与关闭后的焦点恢复都由浏览器负责，组件只管状态与动画时序。
 */
export default function SearchDialog({ initialOpen = false }: Props) {
  const [open, setOpen] = useState(initialOpen);
  const [query, setQuery] = useState('');
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const results = useMemo(() => search(entries, query), [entries, query]);

  // ⌘K 只在挂载后由此处接管（未挂载时由 launcher 处理，避免双重响应）。
  // 打开状态下再按 ⌘K 即为关闭；Esc 不在此处理，走原生 cancel。
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
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

  // state → 原生 dialog 的唯一同步点。组件不再随开合卸载，
  // 因此退出动画播完前元素仍在 DOM 里，不存在「先卸载再动画」的时序问题。
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!open) {
      void animateCloseDialog(dialog);
      return;
    }
    dialog.removeAttribute('data-closing');
    if (!dialog.open) dialog.showModal();
    setCursor(0);
    // showModal 已把焦点收进对话框，这里显式落到输入框以保持原有手感
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);

  // 首次展开才拉索引：保持「按需」这一既有契约；失败后下次展开会重试
  useEffect(() => {
    if (!open || entries.length) return;
    setLoading(true);
    fetch('/search-index.json')
      .then((r) => r.json())
      .then((d: Entry[]) => setEntries(d))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [open, entries.length]);

  /** Esc / 平台返回手势：拦下原生的即时关闭，改走带退出动画的关闭路径。 */
  const onCancel = (e: React.SyntheticEvent<HTMLDialogElement>) => {
    // 连续按 Esc 且中间无用户激活时，浏览器可能把 cancel 置为不可取消，此时交给原生
    if (e.cancelable) e.preventDefault();
    setOpen(false);
  };

  /** 原生 light dismiss（closedby="any"）直接关闭后回写 state，否则 ⌘K 的开合会失同步。 */
  const onClose = () => setOpen(false);

  /**
   * light dismiss：dialog 盒铺满视口、面板是其内部子元素，
   * 因此 event.target 落在 dialog 自身只可能是面板之外，即旧版背板按钮负责的那块区域。
   * 注意不能依赖 closedby="any"：盒铺满视口后点击永远落在盒内，原生 light dismiss 不会触发，
   * 所以这条 target 判定在所有浏览器上都是主路径（原生若真触发 close，onClose 会同步 state）。
   */
  const onDialogClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === e.currentTarget) setOpen(false);
  };

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

  // 对话框常驻 DOM（关闭态 display:none），退出动画才有地方播完；
  // 焦点陷阱 / 滚动锁定 / Esc 已交给原生 dialog，无需再随开合挂载卸载。
  return (
    <>
      <style>{DIALOG_CSS}</style>
      <dialog
        ref={dialogRef}
        data-search-dialog=""
        closedby="any"
        aria-label="搜索文档"
        onCancel={onCancel}
        onClose={onClose}
        onClick={onDialogClick}
      >
        <div
          data-search-panel=""
          className="flex max-h-[68vh] w-full max-w-[42rem] flex-col overflow-hidden rounded-[var(--radius-panel)] border shadow-[var(--shadow-pop)]"
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
              <li
                className="px-3 py-10 text-center text-sm"
                style={{ color: 'var(--c-fg-subtle)' }}
              >
                输入关键词开始搜索全部文档
              </li>
            )}
            {!loading && query && results.length === 0 && (
              <li
                className="px-3 py-10 text-center text-sm"
                style={{ color: 'var(--c-fg-subtle)' }}
              >
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
      </dialog>
    </>
  );
}
