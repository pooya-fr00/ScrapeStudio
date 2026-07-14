import { CheckCircle2, FlaskConical } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { WorkspaceRun } from '../../features/scrape/types';

function formatBytes(value: number, locale: string): string {
  const number = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
  return value < 1_024 ? `${number.format(value)} B` : `${number.format(value / 1_024)} KiB`;
}

export function ResultSummary({ run }: { run: WorkspaceRun }) {
  const { i18n, t } = useTranslation();
  const locale = i18n.resolvedLanguage ?? i18n.language;
  const date = new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(run.page.fetchedAt));
  const number = new Intl.NumberFormat(locale);

  return (
    <section aria-labelledby="result-summary-title" className="result-summary" data-reveal="up">
      <div className="result-success-icon">
        {run.source === 'demo' ? (
          <FlaskConical aria-hidden="true" />
        ) : (
          <CheckCircle2 aria-hidden="true" />
        )}
      </div>
      <div className="result-summary-copy">
        <p>
          {run.source === 'demo'
            ? t('workspace.result.demoKicker')
            : t('workspace.result.successKicker')}
        </p>
        <h2 id="result-summary-title">{t('workspace.result.title')}</h2>
        <dl className="result-facts">
          <div>
            <dt>{t('workspace.result.finalUrl')}</dt>
            <dd dir="ltr" title={run.page.finalUrl}>
              {run.page.finalUrl}
            </dd>
          </div>
          <div>
            <dt>{t('workspace.result.status')}</dt>
            <dd>{number.format(run.page.status)}</dd>
          </div>
          <div>
            <dt>{t('workspace.result.size')}</dt>
            <dd>{formatBytes(run.page.byteLength, locale)}</dd>
          </div>
          <div>
            <dt>{t('workspace.result.fetchedAt')}</dt>
            <dd>{date}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
