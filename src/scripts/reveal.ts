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
    { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
  );

  els.forEach((el) => io.observe(el));
}

if (document.readyState !== 'loading') initReveal();
else document.addEventListener('DOMContentLoaded', initReveal);
