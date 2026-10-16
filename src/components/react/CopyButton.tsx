import { useCallback, useEffect, useRef, useState } from 'react';

type Props = {
  value: string;
  label?: string;
  className?: string;
  /** 仅图标按钮 */
  iconOnly?: boolean;
};

export default function CopyButton({
  value,
  label = '复制',
  className = '',
  iconOnly = false,
}: Props) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = value;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1600);
  }, [value]);

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? '已复制' : label}
      title={copied ? '已复制到剪贴板' : label}
      className={`inline-flex items-center justify-center gap-1.5 rounded-md border font-medium transition-all duration-200 ${
        iconOnly ? 'size-7' : 'h-7 px-2 text-[0.7rem]'
      } ${className}`}
      style={{
        borderColor: copied
          ? 'color-mix(in oklab, var(--c-violet) 45%, transparent)'
          : 'var(--c-line)',
        background: copied
          ? 'color-mix(in oklab, var(--c-violet) 12%, transparent)'
          : 'transparent',
        color: copied ? 'var(--c-violet)' : 'var(--c-fg-subtle)',
      }}
    >
      {copied ? (
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.9}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-3.5"
          aria-hidden="true"
        >
          <path d="m4 10.5 3.5 3.5L16 5.5" />
        </svg>
      ) : (
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-3.5"
          aria-hidden="true"
        >
          <path d="M8 8V5.5A1.5 1.5 0 0 1 9.5 4h6A1.5 1.5 0 0 1 17 5.5v6a1.5 1.5 0 0 1-1.5 1.5H13M6.5 8h6a1.5 1.5 0 0 1 1.5 1.5v6A1.5 1.5 0 0 1 12.5 17h-6A1.5 1.5 0 0 1 5 15.5v-6A1.5 1.5 0 0 1 6.5 8Z" />
        </svg>
      )}
      {!iconOnly && <span>{copied ? '已复制' : label}</span>}
    </button>
  );
}
