import { AlertCircle, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { WorkspaceRequestError } from '../../features/scrape/api';

export function WorkspaceError({
  error,
  onRetry,
}: {
  error: WorkspaceRequestError;
  onRetry: () => void;
}) {
  const { i18n, t } = useTranslation();
  const number = new Intl.NumberFormat(i18n.resolvedLanguage);

  return (
    <section aria-live="assertive" className="workspace-error" data-reveal="up" role="alert">
      <AlertCircle aria-hidden="true" />
      <div>
        <p className="error-kicker">{t('workspace.error.kicker')}</p>
        <h2>{t('workspace.error.title')}</h2>
        <p>{t(`workspace.error.codes.${error.code}`)}</p>
        {error.retryAfterSeconds !== undefined ? (
          <p className="error-detail">
            {t('workspace.error.retryAfter', {
              seconds: number.format(error.retryAfterSeconds),
            })}
          </p>
        ) : null}
        {error.requestId ? (
          <p className="error-request-id" dir="ltr">
            {t('workspace.error.requestId', { requestId: error.requestId })}
          </p>
        ) : null}
        <button className="button button-secondary" onClick={onRetry} type="button">
          <RotateCcw aria-hidden="true" />
          {t('workspace.error.tryAgain')}
        </button>
      </div>
    </section>
  );
}
