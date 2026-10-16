/**
 * 站内搜索按需加载器。
 *
 * 首屏只有原生触发按钮（SearchTrigger.astro），不包含任何 React 代码；
 * 当用户点击触发按钮或按下 ⌘K 时，才动态载入 SearchDialog（连同 react-dom）
 * 并挂载为全局唯一实例。后续交互通过 `search:open` 自定义事件展开对话框。
 *
 * 每个页面通过 SiteHeader 的 <script> 引入一次，监听使用事件委托，
 * 对后续插入 DOM 的触发按钮（如移动菜单抽屉内的按钮）同样有效。
 */

let booting: Promise<void> | null = null;
let mounted = false;

async function boot() {
  booting ??= (async () => {
    const [{ createElement }, { createRoot }, { default: SearchDialog }] = await Promise.all([
      import('react'),
      import('react-dom/client'),
      import('../components/react/SearchDialog'),
    ]);
    const host = document.createElement('div');
    document.body.append(host);
    createRoot(host).render(createElement(SearchDialog, { initialOpen: true }));
    mounted = true;
  })();
  await booting;
}

function openDialog() {
  if (mounted) {
    window.dispatchEvent(new CustomEvent('search:open'));
    return;
  }
  void boot();
}

function initSearchLauncher() {
  document.addEventListener('click', (e) => {
    const trigger = (e.target as HTMLElement | null)?.closest('[data-search-trigger]');
    if (!trigger) return;
    e.preventDefault();
    openDialog();
  });

  window.addEventListener('keydown', (e) => {
    // 已挂载后由组件自行处理 ⌘K 切换，避免双重响应
    if (mounted) return;
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      openDialog();
    }
  });
}

initSearchLauncher();
