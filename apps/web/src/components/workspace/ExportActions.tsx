import { Check, Clipboard, FileJson, Sheet } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  createExportFilename,
  serializeCsv,
  serializeJson,
  type ExportPayload,
} from '../../features/export/export-data';
import { copyText, downloadTextFile } from '../../features/export/file-actions';

type ExportStatus = 'copied' | 'copy_error' | undefined;

export function ExportActions({
  payload,
  sourceUrl,
}: {
  payload: ExportPayload;
  sourceUrl: string;
}) {
  const { t } = useTranslation();
  const [status, setStatus] = useState<ExportStatus>();
  const json = serializeJson(payload.data);

  async function copyJson() {
    try {
      await copyText(json);
      setStatus('copied');
    } catch {
      setStatus('copy_error');
    }
  }

  function downloadJson() {
    downloadTextFile(
      createExportFilename(sourceUrl, payload.kind, 'json'),
      json,
      'application/json;charset=utf-8',
    );
  }

  function downloadCsv() {
    downloadTextFile(
      createExportFilename(sourceUrl, payload.kind, 'csv'),
      serializeCsv(payload.rows),
      'text/csv;charset=utf-8',
    );
  }

  return (
    <div className="export-panel">
      <div className="export-heading">
        <div>
          <strong>{t('workspace.export.title')}</strong>
          <span>{t('workspace.export.description')}</span>
        </div>
        <p aria-live="polite" className="export-status">
          {status ? t(`workspace.export.${status}`) : null}
        </p>
      </div>
      <div className="export-actions">
        <button className="icon-text-button" onClick={() => void copyJson()} type="button">
          {status === 'copied' ? <Check aria-hidden="true" /> : <Clipboard aria-hidden="true" />}
          {t('workspace.export.copyJson')}
        </button>
        <button className="icon-text-button" onClick={downloadJson} type="button">
          <FileJson aria-hidden="true" />
          {t('workspace.export.downloadJson')}
        </button>
        <button
          className="icon-text-button"
          disabled={payload.rows.length === 0}
          onClick={downloadCsv}
          type="button"
        >
          <Sheet aria-hidden="true" />
          {t('workspace.export.downloadCsv')}
        </button>
      </div>
    </div>
  );
}
