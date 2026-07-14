import {
  CUSTOM_EXTRACTION_MODES,
  extractCustomRecipe,
  inspectCustomRecipe,
  type CustomExtractionMode,
  type CustomExtractionResult,
  type CustomFieldDefinition,
  type CustomRecipeDraft,
  type CustomValidationIssue,
  type CustomValue,
} from '@scrapestudio/extraction-core';
import { PUBLIC_EXTRACTION_LIMITS } from '@scrapestudio/shared';
import { Braces, FlaskConical, Plus, RotateCcw, Save, Trash2 } from 'lucide-react';
import { useDeferredValue, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { customExportPayload } from '../../features/export/export-data';
import { createRecipe, type ScrapeRecipe } from '../../features/local-data/model';
import {
  LocalDataError,
  localDataStore,
  type LocalDataStore,
} from '../../features/local-data/store';
import { CodeGeneratorPanel } from './CodeGeneratorPanel';
import { ExportActions } from './ExportActions';
import { ResponsiveRecords, type RecordColumn } from './previews/ResponsiveRecords';

const STRING_MODES = new Set<CustomExtractionMode>([
  'attribute',
  'href',
  'html',
  'innerText',
  'src',
  'text',
]);

function blankField(id: string): CustomFieldDefinition {
  return { id, mode: 'text', name: '', selector: '', trim: true };
}

const DEMO_RECIPE: CustomRecipeDraft = {
  itemSelector: 'article',
  fields: [
    { id: 'demo-title', mode: 'text', name: 'product', selector: 'h2', trim: true },
    { id: 'demo-url', mode: 'href', name: 'url', selector: 'a', trim: true },
    { id: 'demo-image', mode: 'src', name: 'image', selector: 'img', trim: true },
  ],
};

function issueForField(
  issues: CustomValidationIssue[],
  fieldId: string,
): CustomValidationIssue | undefined {
  return issues.find((issue) => issue.fieldId === fieldId);
}

export function CustomExtractor({
  finalUrl,
  html,
  initialDraft,
  initialRecipe,
  onExtraction,
  onRecipeSaved,
  source,
  store = localDataStore,
}: {
  finalUrl: string;
  html: string;
  initialDraft?: CustomRecipeDraft;
  initialRecipe?: ScrapeRecipe;
  onExtraction?: (result: CustomExtractionResult, recipeId?: string) => void;
  onRecipeSaved?: (recipe: ScrapeRecipe) => void;
  source: 'api' | 'demo';
  store?: LocalDataStore;
}) {
  const { i18n, t } = useTranslation();
  const startingDraft = initialRecipe ?? initialDraft;
  const locale = i18n.resolvedLanguage ?? i18n.language;
  const number = useMemo(() => new Intl.NumberFormat(locale), [locale]);
  const [itemSelector, setItemSelector] = useState(startingDraft?.itemSelector ?? '');
  const [fields, setFields] = useState<CustomFieldDefinition[]>(
    startingDraft?.fields.map((field) => ({ ...field })) ?? [blankField('field-1')],
  );
  const [nextFieldId, setNextFieldId] = useState((startingDraft?.fields.length ?? 1) + 1);
  const [attempted, setAttempted] = useState(false);
  const [result, setResult] = useState<CustomExtractionResult>();
  const [savedRecipe, setSavedRecipe] = useState(initialRecipe);
  const [recipeName, setRecipeName] = useState(initialRecipe?.name ?? '');
  const [saveStatus, setSaveStatus] = useState<
    'error' | 'name_required' | 'recipe_limit' | 'saved' | undefined
  >();
  const [saving, setSaving] = useState(false);
  const recipe = useMemo<CustomRecipeDraft>(
    () => ({ fields, itemSelector }),
    [fields, itemSelector],
  );
  const deferredRecipe = useDeferredValue(recipe);
  const inspection = useMemo(
    () => inspectCustomRecipe(html, finalUrl, deferredRecipe),
    [deferredRecipe, finalUrl, html],
  );
  const validating = deferredRecipe !== recipe;
  const itemIssue = inspection.issues.find((issue) => issue.scope === 'item');
  const fieldLimit = PUBLIC_EXTRACTION_LIMITS.customFields;

  function updateRecipe(update: () => void) {
    update();
    setAttempted(false);
    setResult(undefined);
    setSaveStatus(undefined);
  }

  function updateField(id: string, patch: Partial<CustomFieldDefinition>) {
    updateRecipe(() => {
      setFields((current) =>
        current.map((field) => (field.id === id ? { ...field, ...patch } : field)),
      );
    });
  }

  function addField() {
    if (fields.length >= fieldLimit) {
      return;
    }
    updateRecipe(() => {
      setFields((current) => [...current, blankField(`field-${nextFieldId}`)]);
      setNextFieldId((current) => current + 1);
    });
  }

  function removeField(id: string) {
    if (fields.length === 1) {
      return;
    }
    updateRecipe(() => setFields((current) => current.filter((field) => field.id !== id)));
  }

  function loadDemoRecipe() {
    updateRecipe(() => {
      setItemSelector(DEMO_RECIPE.itemSelector);
      setFields(DEMO_RECIPE.fields.map((field) => ({ ...field })));
    });
  }

  function resetRecipe() {
    updateRecipe(() => {
      setItemSelector('');
      setFields([blankField(`field-${nextFieldId}`)]);
      setNextFieldId((current) => current + 1);
    });
  }

  function runExtraction() {
    setAttempted(true);
    if (validating || !inspection.valid) {
      return;
    }
    const extracted = extractCustomRecipe(html, finalUrl, recipe);
    setResult(extracted);
    onExtraction?.(extracted, savedRecipe?.id);
  }

  async function saveRecipe() {
    const name = recipeName.trim();
    if (!name) {
      setSaveStatus('name_required');
      return;
    }
    setAttempted(true);
    if (validating || !inspection.valid) {
      return;
    }

    setSaving(true);
    setSaveStatus(undefined);
    try {
      const stored = createRecipe({
        draft: recipe,
        ...(savedRecipe ? { existing: savedRecipe } : {}),
        name,
        targetUrl: finalUrl,
      });
      await store.saveRecipe(stored);
      setSavedRecipe(stored);
      setRecipeName(stored.name);
      setSaveStatus('saved');
      onRecipeSaved?.(stored);
    } catch (cause) {
      setSaveStatus(
        cause instanceof LocalDataError && cause.code === 'recipe_limit' ? 'recipe_limit' : 'error',
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section aria-labelledby="custom-extractor-title" className="custom-extractor" data-reveal="up">
      <div className="custom-extractor-header">
        <div>
          <p>{t('workspace.custom.kicker')}</p>
          <h2 id="custom-extractor-title">{t('workspace.custom.title')}</h2>
          <p className="section-description">{t('workspace.custom.description')}</p>
        </div>
        <div className="custom-header-actions">
          {source === 'demo' ? (
            <button className="button button-secondary" onClick={loadDemoRecipe} type="button">
              <FlaskConical aria-hidden="true" />
              {t('workspace.custom.demoRecipe')}
            </button>
          ) : null}
          <button className="icon-text-button" onClick={resetRecipe} type="button">
            <RotateCcw aria-hidden="true" />
            {t('workspace.custom.reset')}
          </button>
        </div>
      </div>

      <div className="item-selector-panel">
        <label htmlFor="custom-item-selector">{t('workspace.custom.itemSelector')}</label>
        <p id="custom-item-selector-hint">{t('workspace.custom.itemSelectorHint')}</p>
        <input
          aria-describedby={`custom-item-selector-hint${attempted && itemIssue ? ' custom-item-selector-error' : ''}`}
          aria-invalid={attempted && itemIssue ? true : undefined}
          autoCapitalize="none"
          autoComplete="off"
          dir="ltr"
          id="custom-item-selector"
          onChange={(event) =>
            updateRecipe(() => {
              setItemSelector(event.target.value);
            })
          }
          placeholder=".product-card"
          spellCheck={false}
          value={itemSelector}
        />
        {attempted && itemIssue ? (
          <p className="field-error" id="custom-item-selector-error">
            {t(`workspace.custom.validation.${itemIssue.code}`)}
          </p>
        ) : itemSelector.trim() && !itemIssue ? (
          <p aria-live="polite" className="selector-match-count">
            {t('workspace.custom.itemMatches', {
              count: number.format(inspection.itemCount),
              total: number.format(inspection.totalItemCount),
            })}
          </p>
        ) : null}
      </div>

      <div className="recipe-save-panel">
        <div>
          <strong>{t('workspace.recipe.title')}</strong>
          <p>{t('workspace.recipe.privacy')}</p>
        </div>
        <div className="recipe-save-controls">
          <label>
            <span>{t('workspace.recipe.name')}</span>
            <input
              aria-invalid={saveStatus === 'name_required' || undefined}
              autoComplete="off"
              onChange={(event) => {
                setRecipeName(event.target.value);
                setSaveStatus(undefined);
              }}
              placeholder={t('workspace.recipe.namePlaceholder')}
              value={recipeName}
            />
          </label>
          <button
            className="button button-secondary"
            disabled={saving || validating}
            onClick={() => void saveRecipe()}
            type="button"
          >
            <Save aria-hidden="true" />
            {saving
              ? t('workspace.recipe.saving')
              : savedRecipe
                ? t('workspace.recipe.update')
                : t('workspace.recipe.save')}
          </button>
        </div>
        {saveStatus ? (
          <p
            aria-live={saveStatus === 'saved' ? 'polite' : 'assertive'}
            className={saveStatus === 'saved' ? 'save-success' : 'field-error'}
          >
            {t(`workspace.recipe.${saveStatus}`)}
          </p>
        ) : null}
      </div>

      <div className="custom-fields-heading">
        <div>
          <h3>{t('workspace.custom.fieldsTitle')}</h3>
          <p>{t('workspace.custom.fieldsDescription')}</p>
        </div>
        <span>
          {t('workspace.custom.fieldLimit', {
            count: number.format(fields.length),
            limit: number.format(fieldLimit),
          })}
        </span>
      </div>

      <div className="custom-field-list">
        {fields.map((field, index) => {
          const issue = issueForField(inspection.issues, field.id);
          const fieldInspection = inspection.fields.find(
            (candidate) => candidate.fieldId === field.id,
          );
          const showIssue = attempted ? issue : undefined;
          const supportsStringOptions = STRING_MODES.has(field.mode);
          return (
            <fieldset className="custom-field-card" key={field.id}>
              <legend>
                {t('workspace.custom.fieldNumber', { number: number.format(index + 1) })}
              </legend>
              <button
                aria-label={t('workspace.custom.removeField', { number: number.format(index + 1) })}
                className="remove-field-button"
                disabled={fields.length === 1}
                onClick={() => removeField(field.id)}
                type="button"
              >
                <Trash2 aria-hidden="true" />
              </button>
              <div className="custom-field-grid">
                <label>
                  <span>{t('workspace.custom.fieldName')}</span>
                  <input
                    aria-invalid={
                      showIssue?.code === 'name_required' ||
                      showIssue?.code === 'duplicate_name' ||
                      undefined
                    }
                    autoComplete="off"
                    onChange={(event) => updateField(field.id, { name: event.target.value })}
                    placeholder="price"
                    value={field.name}
                  />
                </label>
                <label>
                  <span>{t('workspace.custom.fieldSelector')}</span>
                  <input
                    aria-invalid={
                      showIssue?.code === 'selector_required' ||
                      showIssue?.code === 'invalid_selector' ||
                      undefined
                    }
                    autoCapitalize="none"
                    autoComplete="off"
                    dir="ltr"
                    onChange={(event) => updateField(field.id, { selector: event.target.value })}
                    placeholder=".price"
                    spellCheck={false}
                    value={field.selector}
                  />
                </label>
                <label>
                  <span>{t('workspace.custom.mode')}</span>
                  <select
                    onChange={(event) =>
                      updateField(field.id, {
                        mode: event.target.value as CustomExtractionMode,
                      })
                    }
                    value={field.mode}
                  >
                    {CUSTOM_EXTRACTION_MODES.map((mode) => (
                      <option key={mode} value={mode}>
                        {t(`workspace.custom.modes.${mode}`)}
                      </option>
                    ))}
                  </select>
                </label>
                {field.mode === 'attribute' ? (
                  <label>
                    <span>{t('workspace.custom.attribute')}</span>
                    <input
                      aria-invalid={showIssue?.code === 'attribute_required' || undefined}
                      autoCapitalize="none"
                      autoComplete="off"
                      dir="ltr"
                      onChange={(event) => updateField(field.id, { attribute: event.target.value })}
                      placeholder="data-price"
                      spellCheck={false}
                      value={field.attribute ?? ''}
                    />
                  </label>
                ) : null}
                {supportsStringOptions ? (
                  <label>
                    <span>{t('workspace.custom.fallback')}</span>
                    <input
                      autoComplete="off"
                      onChange={(event) => updateField(field.id, { fallback: event.target.value })}
                      placeholder={t('workspace.custom.fallbackPlaceholder')}
                      value={field.fallback ?? ''}
                    />
                  </label>
                ) : null}
              </div>
              {supportsStringOptions ? (
                <div className="custom-field-options">
                  <label>
                    <input
                      checked={field.multiple ?? false}
                      onChange={(event) =>
                        updateField(field.id, { multiple: event.target.checked })
                      }
                      type="checkbox"
                    />
                    {t('workspace.custom.multiple')}
                  </label>
                  <label>
                    <input
                      checked={field.trim !== false}
                      onChange={(event) => updateField(field.id, { trim: event.target.checked })}
                      type="checkbox"
                    />
                    {t('workspace.custom.trim')}
                  </label>
                </div>
              ) : null}
              {field.mode === 'html' ? (
                <p className="html-safety-note">{t('workspace.custom.htmlSafety')}</p>
              ) : null}
              {showIssue ? (
                <p className="field-error">{t(`workspace.custom.validation.${showIssue.code}`)}</p>
              ) : field.selector.trim() && fieldInspection?.valid ? (
                <p aria-live="polite" className="selector-match-count">
                  {t('workspace.custom.fieldMatches', {
                    count: number.format(fieldInspection.matchCount),
                  })}
                </p>
              ) : null}
            </fieldset>
          );
        })}
      </div>

      <div className="custom-builder-actions">
        <button
          className="button button-secondary"
          disabled={fields.length >= fieldLimit}
          onClick={addField}
          type="button"
        >
          <Plus aria-hidden="true" />
          {t('workspace.custom.addField')}
        </button>
        <button
          className="button button-primary"
          disabled={validating}
          onClick={runExtraction}
          type="button"
        >
          <Braces aria-hidden="true" />
          {validating ? t('workspace.custom.validating') : t('workspace.custom.run')}
        </button>
      </div>

      {attempted && !inspection.valid ? (
        <p aria-live="assertive" className="custom-validation-summary" role="alert">
          {t('workspace.custom.fixValidation')}
        </p>
      ) : null}
      {inspection.valid && !validating ? (
        <CodeGeneratorPanel recipe={recipe} targetUrl={finalUrl} />
      ) : null}
      {result ? <CustomResults finalUrl={finalUrl} result={result} /> : null}
    </section>
  );
}

function CustomResults({ finalUrl, result }: { finalUrl: string; result: CustomExtractionResult }) {
  const { i18n, t } = useTranslation();
  const locale = i18n.resolvedLanguage ?? i18n.language;
  const number = new Intl.NumberFormat(locale);
  const columns: Array<RecordColumn<(typeof result.rows)[number]>> = result.columns.map(
    (column) => ({
      key: column,
      label: column,
      render: (row) => formatValue(row[column], t),
    }),
  );

  return (
    <section aria-labelledby="custom-results-title" className="custom-results" aria-live="polite">
      <div className="custom-results-heading">
        <div>
          <p>{t('workspace.custom.resultsKicker')}</p>
          <h3 id="custom-results-title">{t('workspace.custom.resultsTitle')}</h3>
        </div>
        <strong>
          {t('workspace.custom.resultRows', { count: number.format(result.rows.length) })}
        </strong>
      </div>
      {result.itemTruncated ? (
        <p className="result-limit-notice">
          {t('workspace.custom.resultTruncated', {
            count: number.format(result.itemCount),
            total: number.format(result.totalItemCount),
          })}
        </p>
      ) : null}
      {result.valuesTruncated ? (
        <p className="result-limit-notice">
          {t('workspace.custom.valuesTruncated', {
            limit: number.format(PUBLIC_EXTRACTION_LIMITS.customValuesPerField),
          })}
        </p>
      ) : null}
      {result.rows.length === 0 ? (
        <p className="empty-preview">{t('workspace.custom.noResults')}</p>
      ) : (
        <ResponsiveRecords
          columns={columns}
          getKey={(_row, index) => `custom-${index}`}
          items={result.rows}
        />
      )}
      <ExportActions payload={customExportPayload(result.rows)} sourceUrl={finalUrl} />
    </section>
  );
}

function formatValue(value: CustomValue | undefined, t: (key: string) => string) {
  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(', ') : t('workspace.preview.emptyValue');
  }
  if (typeof value === 'boolean') {
    return value ? t('workspace.custom.booleanTrue') : t('workspace.custom.booleanFalse');
  }
  if (value === null || value === undefined || value === '') {
    return t('workspace.preview.emptyValue');
  }
  return String(value);
}
