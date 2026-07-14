import { LOCAL_DATA_LIMITS } from '@scrapestudio/shared';
import { Copy, Download, FileUp, FolderOpen, Save, Trash2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { localizedPath } from '../app/routes';
import { useLocale } from '../app/use-locale';
import { LocalDataHero } from '../components/LocalDataHero';
import { serializeJson } from '../features/export/export-data';
import { downloadTextFile } from '../features/export/file-actions';
import { createRecipe, createRecipeBundle, type ScrapeRecipe } from '../features/local-data/model';
import { parseRecipeBundle, RecipeImportError } from '../features/local-data/schema';
import { LocalDataError, localDataStore, type LocalDataStore } from '../features/local-data/store';

type PageStatus =
  | 'deleted'
  | 'duplicated'
  | 'exported'
  | 'imported'
  | 'invalid_json'
  | 'invalid_recipe'
  | 'recipe_limit'
  | 'renamed'
  | 'storage_error'
  | 'too_large'
  | undefined;

function recipesFilename(now = new Date()): string {
  return `scrapestudio-recipes-${now.toISOString().slice(0, 10)}.json`;
}

export function RecipesPage({ store = localDataStore }: { store?: LocalDataStore }) {
  const { i18n, t } = useTranslation();
  const locale = useLocale();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [recipes, setRecipes] = useState<ScrapeRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<PageStatus>();
  const [pendingDelete, setPendingDelete] = useState<string>();
  const date = new Intl.DateTimeFormat(i18n.resolvedLanguage, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  async function refresh() {
    try {
      setRecipes(await store.listRecipes());
    } catch {
      setStatus('storage_error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    store
      .listRecipes()
      .then(setRecipes)
      .catch(() => setStatus('storage_error'))
      .finally(() => setLoading(false));
  }, [store]);

  function exportRecipes(selected: ScrapeRecipe[]) {
    const bundle = createRecipeBundle(selected);
    downloadTextFile(recipesFilename(), serializeJson(bundle), 'application/json;charset=utf-8');
    setStatus('exported');
  }

  async function importRecipes(file: File) {
    setStatus(undefined);
    try {
      const bundle = parseRecipeBundle(await file.text());
      for (const candidate of bundle.recipes) {
        const imported = createRecipe({
          draft: { fields: candidate.fields, itemSelector: candidate.itemSelector },
          name: candidate.name,
          ...(candidate.targetUrl ? { targetUrl: candidate.targetUrl } : {}),
        });
        await store.saveRecipe(imported);
      }
      await refresh();
      setStatus('imported');
    } catch (cause) {
      if (cause instanceof RecipeImportError) {
        setStatus(cause.code);
      } else if (cause instanceof LocalDataError && cause.code === 'recipe_limit') {
        setStatus('recipe_limit');
      } else {
        setStatus('storage_error');
      }
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  async function duplicateRecipe(recipe: ScrapeRecipe) {
    try {
      const duplicate = createRecipe({
        draft: { fields: recipe.fields, itemSelector: recipe.itemSelector },
        name: t('recipes.copyName', { name: recipe.name }),
        ...(recipe.targetUrl ? { targetUrl: recipe.targetUrl } : {}),
      });
      await store.saveRecipe(duplicate);
      await refresh();
      setStatus('duplicated');
    } catch (cause) {
      setStatus(
        cause instanceof LocalDataError && cause.code === 'recipe_limit'
          ? 'recipe_limit'
          : 'storage_error',
      );
    }
  }

  async function renameRecipe(recipe: ScrapeRecipe, name: string) {
    if (!name.trim()) {
      return;
    }
    try {
      await store.saveRecipe(
        createRecipe(
          {
            draft: { fields: recipe.fields, itemSelector: recipe.itemSelector },
            existing: recipe,
            name,
            ...(recipe.targetUrl ? { targetUrl: recipe.targetUrl } : {}),
          },
          new Date(),
        ),
      );
      await refresh();
      setStatus('renamed');
    } catch {
      setStatus('storage_error');
    }
  }

  async function deleteRecipe(id: string) {
    try {
      await store.deleteRecipe(id);
      setPendingDelete(undefined);
      await refresh();
      setStatus('deleted');
    } catch {
      setStatus('storage_error');
    }
  }

  return (
    <div className="local-data-page page-container">
      <LocalDataHero
        description={t('recipes.description')}
        eyebrow={t('recipes.eyebrow')}
        icon={Save}
        privacy={t('recipes.privacy')}
        title={t('recipes.title')}
        visualItems={[
          t('recipes.heroPoints.first'),
          t('recipes.heroPoints.second'),
          t('recipes.heroPoints.third'),
        ]}
        visualTitle={t('recipes.heroPanelTitle')}
      />

      <section aria-labelledby="recipe-library-title" className="local-data-panel" data-reveal="up">
        <div className="local-data-toolbar">
          <div>
            <h2 id="recipe-library-title">{t('recipes.libraryTitle')}</h2>
            <p>
              {t('recipes.limit', {
                count: new Intl.NumberFormat(i18n.resolvedLanguage).format(recipes.length),
                limit: new Intl.NumberFormat(i18n.resolvedLanguage).format(
                  LOCAL_DATA_LIMITS.recipes,
                ),
              })}
            </p>
          </div>
          <div className="local-data-actions">
            <input
              accept="application/json,.json"
              hidden
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  void importRecipes(file);
                }
              }}
              ref={fileInputRef}
              type="file"
            />
            <button
              className="button button-secondary"
              onClick={() => fileInputRef.current?.click()}
              type="button"
            >
              <FileUp aria-hidden="true" />
              {t('recipes.import')}
            </button>
            <button
              className="button button-secondary"
              disabled={recipes.length === 0}
              onClick={() => exportRecipes(recipes)}
              type="button"
            >
              <Download aria-hidden="true" />
              {t('recipes.exportAll')}
            </button>
          </div>
        </div>

        <p aria-live="polite" className="local-data-status">
          {status ? t(`recipes.status.${status}`) : null}
        </p>

        {loading ? (
          <p className="empty-preview">{t('recipes.loading')}</p>
        ) : recipes.length === 0 ? (
          <div className="local-empty-state">
            <strong>{t('recipes.emptyTitle')}</strong>
            <p>{t('recipes.emptyDescription')}</p>
            <Link className="button button-primary" to={localizedPath(locale, 'workspace')}>
              {t('recipes.createFirst')}
            </Link>
          </div>
        ) : (
          <div className="recipe-list">
            {recipes.map((recipe) => (
              <RecipeCard
                date={date}
                key={recipe.id}
                locale={locale}
                onDelete={() => void deleteRecipe(recipe.id)}
                onDuplicate={() => void duplicateRecipe(recipe)}
                onExport={() => exportRecipes([recipe])}
                onRename={(name) => void renameRecipe(recipe, name)}
                pendingDelete={pendingDelete === recipe.id}
                recipe={recipe}
                setPendingDelete={setPendingDelete}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function RecipeCard({
  date,
  locale,
  onDelete,
  onDuplicate,
  onExport,
  onRename,
  pendingDelete,
  recipe,
  setPendingDelete,
}: {
  date: Intl.DateTimeFormat;
  locale: 'en' | 'fa';
  onDelete: () => void;
  onDuplicate: () => void;
  onExport: () => void;
  onRename: (name: string) => void;
  pendingDelete: boolean;
  recipe: ScrapeRecipe;
  setPendingDelete: (id: string | undefined) => void;
}) {
  const { t } = useTranslation();
  const [name, setName] = useState(recipe.name);

  return (
    <article className="recipe-card">
      <div className="recipe-card-copy">
        <label>
          <span>{t('recipes.nameLabel')}</span>
          <input
            aria-label={t('recipes.nameLabel')}
            maxLength={160}
            onChange={(event) => setName(event.target.value)}
            value={name}
          />
        </label>
        <button
          aria-label={t('recipes.rename')}
          className="icon-button"
          disabled={!name.trim() || name.trim() === recipe.name}
          onClick={() => onRename(name)}
          type="button"
        >
          <Save aria-hidden="true" />
        </button>
        <p>
          {t('recipes.updatedAt', { date: date.format(new Date(recipe.updatedAt)) })} ·{' '}
          {t('recipes.fieldCount', { count: recipe.fields.length })}
        </p>
        {recipe.targetUrl ? <code dir="ltr">{recipe.targetUrl}</code> : null}
      </div>
      <div className="recipe-card-actions">
        <Link
          className="button button-primary"
          to={`${localizedPath(locale, 'workspace')}?recipe=${encodeURIComponent(recipe.id)}`}
        >
          <FolderOpen aria-hidden="true" />
          {t('recipes.reopen')}
        </Link>
        <button className="icon-text-button" onClick={onDuplicate} type="button">
          <Copy aria-hidden="true" />
          {t('recipes.duplicate')}
        </button>
        <button className="icon-text-button" onClick={onExport} type="button">
          <Download aria-hidden="true" />
          {t('recipes.exportOne')}
        </button>
        {pendingDelete ? (
          <>
            <button className="danger-button" onClick={onDelete} type="button">
              <Trash2 aria-hidden="true" />
              {t('recipes.confirmDelete')}
            </button>
            <button
              className="icon-button"
              onClick={() => setPendingDelete(undefined)}
              type="button"
            >
              <X aria-hidden="true" />
              <span className="visually-hidden">{t('recipes.cancelDelete')}</span>
            </button>
          </>
        ) : (
          <button
            className="icon-text-button danger-text"
            onClick={() => setPendingDelete(recipe.id)}
            type="button"
          >
            <Trash2 aria-hidden="true" />
            {t('recipes.delete')}
          </button>
        )}
      </div>
    </article>
  );
}
