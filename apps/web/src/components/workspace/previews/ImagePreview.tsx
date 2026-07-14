import type { ExtractedImage } from '@scrapestudio/extraction-core';
import { useTranslation } from 'react-i18next';

import { PreviewCount } from './TablePreview';
import { ResponsiveRecords, type RecordColumn } from './ResponsiveRecords';

const PREVIEW_LIMIT = 20;

export function ImagePreview({ items, total }: { items: ExtractedImage[]; total: number }) {
  const { i18n, t } = useTranslation();
  const number = new Intl.NumberFormat(i18n.resolvedLanguage);
  const preview = items.slice(0, PREVIEW_LIMIT);
  const columns: Array<RecordColumn<ExtractedImage>> = [
    {
      key: 'alt',
      label: t('workspace.preview.image.alt'),
      render: (image) => image.alt || t('workspace.preview.emptyValue'),
    },
    {
      key: 'dimensions',
      label: t('workspace.preview.image.dimensions'),
      render: (image) =>
        image.width && image.height
          ? `${number.format(image.width)} × ${number.format(image.height)}`
          : t('workspace.preview.image.unknownDimensions'),
    },
    {
      key: 'source',
      label: t('workspace.preview.image.source'),
      render: (image) => <code>{image.sourceAttribute}</code>,
    },
    {
      key: 'url',
      label: t('workspace.preview.image.url'),
      render: (image) => (
        <bdi className="technical-value" dir="ltr" title={image.url}>
          {image.url}
        </bdi>
      ),
    },
  ];

  return (
    <>
      <p className="remote-media-notice">{t('workspace.preview.image.noDownload')}</p>
      <PreviewCount shown={preview.length} total={total} />
      <ResponsiveRecords
        columns={columns}
        getKey={(image, index) => `${image.url}-${index}`}
        items={preview}
      />
    </>
  );
}
