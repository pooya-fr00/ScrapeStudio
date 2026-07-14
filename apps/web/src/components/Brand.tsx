import { PROJECT_NAME, type SupportedLocale } from '@scrapestudio/shared';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { localizedPath } from '../app/routes';

export function Brand({ locale }: { locale: SupportedLocale }) {
  const { t } = useTranslation();

  return (
    <Link className="brand" to={localizedPath(locale, 'home')}>
      <svg aria-hidden="true" className="brand-mark" viewBox="0 0 40 40">
        <rect height="30" rx="9" width="30" x="5" y="5" />
        <path d="M13 14h14M13 20h9M13 26h6" />
        <circle cx="27" cy="26" r="3" />
      </svg>
      <span className="brand-copy">
        <strong>{PROJECT_NAME}</strong>
        <span className="brand-tagline">{t('brand.tagline')}</span>
      </span>
    </Link>
  );
}
