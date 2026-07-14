import type { SupportedLocale } from '@scrapestudio/shared';
import { Languages } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';

import { persistPreferredLocale } from '../app/locale';
import { replacePathLocale } from '../app/routes';

export function LanguageSwitcher({ locale }: { locale: SupportedLocale }) {
  const { i18n, t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [switching, setSwitching] = useState(false);
  const targetLocale: SupportedLocale = locale === 'en' ? 'fa' : 'en';
  const targetName = targetLocale === 'fa' ? 'فارسی' : 'English';

  const switchLanguage = async () => {
    if (switching) {
      return;
    }

    setSwitching(true);
    persistPreferredLocale(targetLocale);
    try {
      await i18n.changeLanguage(targetLocale);
      navigate({
        hash: location.hash,
        pathname: replacePathLocale(location.pathname, targetLocale),
        search: location.search,
      });
    } finally {
      setSwitching(false);
    }
  };

  return (
    <button
      aria-label={t('actions.switchLanguageTo', { language: targetName })}
      className="control-button language-switcher"
      disabled={switching}
      onClick={() => void switchLanguage()}
      type="button"
    >
      <Languages aria-hidden="true" size={17} strokeWidth={1.8} />
      <span>{targetLocale === 'fa' ? 'فا' : 'EN'}</span>
    </button>
  );
}
