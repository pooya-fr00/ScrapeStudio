import type { SupportedLocale } from '@scrapestudio/shared';
import { ArrowUpRight, Code2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { localizedPath, type AppRoute } from '../app/routes';
import { Brand } from './Brand';

const footerNavigation: ReadonlyArray<{ label: string; route: AppRoute }> = [
  { label: 'navigation.workspace', route: 'workspace' },
  { label: 'navigation.tools', route: 'tools' },
  { label: 'navigation.playground', route: 'playground' },
  { label: 'navigation.recipes', route: 'recipes' },
  { label: 'navigation.docs', route: 'docs' },
  { label: 'footer.about', route: 'about' },
];

const OWNER_GITHUB_URL = 'https://github.com/pooya-fr00';

export function AppFooter({ locale }: { locale: SupportedLocale }) {
  const { t } = useTranslation();
  const year = new Intl.NumberFormat(locale === 'fa' ? 'fa-IR' : 'en', {
    useGrouping: false,
  }).format(new Date().getFullYear());

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-main">
          <div className="footer-brand-column">
            <Brand locale={locale} />
            <p className="footer-summary">{t('footer.summary')}</p>
            <span className="footer-open-source">{t('footer.openSourceNote')}</span>
          </div>

          <nav aria-label={t('footer.navigationLabel')} className="footer-navigation">
            <strong>{t('footer.exploreTitle')}</strong>
            <div>
              {footerNavigation.map(({ label, route }) => (
                <Link key={route} to={localizedPath(locale, route)}>
                  {t(label)}
                </Link>
              ))}
            </div>
          </nav>

          <section aria-labelledby="footer-owner-title" className="footer-owner-card">
            <span>{t('footer.madeBy')}</span>
            <h2 id="footer-owner-title">{t('footer.ownerName')}</h2>
            <p>{t('footer.ownerDescription')}</p>
            <a href={OWNER_GITHUB_URL} rel="noreferrer" target="_blank">
              <Code2 aria-hidden="true" />
              {t('footer.github')}
              <ArrowUpRight aria-hidden="true" className="footer-external-icon" />
            </a>
          </section>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">{t('footer.copyright', { year })}</p>
          <p>{t('footer.responsibleUse')}</p>
        </div>
      </div>
    </footer>
  );
}
