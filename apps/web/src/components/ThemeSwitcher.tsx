import { Check, ChevronDown, Monitor, Moon, Sun, type LucideIcon } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useTheme, type ThemePreference } from '../app/theme';

const THEME_OPTIONS: Array<{ icon: LucideIcon; value: ThemePreference }> = [
  { icon: Sun, value: 'light' },
  { icon: Moon, value: 'dark' },
  { icon: Monitor, value: 'system' },
];

export function ThemeSwitcher() {
  const { t } = useTranslation();
  const { preference, resolvedTheme, setPreference } = useTheme();
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(() =>
    THEME_OPTIONS.findIndex((option) => option.value === preference),
  );
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const listboxId = useId();
  const currentOption = THEME_OPTIONS.find((option) => option.value === preference);
  const ThemeIcon = currentOption?.icon ?? (resolvedTheme === 'dark' ? Moon : Sun);

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [open]);

  useEffect(() => {
    if (open) {
      optionRefs.current[activeIndex]?.focus();
    }
  }, [activeIndex, open]);

  function openMenu() {
    const nextIndex = THEME_OPTIONS.findIndex((option) => option.value === preference);
    setActiveIndex(nextIndex);
    setOpen(true);
  }

  function selectTheme(value: ThemePreference) {
    setPreference(value);
    setOpen(false);
    triggerRef.current?.focus();
  }

  function moveActive(nextIndex: number) {
    const wrappedIndex = (nextIndex + THEME_OPTIONS.length) % THEME_OPTIONS.length;
    setActiveIndex(wrappedIndex);
    optionRefs.current[wrappedIndex]?.focus();
  }

  return (
    <div className="theme-picker" ref={rootRef}>
      <button
        aria-controls={open ? listboxId : undefined}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={t('theme.current', { theme: t(`theme.${preference}`) })}
        className="theme-switcher"
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={(event) => {
          if (!open && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
            event.preventDefault();
            openMenu();
          }
        }}
        ref={triggerRef}
        type="button"
      >
        <ThemeIcon aria-hidden="true" size={17} strokeWidth={1.8} />
        <span>{t(`theme.${preference}`)}</span>
        <ChevronDown aria-hidden="true" className="theme-chevron" size={14} />
      </button>

      {open ? (
        <div aria-label={t('theme.label')} className="theme-menu" id={listboxId} role="listbox">
          <div className="theme-menu-heading">
            <span>{t('theme.label')}</span>
            <small>{t('theme.hint')}</small>
          </div>
          {THEME_OPTIONS.map(({ icon: OptionIcon, value }, index) => (
            <button
              aria-selected={preference === value}
              className="theme-option"
              key={value}
              onClick={() => selectTheme(value)}
              onFocus={() => setActiveIndex(index)}
              onKeyDown={(event) => {
                if (event.key === 'ArrowDown') {
                  event.preventDefault();
                  moveActive(activeIndex + 1);
                } else if (event.key === 'ArrowUp') {
                  event.preventDefault();
                  moveActive(activeIndex - 1);
                } else if (event.key === 'Home') {
                  event.preventDefault();
                  moveActive(0);
                } else if (event.key === 'End') {
                  event.preventDefault();
                  moveActive(THEME_OPTIONS.length - 1);
                } else if (event.key === 'Escape') {
                  event.preventDefault();
                  setOpen(false);
                  triggerRef.current?.focus();
                }
              }}
              ref={(element) => {
                optionRefs.current[index] = element;
              }}
              role="option"
              tabIndex={activeIndex === index ? 0 : -1}
              type="button"
            >
              <span className="theme-option-icon">
                <OptionIcon aria-hidden="true" size={18} />
              </span>
              <span className="theme-option-copy">
                <strong>{t(`theme.${value}`)}</strong>
                <small>{t(`theme.${value}Description`)}</small>
              </span>
              <span className="theme-option-check">
                {preference === value ? <Check aria-hidden="true" size={16} /> : null}
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
