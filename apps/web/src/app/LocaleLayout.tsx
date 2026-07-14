import type { SupportedLocale } from '@scrapestudio/shared';
import { useLayoutEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, Outlet, useLocation, useParams } from 'react-router';

import { AppFooter } from '../components/AppFooter';
import { AppHeader } from '../components/AppHeader';
import { i18n } from '../i18n';
import { getLocaleDirection, isSupportedLocale, persistPreferredLocale } from './locale';
import { LocaleProvider } from './LocaleProvider';
import { useScrollReveal } from './use-scroll-reveal';

function LocalizedShell({ locale }: { locale: SupportedLocale }) {
  const { t } = useTranslation();
  const location = useLocation();
  const languageReady = i18n.resolvedLanguage === locale;
  const initialPath = useRef(location.pathname);
  useScrollReveal(location.pathname, languageReady);

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.add('route-scroll-reset');
    window.scrollTo(0, 0);
    root.classList.remove('route-scroll-reset');
  }, [location.pathname]);

  useLayoutEffect(() => {
    if (!languageReady || initialPath.current === location.pathname) {
      return;
    }

    document.querySelector<HTMLElement>('#main-content')?.focus({ preventScroll: true });
  }, [languageReady, location.pathname]);

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.lang = locale;
    root.dir = getLocaleDirection(locale);
    persistPreferredLocale(locale);

    if (i18n.resolvedLanguage !== locale) {
      void i18n.changeLanguage(locale);
    }
  }, [locale]);

  useLayoutEffect(() => {
    if (!languageReady) {
      return;
    }

    document.title = t('meta.title');
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', t('meta.description'));
  }, [languageReady, t]);

  if (!languageReady) {
    return null;
  }

  return (
    <LocaleProvider locale={locale}>
      <div className="app-root">
        <a className="skip-link" href="#main-content">
          {t('a11y.skipToContent')}
        </a>
        <AppHeader locale={locale} />
        <main id="main-content" tabIndex={-1}>
          <Outlet />
        </main>
        <AppFooter locale={locale} />
      </div>
    </LocaleProvider>
  );
}

export function LocaleLayout() {
  const { locale } = useParams();

  if (!isSupportedLocale(locale)) {
    return <Navigate replace to="/en" />;
  }

  return <LocalizedShell locale={locale} />;
}
