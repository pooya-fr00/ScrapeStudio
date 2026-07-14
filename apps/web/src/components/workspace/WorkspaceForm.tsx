import { Search, Sparkles } from 'lucide-react';
import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';

import type { UrlValidationCode } from '../../features/scrape/validation';

export function WorkspaceForm({
  busy,
  onDemo,
  onSubmit,
  onUrlChange,
  url,
  validationCode,
}: {
  busy: boolean;
  onDemo: () => void;
  onSubmit: () => void;
  onUrlChange: (value: string) => void;
  url: string;
  validationCode: UrlValidationCode | undefined;
}) {
  const { t } = useTranslation();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <form className="workspace-form" noValidate onSubmit={handleSubmit}>
      <div className="workspace-field">
        <label htmlFor="workspace-url">{t('workspace.form.urlLabel')}</label>
        <p className="field-hint" id="workspace-url-hint">
          {t('workspace.form.urlHint')}
        </p>
        <div className="url-input-row">
          <div className="url-input-wrap">
            <Search aria-hidden="true" />
            <input
              aria-describedby={`workspace-url-hint${validationCode ? ' workspace-url-error' : ''}`}
              aria-invalid={validationCode ? 'true' : undefined}
              autoComplete="url"
              dir="ltr"
              disabled={busy}
              id="workspace-url"
              inputMode="url"
              onChange={(event) => onUrlChange(event.target.value)}
              placeholder={t('workspace.form.placeholder')}
              spellCheck={false}
              type="url"
              value={url}
            />
          </div>
          <button className="button button-primary workspace-submit" disabled={busy} type="submit">
            <Search aria-hidden="true" />
            {t('workspace.form.submit')}
          </button>
        </div>
        {validationCode ? (
          <p className="field-error" id="workspace-url-error">
            {t(`workspace.validation.${validationCode}`)}
          </p>
        ) : null}
      </div>

      <div className="demo-row">
        <button className="demo-button" disabled={busy} onClick={onDemo} type="button">
          <Sparkles aria-hidden="true" />
          {t('workspace.form.loadDemo')}
        </button>
        <span>{t('workspace.form.demoHint')}</span>
      </div>
    </form>
  );
}
