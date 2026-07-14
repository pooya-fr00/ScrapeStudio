import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MemoryLocalDataStore } from '../../features/local-data/store';
import { DEMO_HTML, DEMO_URL } from '../../features/scrape/demo';
import { i18n } from '../../i18n';
import { CustomExtractor } from './CustomExtractor';

describe('custom selector builder', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
  });

  afterEach(() => {
    cleanup();
  });

  it('lets a user build and run a multi-field recipe without code', async () => {
    const user = userEvent.setup();
    render(<CustomExtractor finalUrl={DEMO_URL} html={DEMO_HTML} source="api" />);

    await user.type(screen.getByLabelText('Repeating item selector'), 'article');
    await user.type(screen.getByLabelText('Field name'), 'product');
    await user.type(screen.getByLabelText('CSS selector inside each item'), 'h2');
    await user.click(screen.getByRole('button', { name: 'Add field' }));

    const names = screen.getAllByLabelText('Field name');
    const selectors = screen.getAllByLabelText('CSS selector inside each item');
    const modes = screen.getAllByLabelText('Extraction mode');
    await user.type(names[1]!, 'url');
    await user.type(selectors[1]!, 'a');
    await user.selectOptions(modes[1]!, 'href');

    expect(await screen.findByText('Using 12 of 12 matching items')).toBeInTheDocument();
    expect(screen.getAllByText('12 matches across the selected items')).toHaveLength(2);
    const runButton = screen.getByRole('button', { name: 'Run custom extraction' });
    await waitFor(() => expect(runButton).toBeEnabled());
    await user.click(runButton);

    expect(await screen.findByRole('heading', { name: 'Multi-field preview' })).toBeInTheDocument();
    expect(screen.getByText('12 rows')).toBeInTheDocument();
    expect(screen.getAllByText('Canvas map case').length).toBeGreaterThan(0);
    expect(
      screen.getAllByText('https://demo.scrapestudio.example/products/canvas-map-case').length,
    ).toBeGreaterThan(0);
  });

  it('loads the original demo recipe and never renders extracted remote images', async () => {
    const user = userEvent.setup();
    render(<CustomExtractor finalUrl={DEMO_URL} html={DEMO_HTML} source="demo" />);

    await user.click(screen.getByRole('button', { name: 'Use demo recipe' }));
    expect(await screen.findByText('Using 12 of 12 matching items')).toBeInTheDocument();
    const runButton = screen.getByRole('button', { name: 'Run custom extraction' });
    await waitFor(() => expect(runButton).toBeEnabled());
    await user.click(runButton);

    await screen.findByRole('heading', { name: 'Multi-field preview' });
    expect(document.querySelector('.custom-results img')).not.toBeInTheDocument();
    expect(
      screen.getAllByText('https://demo.scrapestudio.example/assets/canvas-map-case.svg').length,
    ).toBeGreaterThan(0);
  });

  it('saves a valid versioned recipe locally and associates later custom runs', async () => {
    const user = userEvent.setup();
    const store = new MemoryLocalDataStore();
    const onExtraction = vi.fn();
    render(
      <CustomExtractor
        finalUrl={DEMO_URL}
        html={DEMO_HTML}
        onExtraction={onExtraction}
        source="demo"
        store={store}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Use demo recipe' }));
    await user.type(screen.getByLabelText('Recipe name'), 'Demo products');
    const saveButton = screen.getByRole('button', { name: 'Save recipe' });
    await waitFor(() => expect(saveButton).toBeEnabled());
    await user.click(saveButton);

    expect(await screen.findByText('Recipe saved locally.')).toBeInTheDocument();
    const [saved] = await store.listRecipes();
    expect(saved).toMatchObject({
      itemSelector: 'article',
      name: 'Demo products',
      targetUrl: DEMO_URL,
      version: 1,
    });

    await user.click(screen.getByRole('button', { name: 'Run custom extraction' }));
    expect(onExtraction).toHaveBeenCalledWith(
      expect.objectContaining({ rows: expect.any(Array) }),
      saved?.id,
    );
    expect(screen.getByRole('button', { name: 'Copy JSON' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Download CSV' })).toBeEnabled();
  });

  it('shows human-readable selector errors and enforces the 10-field UI limit', async () => {
    const user = userEvent.setup();
    render(<CustomExtractor finalUrl={DEMO_URL} html={DEMO_HTML} source="api" />);

    fireEvent.change(screen.getByLabelText('Repeating item selector'), {
      target: { value: 'article[' },
    });
    await user.click(screen.getByRole('button', { name: 'Run custom extraction' }));
    expect(screen.getByText('This is not a valid CSS selector.')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Fix the highlighted recipe fields before running extraction.',
    );

    const addButton = screen.getByRole('button', { name: 'Add field' });
    for (let index = 0; index < 9; index += 1) {
      await user.click(addButton);
    }
    expect(screen.getByText('10 of 10 fields')).toBeInTheDocument();
    expect(addButton).toBeDisabled();
  });
});
