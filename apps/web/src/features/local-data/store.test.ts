import { LOCAL_DATA_LIMITS } from '@scrapestudio/shared';
import { describe, expect, it } from 'vitest';

import { createHistoryEntry, createRecipe, type ScrapeRecipe } from './model';
import { type LocalDataError, MemoryLocalDataStore } from './store';

function sampleRecipe(
  index: number,
  now = new Date(`2026-07-14T08:00:${String(index).padStart(2, '0')}.000Z`),
) {
  return createRecipe(
    {
      draft: {
        fields: [{ id: `field-${index}`, mode: 'text', name: 'title', selector: '.title' }],
        itemSelector: '.product',
      },
      name: `Recipe ${index}`,
      targetUrl: 'https://example.com/products',
    },
    now,
  );
}

describe('memory local data store', () => {
  it('creates, updates, lists, and deletes versioned recipes', async () => {
    const store = new MemoryLocalDataStore();
    const original = sampleRecipe(1);
    await store.saveRecipe(original);
    const updated: ScrapeRecipe = {
      ...original,
      name: 'Renamed',
      updatedAt: '2026-07-15T08:00:00.000Z',
    };
    await store.saveRecipe(updated);

    expect(await store.getRecipe(original.id)).toEqual(updated);
    expect(await store.listRecipes()).toEqual([updated]);
    await store.deleteRecipe(original.id);
    expect(await store.listRecipes()).toEqual([]);
  });

  it('enforces the local recipe limit without blocking updates', async () => {
    const store = new MemoryLocalDataStore();
    const recipes: ScrapeRecipe[] = [];
    for (let index = 0; index < LOCAL_DATA_LIMITS.recipes; index += 1) {
      const candidate = sampleRecipe(index, new Date(1_700_000_000_000 + index));
      recipes.push(candidate);
      await store.saveRecipe(candidate);
    }

    await expect(store.saveRecipe(sampleRecipe(101, new Date(1_700_000_100_000)))).rejects.toEqual(
      expect.objectContaining<Partial<LocalDataError>>({ code: 'recipe_limit' }),
    );
    await expect(store.saveRecipe({ ...recipes[0]!, name: 'Updated' })).resolves.toBeUndefined();
  });

  it('keeps only bounded lightweight history metadata and clears it', async () => {
    const store = new MemoryLocalDataStore();
    for (let index = 0; index <= LOCAL_DATA_LIMITS.historyEntries; index += 1) {
      await store.addHistory(
        createHistoryEntry(
          {
            extractionType: 'quick',
            resultCount: index,
            url: `https://example.com/${index}`,
          },
          new Date(1_700_000_000_000 + index),
        ),
      );
    }

    const entries = await store.listHistory();
    expect(entries).toHaveLength(LOCAL_DATA_LIMITS.historyEntries);
    expect(entries[0]?.resultCount).toBe(LOCAL_DATA_LIMITS.historyEntries);
    expect(entries.at(-1)?.resultCount).toBe(1);
    expect(entries.some((entry) => 'html' in entry)).toBe(false);

    await store.clearHistory();
    expect(await store.listHistory()).toEqual([]);
  });
});
