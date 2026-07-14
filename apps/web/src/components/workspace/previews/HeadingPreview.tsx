import type { ExtractedHeading } from '@scrapestudio/extraction-core';
import { useTranslation } from 'react-i18next';

import { PreviewCount } from './TablePreview';
import { ResponsiveRecords, type RecordColumn } from './ResponsiveRecords';

const PREVIEW_LIMIT = 20;

export function HeadingPreview({ items, total }: { items: ExtractedHeading[]; total: number }) {
  const { i18n, t } = useTranslation();
  const number = new Intl.NumberFormat(i18n.resolvedLanguage);
  const preview = items.slice(0, PREVIEW_LIMIT);
  const columns: Array<RecordColumn<ExtractedHeading>> = [
    {
      key: 'order',
      label: t('workspace.preview.heading.order'),
      render: (heading) => number.format(heading.order),
    },
    {
      key: 'level',
      label: t('workspace.preview.heading.level'),
      render: (heading) => `H${number.format(heading.level)}`,
    },
    {
      key: 'text',
      label: t('workspace.preview.heading.text'),
      render: (heading) => heading.text || t('workspace.preview.emptyValue'),
    },
    {
      key: 'anchor',
      label: t('workspace.preview.heading.anchor'),
      render: (heading) =>
        heading.anchor ? (
          <bdi className="technical-value" dir="ltr" title={heading.anchor}>
            {heading.anchor}
          </bdi>
        ) : (
          t('workspace.preview.emptyValue')
        ),
    },
  ];

  return (
    <>
      <PreviewCount shown={preview.length} total={total} />
      <ResponsiveRecords
        columns={columns}
        getKey={(heading) => `${heading.order}-${heading.level}`}
        items={preview}
      />
    </>
  );
}
