import { describe, expect, it } from 'vitest';

import { createRecipeBundle, type ScrapeRecipe } from './model';
import { MAX_RECIPE_IMPORT_BYTES, parseRecipeBundle, type RecipeImportError } from './schema';

const recipe: ScrapeRecipe = {
  createdAt: '2026-07-14T08:00:00.000Z',
  fields: [{ id: 'title', mode: 'text', name: 'title', selector: '.title', trim: true }],
  id: 'recipe-one',
  itemSelector: '.product',
  name: 'Products',
  targetUrl: 'https://example.com/products',
  updatedAt: '2026-07-14T08:00:00.000Z',
  version: 1,
};

describe('recipe import schema', () => {
  it('parses a valid versioned recipe bundle', () => {
    const parsed = parseRecipeBundle(JSON.stringify(createRecipeBundle([recipe])));
    expect(parsed.recipes).toEqual([recipe]);
  });

  it('rejects malformed JSON with a stable code', () => {
    expect(() => parseRecipeBundle('{')).toThrowError(
      expect.objectContaining<Partial<RecipeImportError>>({ code: 'invalid_json' }),
    );
  });

  it('rejects unknown recipe versions and extra fields', () => {
    const bundle = { ...createRecipeBundle([recipe]), version: 2, unexpected: true };
    expect(() => parseRecipeBundle(JSON.stringify(bundle))).toThrowError(
      expect.objectContaining<Partial<RecipeImportError>>({ code: 'invalid_recipe' }),
    );
  });

  it('rejects files above the bounded import size', () => {
    expect(() => parseRecipeBundle('x'.repeat(MAX_RECIPE_IMPORT_BYTES + 1))).toThrowError(
      expect.objectContaining<Partial<RecipeImportError>>({ code: 'too_large' }),
    );
  });
});
