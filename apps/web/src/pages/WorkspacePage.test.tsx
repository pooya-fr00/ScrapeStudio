import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router';

import { LocaleProvider } from '../app/LocaleProvider';
import { i18n } from '../i18n';
import { MemoryLocalDataStore } from '../features/local-data/store';
import { WorkspaceRequestError, type FetchPageResult } from '../features/scrape/api';
import { createDemoPage } from '../features/scrape/demo';
import { WorkspacePage, type WorkspaceServices } from './WorkspacePage';

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((accept) => {
    resolve = accept;
  });
  return { promise, resolve };
}

function apiResult(): FetchPageResult {
  const page = createDemoPage(Date.parse('2026-07-14T10:00:00.000Z'));
  return {
    features: { smartDetection: true },
    limits: { maxHtmlBytes: 1_000_000, maxRows: 500 },
    ok: true,
    page,
    requestId: 'request-workspace',
  };
}

function renderWorkspace(services: Partial<WorkspaceServices>, initialEntry = '/en/scrape') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <LocaleProvider locale="en">
        <WorkspacePage services={{ localData: new MemoryLocalDataStore(), ...services }} />
      </LocaleProvider>
    </MemoryRouter>,
  );
}

describe('scrape workspace', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
  });

  afterEach(() => {
    cleanup();
  });

  it('runs the bundled demo end to end without calling the API', async () => {
    const user = userEvent.setup();
    const fetchPage = vi.fn<WorkspaceServices['fetchPage']>();
    renderWorkspace({ fetchPage, yieldToMainThread: () => Promise.resolve() });

    await user.click(screen.getByRole('button', { name: 'Load sample demo' }));

    expect(await screen.findByRole('heading', { name: 'Detected data' })).toBeInTheDocument();
    expect(fetchPage).not.toHaveBeenCalled();
    expect(
      screen.getByRole('heading', { name: 'The page is ready to inspect.' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Links/u })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getAllByText('View field note').length).toBeGreaterThanOrEqual(12);
  });

  it('loads a selected playground fixture from the URL without calling the API', async () => {
    const fetchPage = vi.fn<WorkspaceServices['fetchPage']>();
    renderWorkspace(
      { fetchPage, yieldToMainThread: () => Promise.resolve() },
      '/en/scrape?demo=table',
    );

    expect(await screen.findByRole('heading', { name: 'Detected data' })).toBeInTheDocument();
    expect(fetchPage).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Public page URL')).toHaveValue(
      'https://demo.scrapestudio.example/en/playground/table',
    );
    expect(screen.getByRole('button', { name: /Tables/u })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getAllByText('Repairing everyday objects').length).toBeGreaterThan(0);
  });

  it('validates locally before attempting a fetch', async () => {
    const user = userEvent.setup();
    const fetchPage = vi.fn<WorkspaceServices['fetchPage']>();
    renderWorkspace({ fetchPage });

    await user.type(screen.getByLabelText('Public page URL'), 'ftp://example.com/catalog');
    await user.click(screen.getByRole('button', { name: 'Fetch and analyze' }));

    expect(screen.getByText('Only HTTP and HTTPS URLs are supported.')).toBeInTheDocument();
    expect(screen.getByLabelText('Public page URL')).toHaveAttribute('aria-invalid', 'true');
    expect(fetchPage).not.toHaveBeenCalled();
  });

  it('announces fetch and analysis progress before showing results', async () => {
    const user = userEvent.setup();
    const fetchDeferred = deferred<FetchPageResult>();
    const analysisYield = deferred<void>();
    const fetchPage = vi
      .fn<WorkspaceServices['fetchPage']>()
      .mockReturnValue(fetchDeferred.promise);
    renderWorkspace({ fetchPage, yieldToMainThread: () => analysisYield.promise });

    await user.type(screen.getByLabelText('Public page URL'), 'https://example.com/catalog');
    await user.click(screen.getByRole('button', { name: 'Fetch and analyze' }));
    expect(screen.getByRole('status')).toHaveTextContent('Fetching the public page');

    fetchDeferred.resolve(apiResult());
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Analyzing'));
    analysisYield.resolve();

    expect(await screen.findByRole('heading', { name: 'Detected data' })).toBeInTheDocument();
    expect(fetchPage).toHaveBeenCalledWith(
      'https://example.com/catalog',
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it('shows localized stable errors and a retry action', async () => {
    const user = userEvent.setup();
    const fetchPage = vi.fn<WorkspaceServices['fetchPage']>().mockRejectedValue(
      new WorkspaceRequestError('RATE_LIMITED', 429, {
        requestId: 'request-limited',
        retryAfterSeconds: 12,
      }),
    );
    renderWorkspace({ fetchPage });

    await user.type(screen.getByLabelText('Public page URL'), 'https://example.com');
    await user.click(screen.getByRole('button', { name: 'Fetch and analyze' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Too many requests were made in a short period.');
    expect(alert).toHaveTextContent('12 seconds');
    expect(alert).toHaveTextContent('request-limited');
    expect(within(alert).getByRole('button', { name: 'Try again' })).toBeInTheDocument();
    expect(alert).not.toHaveTextContent('private network detail');
  });

  it('switches categories and exposes safe JSON without rendering remote images', async () => {
    const user = userEvent.setup();
    renderWorkspace({ yieldToMainThread: () => Promise.resolve() });
    await user.click(screen.getByRole('button', { name: 'Load sample demo' }));
    await screen.findByRole('heading', { name: 'Detected data' });

    await user.click(screen.getByRole('button', { name: /Images/u }));
    expect(document.querySelector('.preview-surface img')).not.toBeInTheDocument();
    expect(
      screen.getByText('Images are listed as text only and are not downloaded automatically.'),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'JSON' }));
    expect(document.querySelector('.json-preview')).toHaveTextContent('demo.scrapestudio.example');
  });

  it('keeps the custom recipe draft when switching between extraction methods', async () => {
    const user = userEvent.setup();
    renderWorkspace({ yieldToMainThread: () => Promise.resolve() });
    await user.click(screen.getByRole('button', { name: 'Load sample demo' }));
    await screen.findByRole('heading', { name: 'Detected data' });

    await user.click(screen.getByRole('button', { name: /Custom extractor/u }));
    await user.type(screen.getByLabelText('Repeating item selector'), 'article');
    await user.click(screen.getByRole('button', { name: /Quick extract/u }));
    expect(screen.getByRole('heading', { name: 'Detected data' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Custom extractor/u }));

    expect(screen.getByLabelText('Repeating item selector')).toHaveValue('article');
  });

  it('turns a smart repeated-structure suggestion into an editable custom recipe', async () => {
    const user = userEvent.setup();
    const detectRepeated = vi.fn<WorkspaceServices['detectRepeated']>().mockResolvedValue({
      candidates: [
        {
          confidence: 94,
          itemCount: 3,
          reasons: ['repeated_siblings', 'shared_class', 'meaningful_text'],
          selector: 'article.product-card',
          suggestedFields: [
            { mode: 'text', name: 'title', selector: 'h2' },
            { mode: 'href', name: 'url', selector: 'a' },
          ],
        },
      ],
      execution: 'worker',
      inspectedNodes: 30,
      snapshotTruncated: false,
    });
    renderWorkspace({ detectRepeated, yieldToMainThread: () => Promise.resolve() });
    await user.click(screen.getByRole('button', { name: 'Load sample demo' }));

    expect(
      await screen.findByRole('heading', { name: 'Repeated structure detected' }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Use this suggestion' }));

    expect(screen.getByRole('button', { name: /Custom extractor/u })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByLabelText('Repeating item selector')).toHaveValue('article.product-card');
    expect(
      screen.getAllByLabelText('Field name').map((field) => (field as HTMLInputElement).value),
    ).toEqual(['title', 'url']);
  });
});
