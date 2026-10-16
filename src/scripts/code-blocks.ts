/**
 * 统一增强文档中的代码块：
 * 1. 把 MDX 围栏代码块（<pre class="astro-code">）包装成 .code-block 卡片
 * 2. 为所有代码块注入「复制」按钮
 * 页面切换（A5 视图过渡）后会重新执行。
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

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
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
  button.addEventListener('click', async () => {
    await copyText(pre.innerText.replace(/\n$/, ''));
    button.setAttribute('data-copied', '');
    button.innerHTML = `${DONE_ICON}<span>${DONE_LABEL}</span>`;
    clearTimeout(timer);
    timer = setTimeout(() => {
      button.removeAttribute('data-copied');
      button.innerHTML = `${COPY_ICON}<span>${COPY_LABEL}</span>`;
    }, 1600);
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
