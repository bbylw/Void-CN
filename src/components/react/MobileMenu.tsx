import { useEffect, useState } from 'react';
import SearchDialog from './SearchDialog';

type Link = { title: string; href: string };

export default function MobileMenu({ links }: { links: Link[] }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="打开菜单"
        className="grid size-9 place-items-center rounded-lg border md:hidden"
        style={{ borderColor: 'var(--c-line)', color: 'var(--c-fg-muted)' }}
      >
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.7}
          strokeLinecap="round"
          className="size-4"
          aria-hidden="true"
        >
          <path d="M3.5 6h13M3.5 10h13M3.5 14h13" />
        </svg>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[90] md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="导航菜单"
        >
          <button
            className="absolute inset-0 cursor-default"
            style={{
              background: 'color-mix(in oklab, var(--c-bg-sunken) 80%, transparent)',
              backdropFilter: 'blur(4px)',
            }}
            onClick={() => setOpen(false)}
            aria-label="关闭菜单"
            tabIndex={-1}
          />
          <div
            className="absolute inset-x-0 top-0 flex flex-col gap-5 rounded-b-[var(--radius-panel)] border-b p-5 pb-7"
            style={{ background: 'var(--c-bg)', borderColor: 'var(--c-line)' }}
          >
            <div className="flex items-center justify-between">
              <span className="eyebrow">导航</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="关闭菜单"
                className="grid size-9 place-items-center rounded-lg border"
                style={{ borderColor: 'var(--c-line)', color: 'var(--c-fg-muted)' }}
              >
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.7}
                  strokeLinecap="round"
                  className="size-4"
                  aria-hidden="true"
                >
                  <path d="m5 5 10 10M15 5 5 15" />
                </svg>
              </button>
            </div>

            <div className="lg:hidden">
              <SearchDialog />
            </div>

            <nav className="flex flex-col" aria-label="移动端导航">
              {links.map((l, i) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="flex items-baseline gap-3 border-b py-3.5 text-[1.05rem] font-medium"
                  style={{ borderColor: 'var(--c-line)', color: 'var(--c-fg)' }}
                >
                  <span
                    className="font-mono text-[0.68rem]"
                    style={{ color: 'var(--c-fg-subtle)' }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {l.title}
                </a>
              ))}
            </nav>

            <a
              href="/docs/quickstart"
              onClick={() => setOpen(false)}
              className="btn btn-primary mt-1 w-full"
            >
              快速开始
            </a>
          </div>
        </div>
      )}
    </>
  );
}
