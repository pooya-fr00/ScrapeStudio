import { describe, expect, it, vi } from 'vitest';

import { AppError } from '../errors';
import { fetchPage, type FetchImplementation } from './page-fetcher';

const config = {
  fetchTimeoutMs: 100,
  maxHtmlBytes: 1_024,
  maxRedirects: 2,
};

async function expectCode(promise: Promise<unknown>, code: AppError['code']): Promise<void> {
  try {
    await promise;
    throw new Error(`Expected ${code}`);
  } catch (error) {
    expect(error).toBeInstanceOf(AppError);
    expect((error as AppError).code).toBe(code);
  }
}

describe('secure page fetcher', () => {
  it('returns a normalized successful HTML response', async () => {
    const fetchImplementation = vi.fn<FetchImplementation>(
      async () =>
        new Response('<main>Hello</main>', {
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
          status: 200,
        }),
    );

    const result = await fetchPage('HTTPS://EXAMPLE.COM./page', {
      config,
      fetchImplementation,
      now: () => Date.UTC(2026, 6, 14),
    });

    expect(result).toEqual({
      byteLength: 18,
      contentType: 'text/html; charset=utf-8',
      fetchedAt: '2026-07-14T00:00:00.000Z',
      finalUrl: 'https://example.com/page',
      html: '<main>Hello</main>',
      requestedUrl: 'https://example.com/page',
      status: 200,
    });
    expect(fetchImplementation).toHaveBeenCalledWith(
      'https://example.com/page',
      expect.objectContaining({ redirect: 'manual' }),
    );
  });

  it('follows relative redirects only after validating each destination', async () => {
    const fetchImplementation = vi.fn<FetchImplementation>(async (url) =>
      url.endsWith('/start')
        ? new Response(null, { headers: { Location: '/final' }, status: 302 })
        : new Response('<p>done</p>', {
            headers: { 'Content-Type': 'application/xhtml+xml' },
          }),
    );

    const result = await fetchPage('https://example.com/start', {
      config,
      fetchImplementation,
    });

    expect(result.finalUrl).toBe('https://example.com/final');
    expect(fetchImplementation).toHaveBeenCalledTimes(2);
  });

  it('never calls fetch for an initially blocked target', async () => {
    const fetchImplementation = vi.fn<FetchImplementation>();

    await expectCode(
      fetchPage('http://169.254.169.254/latest/meta-data', {
        config,
        fetchImplementation,
      }),
      'BLOCKED_IP',
    );
    expect(fetchImplementation).not.toHaveBeenCalled();
  });

  it('stops a redirect chain before fetching a private destination', async () => {
    const fetchImplementation = vi.fn<FetchImplementation>(
      async () =>
        new Response(null, { headers: { Location: 'http://127.0.0.1/admin' }, status: 302 }),
    );

    await expectCode(
      fetchPage('https://example.com/start', { config, fetchImplementation }),
      'REDIRECT_BLOCKED',
    );
    expect(fetchImplementation).toHaveBeenCalledTimes(1);
  });

  it('enforces the redirect cap', async () => {
    const fetchImplementation = vi.fn<FetchImplementation>(
      async () => new Response(null, { headers: { Location: '/again' }, status: 302 }),
    );

    await expectCode(
      fetchPage('https://example.com/start', {
        config: { ...config, maxRedirects: 1 },
        fetchImplementation,
      }),
      'TOO_MANY_REDIRECTS',
    );
    expect(fetchImplementation).toHaveBeenCalledTimes(2);
  });

  it('rejects non-HTML content before reading it', async () => {
    const fetchImplementation = vi.fn<FetchImplementation>(
      async () => new Response('{"ok":true}', { headers: { 'Content-Type': 'application/json' } }),
    );

    await expectCode(
      fetchPage('https://example.com/data', { config, fetchImplementation }),
      'UNSUPPORTED_CONTENT_TYPE',
    );
  });

  it('rejects a declared or streamed body above the byte cap', async () => {
    const declared = vi.fn<FetchImplementation>(
      async () =>
        new Response('small', {
          headers: { 'Content-Length': '2048', 'Content-Type': 'text/html' },
        }),
    );
    const streamed = vi.fn<FetchImplementation>(
      async () => new Response(new Uint8Array(6), { headers: { 'Content-Type': 'text/html' } }),
    );

    await expectCode(
      fetchPage('https://example.com', { config, fetchImplementation: declared }),
      'RESPONSE_TOO_LARGE',
    );
    await expectCode(
      fetchPage('https://example.com', {
        config: { ...config, maxHtmlBytes: 5 },
        fetchImplementation: streamed,
      }),
      'RESPONSE_TOO_LARGE',
    );
  });

  it('aborts the request after the configured timeout', async () => {
    const fetchImplementation: FetchImplementation = (_url, init) =>
      new Promise((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () =>
          reject(new DOMException('Aborted', 'AbortError')),
        );
      });

    await expectCode(
      fetchPage('https://example.com', {
        config: { ...config, fetchTimeoutMs: 1 },
        fetchImplementation,
      }),
      'FETCH_TIMEOUT',
    );
  });

  it('maps network and upstream status failures to a stable error', async () => {
    const networkFailure = vi.fn<FetchImplementation>(async () => {
      throw new TypeError('network details must not escape');
    });
    const badStatus = vi.fn<FetchImplementation>(
      async () => new Response('failure', { status: 500 }),
    );

    await expectCode(
      fetchPage('https://example.com', { config, fetchImplementation: networkFailure }),
      'UPSTREAM_ERROR',
    );
    await expectCode(
      fetchPage('https://example.com', { config, fetchImplementation: badStatus }),
      'UPSTREAM_ERROR',
    );
  });
});
