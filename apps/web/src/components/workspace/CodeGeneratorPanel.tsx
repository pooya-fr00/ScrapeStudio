import {
  CODE_GENERATION_TARGETS,
  CodeGenerationError,
  generateStarterCode,
  type CodeGenerationTarget,
} from '@scrapestudio/code-generator';
import type { CustomRecipeDraft } from '@scrapestudio/extraction-core';
import { Check, Clipboard, Download, FileCode2, ShieldCheck } from 'lucide-react';
import { useId, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { copyText, downloadTextFile } from '../../features/export/file-actions';

type CopyStatus = 'copied' | 'copy_error' | undefined;

function codeFilename(targetUrl: string, target: CodeGenerationTarget, extension: 'js' | 'py') {
  let host = 'public-page';
  try {
    host = new URL(targetUrl).hostname;
  } catch {
    // The generator displays its localized validation error below.
  }
  const safeHost = host
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `scrapestudio-${safeHost || 'public-page'}-${target}.${extension}`;
}

export function CodeGeneratorPanel({
  recipe,
  targetUrl,
}: {
  recipe: CustomRecipeDraft;
  targetUrl: string;
}) {
  const { t } = useTranslation();
  const [target, setTarget] = useState<CodeGenerationTarget>('python');
  const [copyStatus, setCopyStatus] = useState<CopyStatus>();
  const panelId = useId();
  const generated = useMemo(() => {
    try {
      return { output: generateStarterCode({ recipe, target, targetUrl }) };
    } catch (cause) {
      return {
        error: cause instanceof CodeGenerationError ? cause.code : 'invalid_url',
      } as const;
    }
  }, [recipe, target, targetUrl]);

  async function copyCode() {
    if (!generated.output) return;
    try {
      await copyText(generated.output.code);
      setCopyStatus('copied');
    } catch {
      setCopyStatus('copy_error');
    }
  }

  function downloadCode() {
    if (!generated.output) return;
    downloadTextFile(
      codeFilename(targetUrl, target, generated.output.extension),
      generated.output.code,
      'text/plain;charset=utf-8',
    );
  }

  return (
    <section aria-labelledby={`${panelId}-title`} className="code-generator-panel">
      <div className="code-generator-heading">
        <div>
          <p>{t('workspace.codeGenerator.kicker')}</p>
          <h3 id={`${panelId}-title`}>{t('workspace.codeGenerator.title')}</h3>
          <span>{t('workspace.codeGenerator.description')}</span>
        </div>
        <FileCode2 aria-hidden="true" />
      </div>

      <div
        aria-label={t('workspace.codeGenerator.targetLabel')}
        className="code-target-tabs"
        role="tablist"
      >
        {CODE_GENERATION_TARGETS.map((candidate) => (
          <button
            aria-controls={`${panelId}-code`}
            aria-selected={target === candidate}
            id={`${panelId}-${candidate}`}
            key={candidate}
            onClick={() => {
              setTarget(candidate);
              setCopyStatus(undefined);
            }}
            role="tab"
            tabIndex={target === candidate ? 0 : -1}
            type="button"
          >
            {t(`workspace.codeGenerator.targets.${candidate}`)}
          </button>
        ))}
      </div>

      <div className="code-generator-notice">
        <ShieldCheck aria-hidden="true" />
        <p>{t('workspace.codeGenerator.safety')}</p>
      </div>

      {generated.output ? (
        <>
          {generated.output.redactedQueryParameters.length > 0 ? (
            <p className="code-redaction-notice" role="status">
              {t('workspace.codeGenerator.redacted', {
                parameters: generated.output.redactedQueryParameters.join(', '),
              })}
            </p>
          ) : null}
          <div
            aria-labelledby={`${panelId}-${target}`}
            className="code-preview"
            id={`${panelId}-code`}
            role="tabpanel"
          >
            <div className="code-preview-toolbar">
              <span>{generated.output.extension === 'py' ? 'Python' : 'JavaScript / Node.js'}</span>
              <span>{t('workspace.codeGenerator.generatedLocally')}</span>
            </div>
            <pre dir="ltr" tabIndex={0}>
              <code>{generated.output.code}</code>
            </pre>
          </div>
          <div className="code-generator-actions">
            <button
              className="button button-secondary"
              onClick={() => void copyCode()}
              type="button"
            >
              {copyStatus === 'copied' ? (
                <Check aria-hidden="true" />
              ) : (
                <Clipboard aria-hidden="true" />
              )}
              {t('workspace.codeGenerator.copy')}
            </button>
            <button className="button button-secondary" onClick={downloadCode} type="button">
              <Download aria-hidden="true" />
              {t('workspace.codeGenerator.download', { extension: generated.output.extension })}
            </button>
            <p
              aria-live="polite"
              className={copyStatus === 'copy_error' ? 'field-error' : 'save-success'}
            >
              {copyStatus ? t(`workspace.codeGenerator.${copyStatus}`) : null}
            </p>
          </div>
        </>
      ) : (
        <p className="custom-validation-summary" role="alert">
          {t(`workspace.codeGenerator.errors.${generated.error}`)}
        </p>
      )}
    </section>
  );
}
