import { useTranslation } from 'react-i18next';

import { useLocale } from '../app/use-locale';
import { localizedPath } from '../app/routes';
import { PageIntro } from '../components/PageIntro';

export function NotFoundPage() {
  const { t } = useTranslation();
  const locale = useLocale();

  return (
    <PageIntro
      badge={t('notFound.eyebrow')}
      description={t('notFound.description')}
      homePath={localizedPath(locale, 'home')}
      title={t('notFound.title')}
    />
  );
}
