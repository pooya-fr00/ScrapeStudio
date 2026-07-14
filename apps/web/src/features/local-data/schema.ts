import { CUSTOM_EXTRACTION_MODES } from '@scrapestudio/extraction-core';
import { LOCAL_DATA_LIMITS, PUBLIC_EXTRACTION_LIMITS } from '@scrapestudio/shared';
import { z } from 'zod';

import {
  RECIPE_BUNDLE_FORMAT,
  RECIPE_VERSION,
  type RecipeBundle,
  type ScrapeRecipe,
} from './model';

const isoDateSchema = z.iso.datetime({ offset: true });

const recipeFieldSchema = z
  .object({
    attribute: z.string().max(128).optional(),
    fallback: z.string().max(10_000).optional(),
    id: z.string().min(1).max(128),
    mode: z.enum(CUSTOM_EXTRACTION_MODES),
    multiple: z.boolean().optional(),
    name: z.string().min(1).max(128),
    selector: z.string().min(1).max(2_000),
    trim: z.boolean().optional(),
  })
  .strict();

const recipeSchema = z
  .object({
    createdAt: isoDateSchema,
    fields: z.array(recipeFieldSchema).min(1).max(PUBLIC_EXTRACTION_LIMITS.customFields),
    id: z.string().min(1).max(256),
    itemSelector: z.string().min(1).max(2_000),
    name: z.string().min(1).max(160),
    targetUrl: z.url().max(4_096).optional(),
    updatedAt: isoDateSchema,
    version: z.literal(RECIPE_VERSION),
  })
  .strict();

const recipeBundleSchema = z
  .object({
    exportedAt: isoDateSchema,
    format: z.literal(RECIPE_BUNDLE_FORMAT),
    recipes: z.array(recipeSchema).min(1).max(LOCAL_DATA_LIMITS.recipes),
    version: z.literal(RECIPE_VERSION),
  })
  .strict();

export type RecipeImportErrorCode = 'invalid_json' | 'invalid_recipe' | 'too_large';

export class RecipeImportError extends Error {
  constructor(
    readonly code: RecipeImportErrorCode,
    options?: ErrorOptions,
  ) {
    super(code, options);
    this.name = 'RecipeImportError';
  }
}

export const MAX_RECIPE_IMPORT_BYTES = 256 * 1024;

export function parseRecipeBundle(text: string): RecipeBundle {
  if (new TextEncoder().encode(text).byteLength > MAX_RECIPE_IMPORT_BYTES) {
    throw new RecipeImportError('too_large');
  }

  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch (cause) {
    throw new RecipeImportError('invalid_json', { cause });
  }

  const result = recipeBundleSchema.safeParse(value);
  if (!result.success) {
    throw new RecipeImportError('invalid_recipe', { cause: result.error });
  }
  return result.data as RecipeBundle;
}

export function parseStoredRecipe(value: unknown): ScrapeRecipe | undefined {
  const result = recipeSchema.safeParse(value);
  return result.success ? (result.data as ScrapeRecipe) : undefined;
}
