import {
  candidateToRecipe,
  type CustomRecipeDraft,
  type RepeatedStructureCandidate,
} from '@scrapestudio/extraction-core';
import { AlertTriangle, CheckCircle2, RefreshCw, ScanSearch, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { SmartDetectionResult } from '../../features/smart-detection/detect';

export type SmartDetector = (
  html: string,
  finalUrl: string,
  signal: AbortSignal,
) => Promise<SmartDetectionResult>;

type DetectionState =
  | { status: 'analyzing' }
  | { result: SmartDetectionResult; status: 'complete' }
  | { status: 'error' };

export function SmartDetectionPanel({
  detect,
  finalUrl,
  html,
  onUse,
}: {
  detect: SmartDetector;
  finalUrl: string;
  html: string;
  onUse: (recipe: CustomRecipeDraft) => void;
}) {
  const { i18n, t } = useTranslation();
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<DetectionState>({ status: 'analyzing' });
  const locale = i18n.resolvedLanguage ?? i18n.language;
  const number = useMemo(() => new Intl.NumberFormat(locale), [locale]);
  const percent = useMemo(
    () => new Intl.NumberFormat(locale, { maximumFractionDigits: 0, style: 'percent' }),
    [locale],
  );

  useEffect(() => {
    const controller = new AbortController();
    detect(html, finalUrl, controller.signal).then(
      (result) => setState({ result, status: 'complete' }),
      (cause: unknown) => {
        if (!(cause instanceof Error && cause.name === 'AbortError')) setState({ status: 'error' });
      },
    );
    return () => controller.abort();
  }, [attempt, detect, finalUrl, html]);

  function retry() {
    setState({ status: 'analyzing' });
    setAttempt((value) => value + 1);
  }

  if (state.status === 'analyzing') {
    return (
      <section aria-live="polite" className="smart-detection-panel is-analyzing" role="status">
        <span className="smart-detection-icon">
          <ScanSearch aria-hidden="true" />
        </span>
        <div>
          <p>{t('workspace.smart.kicker')}</p>
          <h2>{t('workspace.smart.analyzingTitle')}</h2>
          <span>{t('workspace.smart.analyzingDescription')}</span>
        </div>
      </section>
    );
  }

  if (state.status === 'error') {
    return (
      <section className="smart-detection-panel smart-empty-state">
        <AlertTriangle aria-hidden="true" />
        <div>
          <h2>{t('workspace.smart.errorTitle')}</h2>
          <p>{t('workspace.smart.errorDescription')}</p>
          <button className="icon-text-button" onClick={retry} type="button">
            <RefreshCw aria-hidden="true" />
            {t('workspace.smart.retry')}
          </button>
        </div>
      </section>
    );
  }

  const { result } = state;
  if (result.candidates.length === 0) {
    const timedOut = result.fallbackReason === 'timeout';
    return (
      <section className="smart-detection-panel smart-empty-state">
        {timedOut ? <AlertTriangle aria-hidden="true" /> : <ScanSearch aria-hidden="true" />}
        <div>
          <h2>{t(timedOut ? 'workspace.smart.timeoutTitle' : 'workspace.smart.emptyTitle')}</h2>
          <p>
            {t(
              timedOut ? 'workspace.smart.timeoutDescription' : 'workspace.smart.emptyDescription',
            )}
          </p>
          {timedOut ? (
            <button className="icon-text-button" onClick={retry} type="button">
              <RefreshCw aria-hidden="true" />
              {t('workspace.smart.retry')}
            </button>
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="smart-detection-title" className="smart-detection-panel">
      <div className="smart-detection-heading">
        <span className="smart-detection-icon">
          <Sparkles aria-hidden="true" />
        </span>
        <div>
          <p>{t('workspace.smart.kicker')}</p>
          <h2 id="smart-detection-title">{t('workspace.smart.title')}</h2>
          <span>{t('workspace.smart.description')}</span>
        </div>
        <strong>
          {t('workspace.smart.candidateCount', { count: number.format(result.candidates.length) })}
        </strong>
      </div>

      {result.execution === 'fallback' ? (
        <p className="smart-fallback-note">{t('workspace.smart.fallback')}</p>
      ) : null}
      {result.snapshotTruncated ? (
        <p className="smart-limit-note">
          {t('workspace.smart.truncated', { count: number.format(result.inspectedNodes) })}
        </p>
      ) : null}

      <div className="smart-candidate-list">
        {result.candidates.map((candidate, index) => (
          <CandidateCard
            candidate={candidate}
            index={index}
            key={`${candidate.selector}-${index}`}
            number={number}
            onUse={() => onUse(candidateToRecipe(candidate))}
            percent={percent}
          />
        ))}
      </div>
      <p className="smart-review-note">{t('workspace.smart.review')}</p>
    </section>
  );
}

function CandidateCard({
  candidate,
  index,
  number,
  onUse,
  percent,
}: {
  candidate: RepeatedStructureCandidate;
  index: number;
  number: Intl.NumberFormat;
  onUse: () => void;
  percent: Intl.NumberFormat;
}) {
  const { t } = useTranslation();
  return (
    <article className="smart-candidate-card">
      <div className="smart-candidate-summary">
        <span className="smart-candidate-rank">{number.format(index + 1)}</span>
        <div>
          <h3>
            {t('workspace.smart.candidateTitle', { count: number.format(candidate.itemCount) })}
          </h3>
          <code dir="ltr">{candidate.selector}</code>
        </div>
        <span className="smart-confidence">
          <CheckCircle2 aria-hidden="true" />
          {t('workspace.smart.confidence', { value: percent.format(candidate.confidence / 100) })}
        </span>
      </div>
      <div className="smart-reasons" aria-label={t('workspace.smart.reasonsLabel')}>
        {candidate.reasons.map((reason) => (
          <span key={reason}>{t(`workspace.smart.reasons.${reason}`)}</span>
        ))}
      </div>
      <div className="smart-fields">
        <strong>{t('workspace.smart.fieldsTitle')}</strong>
        <div>
          {candidate.suggestedFields.map((field) => (
            <span key={`${field.name}-${field.selector}`}>
              <b>{t(`workspace.smart.fields.${field.name}`)}</b>
              <code dir="ltr">{field.selector}</code>
            </span>
          ))}
        </div>
      </div>
      <button className="button button-secondary" onClick={onUse} type="button">
        {t('workspace.smart.useSuggestion')}
      </button>
    </article>
  );
}
