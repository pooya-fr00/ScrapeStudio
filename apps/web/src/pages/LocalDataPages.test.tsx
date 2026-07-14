import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router';

import { LocaleProvider } from '../app/LocaleProvider';
import { createHistoryEntry, createRecipe } from '../features/local-data/model';
import { MemoryLocalDataStore } from '../features/local-data/store';
import { i18n } from '../i18n';
import { HistoryPage } from './HistoryPage';
import { RecipesPage } from './RecipesPage';

function wrapper(children: ReactNode) {
  return (
    <MemoryRouter>
      <LocaleProvider locale="en">{children}</LocaleProvider>
    </MemoryRouter>
  );
}

describe('local recipe and history pages', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
  });

  afterEach(cleanup);

  it('renames, duplicates, reopens, and deletes a local recipe', async () => {
    const user = userEvent.setup();
    const store = new MemoryLocalDataStore();
    const recipe = createRecipe(
      {
        draft: {
          fields: [{ id: 'title', mode: 'text', name: 'title', selector: '.title' }],
          itemSelector: '.product',
        },
        name: 'Products',
        targetUrl: 'https://example.com/products',
      },
      new Date('2026-07-14T08:00:00.000Z'),
    );
    await store.saveRecipe(recipe);
    render(wrapper(<RecipesPage store={store} />));

    expect(
      screen.getByRole('complementary', { name: 'Designed for repeatable work' }),
    ).toHaveTextContent('Portable JSON import and export');
    const name = await screen.findByLabelText('Recipe name');
    await user.clear(name);
    await user.type(name, 'Renamed products');
    await user.click(screen.getByRole('button', { name: 'Save new name' }));
    await waitFor(async () =>
      expect((await store.getRecipe(recipe.id))?.name).toBe('Renamed products'),
    );

    await user.click(screen.getByRole('button', { name: 'Duplicate' }));
    await waitFor(async () => expect(await store.listRecipes()).toHaveLength(2));
    expect(screen.getAllByRole('link', { name: 'Reopen' })[0]).toHaveAttribute(
      'href',
      expect.stringContaining('/en/scrape?recipe='),
    );

    await user.click(screen.getAllByRole('button', { name: 'Delete' })[0]!);
    await user.click(screen.getByRole('button', { name: 'Delete permanently' }));
    await waitFor(async () => expect(await store.listRecipes()).toHaveLength(1));
  });

  it('shows bounded history metadata and clears it explicitly', async () => {
    const user = userEvent.setup();
    const store = new MemoryLocalDataStore();
    await store.addHistory(
      createHistoryEntry(
        {
          extractionType: 'quick',
          resultCount: 12,
          url: 'https://example.com/catalog?query=value',
        },
        new Date('2026-07-14T08:00:00.000Z'),
      ),
    );
    render(wrapper(<HistoryPage store={store} />));

    expect(
      screen.getByRole('complementary', { name: 'A deliberately small footprint' }),
    ).toHaveTextContent('No fetched HTML or result rows');
    expect(await screen.findByText('Quick extraction')).toBeInTheDocument();
    expect(screen.getByText('https://example.com/catalog?query=value')).toBeInTheDocument();
    expect(screen.getByText('12 results')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Clear history' }));
    await user.click(screen.getByRole('button', { name: 'Clear permanently' }));
    expect(await screen.findByText('No local history yet')).toBeInTheDocument();
    expect(await store.listHistory()).toEqual([]);
  });
});
