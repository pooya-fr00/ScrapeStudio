import type { SupportedLocale } from '@scrapestudio/shared';
import { Menu, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';

import { Brand } from './Brand';
import { LanguageSwitcher } from './LanguageSwitcher';
import { NavigationLinks } from './NavigationLinks';
import { ThemeSwitcher } from './ThemeSwitcher';

export function AppHeader({ locale }: { locale: SupportedLocale }) {
  const { t } = useTranslation();
  const location = useLocation();
  const [openForPath, setOpenForPath] = useState<string | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const menuOpen = openForPath === location.pathname;
  const closeMenu = useCallback(() => {
    setOpenForPath(null);
    menuButtonRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!menuOpen) {
      return undefined;
    }

    const backgroundRegions = [
      document.querySelector<HTMLElement>('#main-content'),
      document.querySelector<HTMLElement>('.site-footer'),
    ].filter((region): region is HTMLElement => region !== null);
    document.body.classList.add('mobile-menu-open');
    for (const region of backgroundRegions) {
      region.inert = true;
    }
    panelRef.current?.querySelector<HTMLElement>('a, button, select')?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMenu();
      } else if (event.key === 'Tab') {
        const focusable = Array.from(
          panelRef.current?.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
          ) ?? [],
        ).filter((element) => !element.hasAttribute('hidden'));
        const first = focusable[0];
        const last = focusable.at(-1);

        if (!first || !last) {
          return;
        }

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.classList.remove('mobile-menu-open');
      for (const region of backgroundRegions) {
        region.inert = false;
      }
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeMenu, menuOpen]);

  return (
    <header className="site-header">
      <div className="header-inner">
        <Brand locale={locale} />
        <div className="desktop-navigation">
          <NavigationLinks locale={locale} />
        </div>
        <div className="header-controls">
          <div className="desktop-controls">
            <LanguageSwitcher locale={locale} />
            <ThemeSwitcher />
          </div>
          <button
            aria-controls="mobile-navigation"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? t('actions.closeMenu') : t('actions.openMenu')}
            className="menu-button"
            onClick={() => setOpenForPath(menuOpen ? null : location.pathname)}
            ref={menuButtonRef}
            type="button"
          >
            {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div className="mobile-nav-layer">
          <button
            aria-label={t('actions.closeMenu')}
            className="mobile-nav-backdrop"
            onClick={closeMenu}
            type="button"
          />
          <aside
            aria-label={t('mobile.menuTitle')}
            aria-modal="true"
            className="mobile-nav-panel"
            id="mobile-navigation"
            ref={panelRef}
            role="dialog"
          >
            <div className="mobile-nav-heading">
              <Brand locale={locale} />
              <button
                aria-label={t('actions.closeMenu')}
                className="icon-button"
                onClick={closeMenu}
                type="button"
              >
                <X aria-hidden="true" size={20} />
              </button>
            </div>
            <div className="mobile-nav-intro">
              <span>{t('mobile.menuTitle')}</span>
              <p>{t('mobile.menuDescription')}</p>
            </div>
            <NavigationLinks locale={locale} mobile />
            <div className="mobile-controls">
              <LanguageSwitcher locale={locale} />
              <ThemeSwitcher />
            </div>
            <small className="mobile-local-note">{t('mobile.localNote')}</small>
          </aside>
        </div>
      ) : null}
    </header>
  );
}
