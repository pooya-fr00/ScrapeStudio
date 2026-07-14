import type { ExtractedTable } from '@scrapestudio/extraction-core';
import { useTranslation } from 'react-i18next';

import { ResponsiveRecords, type RecordColumn } from './ResponsiveRecords';

const PREVIEW_LIMIT = 20;

export function TablePreview({
  onSelectedIndexChange,
  selectedIndex,
  tables,
}: {
  onSelectedIndexChange: (index: number) => void;
  selectedIndex: number;
  tables: ExtractedTable[];
}) {
  const { i18n, t } = useTranslation();
  const table = tables[selectedIndex] ?? tables[0];
  const number = new Intl.NumberFormat(i18n.resolvedLanguage);

  if (!table) {
    return <p className="empty-preview">{t('workspace.preview.empty')}</p>;
  }

  const rows = table.rows.slice(0, PREVIEW_LIMIT);
  const columns: Array<RecordColumn<Record<string, string>>> = table.columns.map((column) => ({
    key: column,
    label: column,
    render: (row) => row[column] || t('workspace.preview.emptyValue'),
  }));

  return (
    <div className="table-preview">
      {tables.length > 1 ? (
        <label className="table-picker">
          <span>{t('workspace.preview.table.choose')}</span>
          <select
            onChange={(event) => onSelectedIndexChange(Number(event.target.value))}
            value={selectedIndex}
          >
            {tables.map((candidate, index) => (
              <option key={candidate.index} value={index}>
                {candidate.title ||
                  t('workspace.preview.table.fallbackTitle', { number: number.format(index + 1) })}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <div className="table-preview-meta">
        <strong>
          {table.title ||
            t('workspace.preview.table.fallbackTitle', {
              number: number.format(table.index + 1),
            })}
        </strong>
        <span>
          {t('workspace.preview.table.dimensions', {
            columns: number.format(table.columnCount),
            rows: number.format(table.rowCount),
          })}
        </span>
      </div>
      <PreviewCount shown={rows.length} total={table.rowCount} />
      <ResponsiveRecords
        columns={columns}
        getKey={(_row, index) => `${table.index}-${index}`}
        items={rows}
      />
    </div>
  );
}

export function PreviewCount({ shown, total }: { shown: number; total: number }) {
  const { i18n, t } = useTranslation();
  const number = new Intl.NumberFormat(i18n.resolvedLanguage);
  return (
    <p className="preview-count">
      {t('workspace.preview.showing', {
        shown: number.format(shown),
        total: number.format(total),
      })}
    </p>
  );
}
