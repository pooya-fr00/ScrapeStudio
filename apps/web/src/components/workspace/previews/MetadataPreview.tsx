import type { ExtractedMetadata } from '@scrapestudio/extraction-core';
import { useTranslation } from 'react-i18next';

export function MetadataPreview({ metadata }: { metadata: ExtractedMetadata }) {
  const { i18n, t } = useTranslation();
  const number = new Intl.NumberFormat(i18n.resolvedLanguage);
  const fields = [
    [t('workspace.preview.metadata.title'), metadata.title],
    [t('workspace.preview.metadata.description'), metadata.description],
    [t('workspace.preview.metadata.canonical'), metadata.canonicalUrl],
    [t('workspace.preview.metadata.language'), metadata.documentLanguage],
    [t('workspace.preview.metadata.robots'), metadata.robots],
    [t('workspace.preview.metadata.viewport'), metadata.viewport],
  ] as const;

  return (
    <div className="metadata-preview">
      <dl className="metadata-fields">
        {fields.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd className={value?.startsWith('http') ? 'technical-value' : undefined}>
              {value || t('workspace.preview.emptyValue')}
            </dd>
          </div>
        ))}
      </dl>
      <section className="statistics-panel" aria-labelledby="statistics-title">
        <h3 id="statistics-title">{t('workspace.preview.metadata.statistics')}</h3>
        <dl>
          <div>
            <dt>{t('workspace.preview.metadata.words')}</dt>
            <dd>{number.format(metadata.statistics.wordEstimate)}</dd>
          </div>
          <div>
            <dt>{t('workspace.preview.metadata.paragraphs')}</dt>
            <dd>{number.format(metadata.statistics.paragraphCount)}</dd>
          </div>
          <div>
            <dt>{t('workspace.preview.metadata.h1')}</dt>
            <dd>{number.format(metadata.h1Count)}</dd>
          </div>
          <div>
            <dt>{t('workspace.preview.metadata.jsonLd')}</dt>
            <dd>{number.format(metadata.jsonLd.totalCount)}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
