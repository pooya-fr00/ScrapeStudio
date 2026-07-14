import {
  analyzePage,
  type CustomRecipeDraft,
  type PageAnalysis,
} from '@scrapestudio/extraction-core';
import { Info, ShieldCheck } from 'lucide-react';
import { lazy, Suspense, useEffect, useEffectEvent, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router';

import { CategoryPicker } from '../components/workspace/CategoryPicker';
import { CustomExtractor } from '../components/workspace/CustomExtractor';
import {
  ExtractionModeSwitcher,
  type ExtractionWorkspaceMode,
} from '../components/workspace/ExtractionModeSwitcher';
import { ResultPreview } from '../components/workspace/ResultPreview';
import { ResultSummary } from '../components/workspace/ResultSummary';
import type { SmartDetector } from '../components/workspace/SmartDetectionPanel';
import { WorkspaceError } from '../components/workspace/WorkspaceError';
import { WorkspaceForm } from '../components/workspace/WorkspaceForm';
import {
  WorkspaceProgress,
  type WorkspaceProgressPhase,
} from '../components/workspace/WorkspaceProgress';
import {
  fetchPageFromApi,
  WorkspaceRequestError,
  type FetchPageResult,
  type FetchedPage,
} from '../features/scrape/api';
import {
  categoryCount,
  hasLittleExtractableContent,
  initialCategory,
  RESULT_CATEGORIES,
  type ResultCategory,
} from '../features/scrape/categories';
import { createDemoPage, getDemoUrl } from '../features/scrape/demo';
import { isPlaygroundKind, type PlaygroundKind } from '../features/playground/catalog';
import type { WorkspaceRun } from '../features/scrape/types';
import { validateWorkspaceUrl, type UrlValidationCode } from '../features/scrape/validation';
import { createHistoryEntry, type ScrapeRecipe } from '../features/local-data/model';
import { localDataStore, type LocalDataStore } from '../features/local-data/store';
import { useLocale } from '../app/use-locale';

type WorkspacePhase = 'error' | 'idle' | 'success' | WorkspaceProgressPhase;

const SmartDetectionPanel = lazy(() =>
  import('../components/workspace/SmartDetectionPanel').then((module) => ({
    default: module.SmartDetectionPanel,
  })),
);

export interface WorkspaceServices {
  analyze: (html: string, finalUrl: string) => PageAnalysis;
  detectRepeated: SmartDetector;
  fetchPage: (url: string, options: { signal: AbortSignal }) => Promise<FetchPageResult>;
  localData: LocalDataStore;
  now: () => number;
  yieldToMainThread: () => Promise<void>;
}

const DEFAULT_SERVICES: WorkspaceServices = {
  analyze: analyzePage,
  detectRepeated: (html, finalUrl, signal) =>
    import('../features/smart-detection/detect').then(({ detectRepeatedStructures }) =>
      detectRepeatedStructures(html, finalUrl, { signal }),
    ),
  fetchPage: fetchPageFromApi,
  localData: localDataStore,
  now: Date.now,
  yieldToMainThread: () =>
    new Promise((resolve) => {
      if (typeof requestAnimationFrame === 'function') {
        requestAnimationFrame(() => resolve());
      } else {
        setTimeout(resolve, 0);
      }
    }),
};

export function WorkspacePage({ services: overrides }: { services?: Partial<WorkspaceServices> }) {
  const { t } = useTranslation();
  const locale = useLocale();
  const [searchParams] = useSearchParams();
  const services = { ...DEFAULT_SERVICES, ...overrides };
  const [url, setUrl] = useState('');
  const [validationCode, setValidationCode] = useState<UrlValidationCode>();
  const [phase, setPhase] = useState<WorkspacePhase>('idle');
  const [error, setError] = useState<WorkspaceRequestError>();
  const [run, setRun] = useState<WorkspaceRun>();
  const [category, setCategory] = useState<ResultCategory>('metadata');
  const [extractionMode, setExtractionMode] = useState<ExtractionWorkspaceMode>('quick');
  const [loadedRecipe, setLoadedRecipe] = useState<ScrapeRecipe>();
  const [smartDraft, setSmartDraft] = useState<CustomRecipeDraft>();
  const [smartDraftVersion, setSmartDraftVersion] = useState(0);
  const [localDataNotice, setLocalDataNotice] = useState<
    'recipe_loaded' | 'recipe_not_found' | 'storage_error' | undefined
  >();
  const controllerRef = useRef<AbortController | undefined>(undefined);
  const operationRef = useRef(0);
  const busy = phase === 'fetching' || phase === 'analyzing';
  const recipeId = searchParams.get('recipe');
  const requestedDemo = searchParams.get('demo');
  const demoKind = isPlaygroundKind(requestedDemo) ? requestedDemo : undefined;

  useEffect(() => {
    if (!recipeId) {
      return undefined;
    }
    let active = true;
    services.localData
      .getRecipe(recipeId)
      .then((recipe) => {
        if (!active) {
          return;
        }
        if (!recipe) {
          setLocalDataNotice('recipe_not_found');
          return;
        }
        setLoadedRecipe(recipe);
        setExtractionMode('custom');
        setUrl(recipe.targetUrl ?? '');
        setLocalDataNotice('recipe_loaded');
      })
      .catch(() => {
        if (active) {
          setLocalDataNotice('storage_error');
        }
      });
    return () => {
      active = false;
    };
  }, [recipeId, services.localData]);

  useEffect(
    () => () => {
      controllerRef.current?.abort();
      operationRef.current += 1;
    },
    [],
  );

  async function analyzeFetchedPage(
    page: FetchedPage,
    source: WorkspaceRun['source'],
    operation: number,
    apiResult?: FetchPageResult,
  ) {
    setPhase('analyzing');
    await services.yieldToMainThread();
    if (operation !== operationRef.current) {
      return;
    }

    const analysis = services.analyze(page.html, page.finalUrl);
    if (operation !== operationRef.current) {
      return;
    }
    setCategory(initialCategory(analysis));
    setExtractionMode(loadedRecipe ? 'custom' : 'quick');
    setRun({
      analysis,
      features: {
        smartDetection: source === 'demo' || apiResult?.features.smartDetection === true,
      },
      limits: apiResult?.limits,
      page,
      requestId: apiResult?.requestId,
      source,
    });
    setPhase('success');

    const resultCount = RESULT_CATEGORIES.reduce(
      (total, resultCategory) => total + categoryCount(analysis, resultCategory),
      0,
    );
    void services.localData
      .addHistory(
        createHistoryEntry(
          {
            extractionType: 'quick',
            resultCount,
            url: page.finalUrl,
          },
          new Date(services.now()),
        ),
      )
      .catch(() => setLocalDataNotice('storage_error'));
  }

  function recordCustomExtraction(resultCount: number, savedRecipeId?: string) {
    if (!run) {
      return;
    }
    void services.localData
      .addHistory(
        createHistoryEntry(
          {
            extractionType: 'custom',
            ...(savedRecipeId ? { recipeId: savedRecipeId } : {}),
            resultCount,
            url: run.page.finalUrl,
          },
          new Date(services.now()),
        ),
      )
      .catch(() => setLocalDataNotice('storage_error'));
  }

  function handleFailure(cause: unknown, operation: number) {
    if (operation !== operationRef.current) {
      return;
    }
    if (cause instanceof Error && cause.name === 'AbortError') {
      return;
    }
    setError(
      cause instanceof WorkspaceRequestError
        ? cause
        : new WorkspaceRequestError('ANALYSIS_ERROR', 0, { cause }),
    );
    setPhase('error');
  }

  async function submitUrl() {
    const validation = validateWorkspaceUrl(url);
    if (validation.code || !validation.normalizedUrl) {
      setValidationCode(validation.code ?? 'invalid');
      return;
    }

    setValidationCode(undefined);
    setUrl(validation.normalizedUrl);
    setError(undefined);
    setRun(undefined);
    setSmartDraft(undefined);
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    const operation = operationRef.current + 1;
    operationRef.current = operation;
    setPhase('fetching');

    try {
      const result = await services.fetchPage(validation.normalizedUrl, {
        signal: controller.signal,
      });
      await analyzeFetchedPage(result.page, 'api', operation, result);
    } catch (cause) {
      handleFailure(cause, operation);
    }
  }

  async function loadDemo(kind: PlaygroundKind = 'products') {
    controllerRef.current?.abort();
    const operation = operationRef.current + 1;
    operationRef.current = operation;
    setUrl(getDemoUrl(kind, locale));
    setValidationCode(undefined);
    setError(undefined);
    setRun(undefined);
    setSmartDraft(undefined);

    try {
      await analyzeFetchedPage(createDemoPage(services.now(), kind, locale), 'demo', operation);
    } catch (cause) {
      handleFailure(cause, operation);
    }
  }

  const loadRequestedDemo = useEffectEvent((kind: PlaygroundKind) => loadDemo(kind));

  useEffect(() => {
    if (!demoKind) {
      return undefined;
    }
    const timer = window.setTimeout(() => void loadRequestedDemo(demoKind), 0);
    return () => window.clearTimeout(timer);
  }, [demoKind]);

  return (
    <div className="workspace-page">
      <section className="workspace-hero">
        <div className="page-container workspace-hero-inner">
          <div className="workspace-heading" data-reveal="up">
            <p className="eyebrow">{t('workspace.eyebrow')}</p>
            <h1>{t('workspace.title')}</h1>
            <p>{t('workspace.description')}</p>
          </div>
          <div className="workspace-form-card reveal-delay-1" data-reveal="scale">
            <WorkspaceForm
              busy={busy}
              onDemo={() => void loadDemo()}
              onSubmit={() => void submitUrl()}
              onUrlChange={(value) => {
                setUrl(value);
                if (validationCode) {
                  setValidationCode(undefined);
                }
              }}
              url={url}
              validationCode={validationCode}
            />
            <p className="workspace-security-note">
              <ShieldCheck aria-hidden="true" />
              {t('workspace.securityNote')}
            </p>
            {localDataNotice ? (
              <p
                aria-live="polite"
                className={
                  localDataNotice === 'recipe_loaded'
                    ? 'workspace-local-notice'
                    : 'workspace-local-notice field-error'
                }
              >
                {t(`workspace.localData.${localDataNotice}`)}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <div className="page-container workspace-content">
        {phase === 'fetching' || phase === 'analyzing' ? <WorkspaceProgress phase={phase} /> : null}
        {phase === 'error' && error ? (
          <WorkspaceError error={error} onRetry={() => void submitUrl()} />
        ) : null}
        {phase === 'success' && run ? (
          <div className="workspace-results">
            <ResultSummary run={run} />
            {hasLittleExtractableContent(run.analysis) ? (
              <aside className="low-content-notice" data-reveal="up">
                <Info aria-hidden="true" />
                <div>
                  <strong>{t('workspace.lowContent.title')}</strong>
                  <p>{t('workspace.lowContent.description')}</p>
                </div>
              </aside>
            ) : null}
            {run.features.smartDetection ? (
              <Suspense
                fallback={
                  <section
                    aria-live="polite"
                    className="smart-detection-panel is-analyzing smart-loading-fallback"
                    role="status"
                  >
                    <div>
                      <p>{t('workspace.smart.kicker')}</p>
                      <h2>{t('workspace.smart.analyzingTitle')}</h2>
                    </div>
                  </section>
                }
              >
                <SmartDetectionPanel
                  detect={services.detectRepeated}
                  finalUrl={run.page.finalUrl}
                  html={run.page.html}
                  onUse={(recipe) => {
                    setLoadedRecipe(undefined);
                    setSmartDraft(recipe);
                    setSmartDraftVersion((version) => version + 1);
                    setExtractionMode('custom');
                  }}
                />
              </Suspense>
            ) : null}
            <ExtractionModeSwitcher mode={extractionMode} onChange={setExtractionMode} />
            <div hidden={extractionMode !== 'quick'}>
              <CategoryPicker analysis={run.analysis} onSelect={setCategory} selected={category} />
              <ResultPreview
                key={category}
                analysis={run.analysis}
                category={category}
                finalUrl={run.page.finalUrl}
              />
            </div>
            <div hidden={extractionMode !== 'custom'}>
              <CustomExtractor
                finalUrl={run.page.finalUrl}
                html={run.page.html}
                {...(smartDraft ? { initialDraft: smartDraft } : {})}
                {...(loadedRecipe ? { initialRecipe: loadedRecipe } : {})}
                key={`${run.page.finalUrl}-${run.page.fetchedAt}-${loadedRecipe?.id ?? `smart-${smartDraftVersion}`}`}
                onExtraction={(result, savedRecipeId) =>
                  recordCustomExtraction(result.rows.length, savedRecipeId)
                }
                source={run.source}
                store={services.localData}
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
