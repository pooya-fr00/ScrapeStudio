import type { PageAnalysis } from '@scrapestudio/extraction-core';
import { Braces, LayoutList } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { ResultCategory } from '../../features/scrape/categories';
import { quickExportPayload } from '../../features/export/export-data';
import { ExportActions } from './ExportActions';
import { HeadingPreview } from './previews/HeadingPreview';
import { ImagePreview } from './previews/ImagePreview';
import { LinkPreview } from './previews/LinkPreview';
import { MetadataPreview } from './previews/MetadataPreview';
import { TablePreview } from './previews/TablePreview';

type ViewMode = 'json' | 'structured';

function selectedData(analysis: PageAnalysis, category: ResultCategory): unknown {
  return category === 'metadata' ? analysis.metadata : analysis[category];
}

function StructuredPreview({
  analysis,
  category,
  onTableIndexChange,
  tableIndex,
}: {
  analysis: PageAnalysis;
  category: ResultCategory;
  onTableIndexChange: (index: number) => void;
  tableIndex: number;
}) {
  switch (category) {
    case 'headings':
      return (
        <HeadingPreview items={analysis.headings.items} total={analysis.headings.totalCount} />
      );
    case 'images':
      return <ImagePreview items={analysis.images.items} total={analysis.images.totalCount} />;
    case 'links':
      return <LinkPreview items={analysis.links.items} total={analysis.links.totalCount} />;
    case 'metadata':
      return <MetadataPreview metadata={analysis.metadata} />;
    case 'tables':
      return (
        <TablePreview
          onSelectedIndexChange={onTableIndexChange}
          selectedIndex={tableIndex}
          tables={analysis.tables.items}
        />
      );
  }
}

export function ResultPreview({
  analysis,
  category,
  finalUrl,
}: {
  analysis: PageAnalysis;
  category: ResultCategory;
  finalUrl: string;
}) {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<ViewMode>('structured');
  const [tableIndex, setTableIndex] = useState(0);
  const exportPayload = useMemo(
    () => quickExportPayload(analysis, category, tableIndex),
    [analysis, category, tableIndex],
  );

  return (
    <section aria-labelledby="preview-title" className="preview-section" data-reveal="up">
      <div className="preview-header">
        <div>
          <p>{t('workspace.preview.kicker')}</p>
          <h2 id="preview-title">{t('workspace.preview.title')}</h2>
        </div>
        <div className="view-switcher" role="group" aria-label={t('workspace.preview.viewLabel')}>
          <button
            aria-pressed={viewMode === 'structured'}
            onClick={() => setViewMode('structured')}
            type="button"
          >
            <LayoutList aria-hidden="true" />
            {t('workspace.preview.structured')}
          </button>
          <button
            aria-pressed={viewMode === 'json'}
            onClick={() => setViewMode('json')}
            type="button"
          >
            <Braces aria-hidden="true" />
            JSON
          </button>
        </div>
      </div>
      <div className="preview-surface">
        {viewMode === 'json' ? (
          <pre className="json-preview" dir="ltr" tabIndex={0}>
            {JSON.stringify(selectedData(analysis, category), null, 2)}
          </pre>
        ) : (
          <StructuredPreview
            analysis={analysis}
            category={category}
            onTableIndexChange={setTableIndex}
            tableIndex={tableIndex}
          />
        )}
      </div>
      <ExportActions payload={exportPayload} sourceUrl={finalUrl} />
    </section>
  );
}
