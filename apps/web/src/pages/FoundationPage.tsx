import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { useLocale } from '../app/use-locale';
import { localizedPath } from '../app/routes';
import { PageIntro } from '../components/PageIntro';
import { phaseNineContent, TOOL_GUIDE_SLUGS } from '../features/public-content/content';

type FoundationPageName = 'workspace' | 'tools' | 'recipes' | 'docs';

export function FoundationPage({ page }: { page: FoundationPageName }) {
  const { t } = useTranslation();
  const locale = useLocale();

  return (
    <>
      <PageIntro
        badge={t(`pages.${page}.badge`)}
        description={t(`pages.${page}.description`)}
        homePath={localizedPath(locale, page === 'tools' ? 'workspace' : 'home')}
        title={t(`pages.${page}.title`)}
        {...(page === 'tools' ? { actionLabel: t('actions.tryWorkspace') } : {})}
        visualItems={[
          t(`pages.${page}.highlights.first`),
          t(`pages.${page}.highlights.second`),
          t(`pages.${page}.highlights.third`),
        ]}
        visualTitle={t(`pages.${page}.visualTitle`)}
      />
      {page === 'tools' ? (
        <section
          aria-label={locale === 'fa' ? 'راهنمای ابزارهای استخراج' : 'Extraction tool guides'}
          className="page-container tool-guide-directory"
        >
          {TOOL_GUIDE_SLUGS.map((slug) => {
            const guide = phaseNineContent[locale].tools[slug];
            const DirectionIcon = locale === 'fa' ? ArrowLeft : ArrowRight;
            return (
              <article data-reveal="up" key={slug}>
                <h2>{guide.title}</h2>
                <p>{guide.summary}</p>
                <Link to={`${localizedPath(locale, 'tools')}/${slug}`}>
                  {phaseNineContent[locale].common.openGuide}
                  <DirectionIcon aria-hidden="true" />
                </Link>
              </article>
            );
          })}
        </section>
      ) : null}
    </>
  );
}
