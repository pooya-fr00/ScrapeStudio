import { Check, LoaderCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export type WorkspaceProgressPhase = 'analyzing' | 'fetching';

export function WorkspaceProgress({ phase }: { phase: WorkspaceProgressPhase }) {
  const { t } = useTranslation();
  const fetchingComplete = phase === 'analyzing';

  return (
    <section
      aria-atomic="true"
      aria-live="polite"
      className="workspace-progress"
      data-reveal="up"
      role="status"
    >
      <div className="progress-spinner" aria-hidden="true">
        <LoaderCircle />
      </div>
      <div>
        <p className="progress-kicker">{t('workspace.progress.kicker')}</p>
        <h2>{t(`workspace.progress.${phase}Title`)}</h2>
        <p>{t(`workspace.progress.${phase}Description`)}</p>
      </div>
      <ol className="progress-steps">
        <li className={fetchingComplete ? 'is-complete' : 'is-current'}>
          <span>{fetchingComplete ? <Check aria-hidden="true" /> : '1'}</span>
          {t('workspace.progress.fetchStep')}
        </li>
        <li className={phase === 'analyzing' ? 'is-current' : ''}>
          <span>2</span>
          {t('workspace.progress.analyzeStep')}
        </li>
      </ol>
    </section>
  );
}
