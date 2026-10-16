// 滚动入场：为 .reveal 元素在进入视口时添加 .is-in。
// 尊重 prefers-reduced-motion：直接显示，不做位移。
const reduced = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function initReveal() {
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
