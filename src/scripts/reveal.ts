// 滚动入场：为 .reveal 元素在进入视口时添加 .is-in。
// 支持 CSS 滚动驱动动画的浏览器由 global.css 的 @supports 分支接管（位置驱动、无需 JS），
// 这里只服务不支持 animation-timeline: view() 的浏览器，用 IntersectionObserver 触发一次 transition。
// 尊重 prefers-reduced-motion：直接显示，不做位移。
const reduced = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// 与 global.css 里 @supports 的判据保持一致，避免两套入场效果同时生效。
const cssScrollDriven = () =>
  typeof CSS !== 'undefined' &&
  typeof CSS.supports === 'function' &&
  CSS.supports('(animation-timeline: view()) and (animation-range: entry)');

function initReveal() {
  if (cssScrollDriven()) return;

  const els = document.querySelectorAll<HTMLElement>('.reveal:not(.is-in)');
  if (!els.length) return;

  if (reduced() || !('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('is-in'));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      }
    },
    // threshold 0 + 负底边距：元素顶端进入视口 88% 处即触发。
    // 不用比例阈值，避免超高元素（大于视口 8 倍）永远达不到比例而不可见。
    { rootMargin: '0px 0px -12% 0px', threshold: 0 },
  );

  els.forEach((el) => io.observe(el));
}

if (document.readyState !== 'loading') initReveal();
else document.addEventListener('DOMContentLoaded', initReveal);
