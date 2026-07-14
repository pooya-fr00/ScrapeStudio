import { LOCAL_DATA_LIMITS } from '@scrapestudio/shared';
import { History, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { LocalDataHero } from '../components/LocalDataHero';
import type { LocalHistoryEntry } from '../features/local-data/model';
import { localDataStore, type LocalDataStore } from '../features/local-data/store';

export function HistoryPage({ store = localDataStore }: { store?: LocalDataStore }) {
  const { i18n, t } = useTranslation();
  const [entries, setEntries] = useState<LocalHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmingClear, setConfirmingClear] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const locale = i18n.resolvedLanguage;
  const date = new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' });
  const number = new Intl.NumberFormat(locale);

  useEffect(() => {
    store
      .listHistory()
      .then(setEntries)
      .catch(() => setStorageError(true))
      .finally(() => setLoading(false));
  }, [store]);

  async function clearHistory() {
    try {
      await store.clearHistory();
      setEntries([]);
      setConfirmingClear(false);
    } catch {
      setStorageError(true);
    }
  }

  return (
    <div className="local-data-page page-container">
      <LocalDataHero
        description={t('history.description')}
        eyebrow={t('history.eyebrow')}
        icon={History}
        privacy={t('history.privacy')}
        title={t('history.title')}
        visualItems={[
          t('history.heroPoints.first'),
          t('history.heroPoints.second'),
          t('history.heroPoints.third'),
        ]}
        visualTitle={t('history.heroPanelTitle')}
      />

      <section aria-labelledby="history-list-title" className="local-data-panel" data-reveal="up">
        <div className="local-data-toolbar">
          <div>
            <h2 id="history-list-title">{t('history.listTitle')}</h2>
            <p>
              {t('history.limit', {
                count: number.format(entries.length),
                limit: number.format(LOCAL_DATA_LIMITS.historyEntries),
              })}
            </p>
          </div>
          {entries.length > 0 ? (
            <div className="local-data-actions">
              {confirmingClear ? (
                <>
                  <button
                    className="danger-button"
                    onClick={() => void clearHistory()}
                    type="button"
                  >
                    <Trash2 aria-hidden="true" />
                    {t('history.confirmClear')}
                  </button>
                  <button
                    aria-label={t('history.cancelClear')}
                    className="icon-button"
                    onClick={() => setConfirmingClear(false)}
                    type="button"
                  >
                    <X aria-hidden="true" />
                  </button>
                </>
              ) : (
                <button
                  className="button button-secondary"
                  onClick={() => setConfirmingClear(true)}
                  type="button"
                >
                  <Trash2 aria-hidden="true" />
                  {t('history.clear')}
                </button>
              )}
            </div>
          ) : null}
        </div>

        {storageError ? (
          <p aria-live="assertive" className="local-data-status field-error">
            {t('history.storageError')}
          </p>
        ) : null}

        {loading ? (
          <p className="empty-preview">{t('history.loading')}</p>
        ) : entries.length === 0 ? (
          <div className="local-empty-state">
            <History aria-hidden="true" />
            <strong>{t('history.emptyTitle')}</strong>
            <p>{t('history.emptyDescription')}</p>
          </div>
        ) : (
          <ol className="history-list">
            {entries.map((entry) => (
              <li key={entry.id}>
                <div className="history-entry-heading">
                  <strong>{t(`history.types.${entry.extractionType}`)}</strong>
                  <time dateTime={entry.timestamp}>{date.format(new Date(entry.timestamp))}</time>
                </div>
                <code dir="ltr">{entry.url}</code>
                <span>{t('history.resultCount', { count: number.format(entry.resultCount) })}</span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
