import type { ExtractedLink } from '@scrapestudio/extraction-core';
import { useTranslation } from 'react-i18next';

import { PreviewCount } from './TablePreview';
import { ResponsiveRecords, type RecordColumn } from './ResponsiveRecords';

const PREVIEW_LIMIT = 20;

export function LinkPreview({ items, total }: { items: ExtractedLink[]; total: number }) {
  const { t } = useTranslation();
  const preview = items.slice(0, PREVIEW_LIMIT);
  const columns: Array<RecordColumn<ExtractedLink>> = [
    {
      key: 'text',
      label: t('workspace.preview.link.text'),
      render: (link) => link.text || t('workspace.preview.emptyValue'),
    },
    {
      key: 'type',
      label: t('workspace.preview.link.type'),
      render: (link) => t(`workspace.linkTypes.${link.type}`),
    },
    {
      key: 'url',
      label: t('workspace.preview.link.url'),
      render: (link) =>
        link.url ? (
          <bdi className="technical-value" dir="ltr" title={link.url}>
            {link.url}
          </bdi>
        ) : (
          t('workspace.preview.invalidUrl')
        ),
    },
  ];

  return (
    <>
      <PreviewCount shown={preview.length} total={total} />
      <ResponsiveRecords
        columns={columns}
        getKey={(link, index) => `${link.url ?? 'invalid'}-${index}`}
        items={preview}
      />
    </>
  );
}
