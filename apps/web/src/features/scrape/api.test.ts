import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  CLIENT_ID_STORAGE_KEY,
  fetchPageFromApi,
  WorkspaceRequestError,
  type WebFetch,
} from './api';

const successPayload = {
  features: { smartDetection: true },
  limits: { maxHtmlBytes: 1_000_000, maxRows: 500 },
  ok: true,
  page: {
    byteLength: 41,
    contentType: 'text/html; charset=utf-8',
    fetchedAt: '2026-07-14T10:00:00.000Z',
    finalUrl: 'https://example.com/catalog',
    html: '<!doctype html><title>Catalog</title>',
    requestedUrl: 'https://example.com/catalog',
    status: 200,
  },
  requestId: 'request-123',
};

describe('workspace API client', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('validates a success envelope and sends a persistent anonymous client id', async () => {
    const fetchImplementation = vi.fn<WebFetch>().mockResolvedValue(
      new Response(JSON.stringify(successPayload), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }),
    );

    const result = await fetchPageFromApi('https://example.com/catalog', {
      fetchImplementation,
    });

    expect(result).toEqual(successPayload);
    expect(fetchImplementation).toHaveBeenCalledWith(
      '/api/v1/fetch-page',
      expect.objectContaining({
        body: JSON.stringify({ url: 'https://example.com/catalog' }),
        method: 'POST',
      }),
    );
    const requestHeaders = new Headers(fetchImplementation.mock.calls[0]?.[1]?.headers);
    expect(requestHeaders.get('X-ScrapeStudio-Client')).toBe(
      window.localStorage.getItem(CLIENT_ID_STORAGE_KEY),
    );
    expect(window.localStorage.getItem(CLIENT_ID_STORAGE_KEY)).toMatch(/^[0-9a-f-]{36}$/iu);
  });

  it('maps a stable API error and retry hint', async () => {
    const fetchImplementation = vi.fn<WebFetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          error: {
            code: 'RATE_LIMITED',
            details: { retryAfterSeconds: 17 },
            message: 'Request limit reached.',
          },
          ok: false,
          requestId: 'request-limited',
        }),
        { status: 429 },
      ),
    );

    await expect(
      fetchPageFromApi('https://example.com', { fetchImplementation }),
    ).rejects.toMatchObject({
      code: 'RATE_LIMITED',
      requestId: 'request-limited',
      retryAfterSeconds: 17,
      status: 429,
    });
  });

  it('rejects malformed success envelopes', async () => {
    const fetchImplementation = vi
      .fn<WebFetch>()
      .mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));

    await expect(
      fetchPageFromApi('https://example.com', { fetchImplementation }),
    ).rejects.toMatchObject({ code: 'INVALID_RESPONSE', status: 200 });
  });

  it('maps network failures without exposing the raw error', async () => {
    const fetchImplementation = vi
      .fn<WebFetch>()
      .mockRejectedValue(new TypeError('private network detail'));

    const error = await fetchPageFromApi('https://example.com', { fetchImplementation }).catch(
      (cause: unknown) => cause,
    );

    expect(error).toBeInstanceOf(WorkspaceRequestError);
    expect(error).toMatchObject({ code: 'NETWORK_ERROR', message: 'NETWORK_ERROR', status: 0 });
  });
});
