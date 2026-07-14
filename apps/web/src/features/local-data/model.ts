import type { CustomFieldDefinition, CustomRecipeDraft } from '@scrapestudio/extraction-core';

export const RECIPE_VERSION = 1 as const;
export const RECIPE_BUNDLE_FORMAT = 'scrapestudio-recipes' as const;

export interface ScrapeRecipe {
  createdAt: string;
  fields: CustomFieldDefinition[];
  id: string;
  itemSelector: string;
  name: string;
  targetUrl?: string;
  updatedAt: string;
  version: typeof RECIPE_VERSION;
}

export type HistoryExtractionType = 'custom' | 'quick';

export interface LocalHistoryEntry {
  extractionType: HistoryExtractionType;
  id: string;
  recipeId?: string;
  resultCount: number;
  timestamp: string;
  url: string;
}

export interface RecipeBundle {
  exportedAt: string;
  format: typeof RECIPE_BUNDLE_FORMAT;
  recipes: ScrapeRecipe[];
  version: typeof RECIPE_VERSION;
}

export function createLocalId(prefix: 'history' | 'recipe'): string {
  const randomId = globalThis.crypto?.randomUUID?.();
  if (randomId) {
    return `${prefix}-${randomId}`;
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export function createRecipe(
  input: {
    draft: CustomRecipeDraft;
    existing?: ScrapeRecipe;
    name: string;
    targetUrl?: string;
  },
  now = new Date(),
): ScrapeRecipe {
  const timestamp = now.toISOString();
  return {
    createdAt: input.existing?.createdAt ?? timestamp,
    fields: input.draft.fields.map((field) => ({ ...field })),
    id: input.existing?.id ?? createLocalId('recipe'),
    itemSelector: input.draft.itemSelector,
    name: input.name.trim(),
    ...(input.targetUrl ? { targetUrl: input.targetUrl } : {}),
    updatedAt: timestamp,
    version: RECIPE_VERSION,
  };
}

export function createHistoryEntry(
  input: Omit<LocalHistoryEntry, 'id' | 'timestamp'>,
  now = new Date(),
): LocalHistoryEntry {
  return {
    ...input,
    id: createLocalId('history'),
    timestamp: now.toISOString(),
  };
}

export function createRecipeBundle(recipes: ScrapeRecipe[], now = new Date()): RecipeBundle {
  return {
    exportedAt: now.toISOString(),
    format: RECIPE_BUNDLE_FORMAT,
    recipes,
    version: RECIPE_VERSION,
  };
}
