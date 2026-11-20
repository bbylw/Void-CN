/**
 * 统一增强文档中的代码块：
 * 1. 把 MDX 围栏代码块（<pre class="astro-code">）包装成 .code-block 卡片
 * 2. 为所有代码块注入「复制」按钮
 * 模块加载时执行一次；监听 astro:page-load 以便将来启用视图过渡时自动重跑。
 */

const COPY_ICON = `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" class="size-3.5" aria-hidden="true"><path d="M8 8V5.5A1.5 1.5 0 0 1 9.5 4h6A1.5 1.5 0 0 1 17 5.5v6a1.5 1.5 0 0 1-1.5 1.5H13M6.5 8h6a1.5 1.5 0 0 1 1.5 1.5v6A1.5 1.5 0 0 1 12.5 17h-6A1.5 1.5 0 0 1 5 15.5v-6A1.5 1.5 0 0 1 6.5 8Z"/></svg>`;
const DONE_ICON = `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-3.5" aria-hidden="true"><path d="m4 10.5 3.5 3.5L16 5.5"/></svg>`;

const LANG_LABEL: Record<string, string> = {
  ts: 'TypeScript',
  tsx: 'TSX',
  js: 'JavaScript',
  jsx: 'JSX',
  bash: 'Shell',
  sh: 'Shell',
  shell: 'Shell',
  json: 'JSON',
  text: 'Text',
  txt: 'Text',
  css: 'CSS',
  html: 'HTML',
  xml: 'XML',
  sql: 'SQL',
  yml: 'YAML',
  yaml: 'YAML',
  toml: 'TOML',
  ini: 'INI',
  env: 'Env',
  prisma: 'Prisma',
  vue: 'Vue',
  svelte: 'Svelte',
  astro: 'Astro',
};

const COPY_LABEL = '复制';
const DONE_LABEL = '已复制';
const FAIL_LABEL = '复制失败';
const OK_MESSAGE = '已复制到剪贴板';
const FAIL_MESSAGE = '复制失败，请手动选中代码后复制';

/**
 * 全局复用的 aria-live 播报区（单个、polite）。
 * 屏幕阅读器不会可靠播报按钮内部被替换的内容，也不会可靠播报 aria-label 的变化，
 * 所以「已复制 / 复制失败」要写在这个位于按钮之外的区域里。
 * 用 sr-only（clip/position）而不是 display:none 或 visibility:hidden —— 后者会把节点
 * 移出可访问性树，导致文本不被播报。
 */
const LIVE_ID = 'code-copy-live';
let lastMessage = '';
let liveTimer: ReturnType<typeof setTimeout> | undefined;

function liveRegion(): HTMLElement | null {
  if (!document.body) return null;
  const existing = document.getElementById(LIVE_ID);
  if (existing) return existing;
  const region = document.createElement('span');
  region.id = LIVE_ID;
  region.setAttribute('role', 'status');
  region.setAttribute('aria-live', 'polite');
  region.className = 'sr-only';
  document.body.append(region);
  return region;
}

function announce(message: string) {
  const region = liveRegion();
  if (!region) return;
  let text = message;
  // VoiceOver 会跳过与上一条完全相同的文本（即使中间清空过），补一个不换行空格区分，它不会被读出来
  if (text === lastMessage) text += '\u00A0';
  lastMessage = text;
  clearTimeout(liveTimer);
  region.textContent = '';
  // 先空后写：同一帧内的清空 + 写入会被读屏合并成一次变更，rAF 保证这是一次新的播报
  requestAnimationFrame(() => {
    region.textContent = text;
  });
  // 残留的「已复制」会被读屏浏览模式重复读到，超时后清掉
  liveTimer = setTimeout(() => {
    region.textContent = '';
  }, 2500);
}

/** 返回是否复制成功：降级路径也可能失败，失败同样要让用户知道 */
async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // 非安全上下文（http）或权限被拒时的最后手段：execCommand 已废弃，但能让复制仍然可用
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch {
      ok = false;
    }
    ta.remove();
    return ok;
  }
}

function wrapFenced(pre: HTMLElement) {
  if (pre.closest('[data-code-block]')) return null;
  const lang = pre.dataset.language ?? '';
  const figure = document.createElement('figure');
  figure.className = 'code-block';
  figure.setAttribute('data-code-block', '');

  const bar = document.createElement('figcaption');
  bar.className = 'code-block__bar';
  bar.innerHTML = `<span class="code-block__title"><span style="color:var(--c-fg-subtle)">示例</span></span>
    <span class="code-block__lang">${LANG_LABEL[lang] ?? lang ?? 'Code'}</span>
    <span data-copy-slot></span>`;

  const body = document.createElement('div');
  body.className = 'code-block__body scroll-thin';

  figure.append(bar, body);
  pre.replaceWith(figure);
  body.append(pre);
  return figure;
}

function attachCopy(figure: HTMLElement) {
  const pre = figure.querySelector('pre');
  const slot = figure.querySelector<HTMLElement>('[data-copy-slot]');
  if (!pre || !slot || slot.firstChild) return;

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'code-copy';
  button.setAttribute('aria-label', COPY_LABEL);
  button.title = COPY_LABEL;
  button.innerHTML = `${COPY_ICON}<span>${COPY_LABEL}</span>`;

  let timer: ReturnType<typeof setTimeout> | undefined;
  const setLabel = (label: string, icon: string, copied: boolean) => {
    button.innerHTML = `${icon}<span>${label}</span>`;
    // 可见文本与无障碍名保持一致：不一致时读屏念出的名字与用户看到的按钮对不上
    button.setAttribute('aria-label', label);
    button.title = label;
    if (copied) button.setAttribute('data-copied', '');
    else button.removeAttribute('data-copied');
  };

  button.addEventListener('click', async () => {
    const text = pre.innerText.replace(/\n$/, '');
    if (!text) return; // 空代码块既不复制也不播报，避免无意义的噪音
    const ok = await copyText(text);
    // 重复点击清掉旧计时器重新开始；不禁用按钮 —— 复制是幂等操作，
    // 禁用会丢焦点、误报「不可用」，还会让失败后无法立刻重试。
    clearTimeout(timer);
    setLabel(ok ? DONE_LABEL : FAIL_LABEL, ok ? DONE_ICON : COPY_ICON, ok);
    announce(ok ? OK_MESSAGE : FAIL_MESSAGE);
    timer = setTimeout(() => setLabel(COPY_LABEL, COPY_ICON, false), 1600);
  });

  slot.appendChild(button);
}

/**
 * 把 Markdown 表格包进横向滚动容器。
 *
 * 表格需要 `display: block` 才能在窄屏横向滚动，但这样 thead 与 tbody
 * 会被排成匿名表格而列宽错位；包一层容器后可以恢复正常表格布局。
 */
function wrapTables() {
  document.querySelectorAll<HTMLElement>('.prose-void table:not(.api-table)').forEach((table) => {
    if (table.parentElement?.classList.contains('table-wrap')) return;
    const wrapper = document.createElement('div');
    wrapper.className = 'table-wrap';
    table.replaceWith(wrapper);
    wrapper.appendChild(table);
  });
}

export function enhanceCodeBlocks() {
  wrapTables();
  document.querySelectorAll<HTMLElement>('.prose-void pre.astro-code').forEach(wrapFenced);
  document.querySelectorAll<HTMLElement>('[data-code-block]').forEach(attachCopy);
}

enhanceCodeBlocks();
document.addEventListener('astro:page-load', enhanceCodeBlocks);
