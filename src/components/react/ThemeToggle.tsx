import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'void-theme';

function apply(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.style.colorScheme = theme;
}

function systemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = (localStorage.getItem(STORAGE_KEY) as Theme | null) ?? systemTheme();
    setTheme(stored);
    apply(stored);
    setMounted(true);
  }, []);

  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    apply(next);
    localStorage.setItem(STORAGE_KEY, next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={mounted ? (theme === 'dark' ? '切换到浅色主题' : '切换到深色主题') : '切换主题'}
      title={mounted ? (theme === 'dark' ? '浅色主题' : '深色主题') : '切换主题'}
      className={`relative grid size-9 place-items-center rounded-lg border transition-colors hover:bg-[color-mix(in_oklab,var(--c-fg)_7%,transparent)] ${className}`}
      style={{ borderColor: 'var(--c-line)', color: 'var(--c-fg-muted)' }}
    >
      <svg
        className={`size-[1.05rem] ${mounted ? '' : 'opacity-0'}`}
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {theme === 'dark' ? (
          <path d="M16.2 11.6A6.6 6.6 0 0 1 8.4 3.8a6.8 6.8 0 1 0 7.8 7.8Z" />
        ) : (
          <>
            <circle cx="10" cy="10" r="3.6" />
            <path d="M10 2.6v1.8M10 15.6v1.8M2.6 10h1.8M15.6 10h1.8M4.8 4.8l1.3 1.3M13.9 13.9l1.3 1.3M15.2 4.8l-1.3 1.3M6.1 13.9l-1.3 1.3" />
          </>
        )}
      </svg>
    </button>
  );
}
