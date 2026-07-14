import { ListTree, WandSparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export type ExtractionWorkspaceMode = 'custom' | 'quick';

export function ExtractionModeSwitcher({
  mode,
  onChange,
}: {
  mode: ExtractionWorkspaceMode;
  onChange: (mode: ExtractionWorkspaceMode) => void;
}) {
  const { t } = useTranslation();

  return (
    <section
      aria-labelledby="extraction-mode-title"
      className="extraction-mode-section"
      data-reveal="up"
    >
      <div>
        <p>{t('workspace.mode.kicker')}</p>
        <h2 id="extraction-mode-title">{t('workspace.mode.title')}</h2>
      </div>
      <div aria-label={t('workspace.mode.label')} className="extraction-mode-switcher" role="group">
        <button aria-pressed={mode === 'quick'} onClick={() => onChange('quick')} type="button">
          <WandSparkles aria-hidden="true" />
          <span>
            <strong>{t('workspace.mode.quick')}</strong>
            <small>{t('workspace.mode.quickDescription')}</small>
          </span>
        </button>
        <button aria-pressed={mode === 'custom'} onClick={() => onChange('custom')} type="button">
          <ListTree aria-hidden="true" />
          <span>
            <strong>{t('workspace.mode.custom')}</strong>
            <small>{t('workspace.mode.customDescription')}</small>
          </span>
        </button>
      </div>
    </section>
  );
}
