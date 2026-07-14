import { describe, expect, it, vi } from 'vitest';

import { createApp, type SafeLogger } from '../../apps/api/src/app';
import type { WorkerBindings } from '../../apps/api/src/config';
import type { FetchImplementation } from '../../apps/api/src/fetch/page-fetcher';
import type { RateLimitDecision } from '../../apps/api/src/rate-limit/policy';
import type { RateLimiter } from '../../apps/api/src/rate-limit/rate-limiter';

const enabledBindings: WorkerBindings = {
  ALLOWED_ORIGINS: 'https://app.scrapestudio.example',
  EXTERNAL_FETCH_ENABLED: 'true',
  IP_HASH_SALT: 'integration-test-salt-value',
  SMART_DETECTION_ENABLED: 'true',
};

const allowedDecision: RateLimitDecision = {
  allowed: true,
  remainingDaily: 19,
  remainingShort: 4,
  retryAfterSeconds: 0,
};

function staticRateLimiter(decision: RateLimitDecision = allowedDecision): RateLimiter {
  return {
    checkAndConsume: vi.fn(async () => decision),
  };
}

function testApp(
  options: {
    fetchImplementation?: FetchImplementation;
    rateLimiter?: RateLimiter;
  } = {},
) {
  const logger: SafeLogger = { info: vi.fn() };
  const fetchImplementation =
    options.fetchImplementation ??
    vi.fn<FetchImplementation>(
      async () =>
        new Response('<h1>ScrapeStudio</h1>', {
          headers: { 'Content-Type': 'text/html; charset=UTF-8' },
        }),
    );
  const rateLimiter = options.rateLimiter ?? staticRateLimiter();
  const app = createApp({
    fetchImplementation,
    idFactory: () => 'request-test-id',
    logger,
    now: () => Date.UTC(2026, 6, 14, 12),
    rateLimiterFactory: () => rateLimiter,
  });

  return { app, fetchImplementation, logger, rateLimiter };
}

function postRequest(url: string, origin?: string): RequestInit {
  return {
    body: JSON.stringify({ url }),
    headers: {
      'Content-Type': 'application/json',
      ...(origin ? { Origin: origin } : {}),
      'X-ScrapeStudio-Client': '7094a25d-bd8d-4e03-865e-a2d5a1488c08',
    },
    method: 'POST',
  };
}

describe('POST /api/v1/fetch-page', () => {
  it('returns the versioned success contract and declared limits', async () => {
    const { app, logger } = testApp();
    const response = await app.request(
      '/api/v1/fetch-page',
      postRequest('https://example.com/catalog'),
      enabledBindings,
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get('X-Request-Id')).toBe('request-test-id');
    expect(response.headers.get('X-RateLimit-Remaining-Daily')).toBe('19');
    expect(payload).toMatchObject({
      features: { smartDetection: true },
      limits: { maxHtmlBytes: 1_048_576, maxRows: 200 },
      page: {
        contentType: 'text/html; charset=UTF-8',
        finalUrl: 'https://example.com/catalog',
        html: '<h1>ScrapeStudio</h1>',
        requestedUrl: 'https://example.com/catalog',
        status: 200,
      },
      ok: true,
      requestId: 'request-test-id',
    });
    expect(logger.info).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'OK', hostname: 'example.com' }),
    );
  });

  it('rejects a private target before rate limiting or network access', async () => {
    const rateLimiter = staticRateLimiter();
    const { app, fetchImplementation } = testApp({ rateLimiter });
    const response = await app.request(
      '/api/v1/fetch-page',
      postRequest('http://127.0.0.1/admin'),
      enabledBindings,
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: { code: 'BLOCKED_IP' },
      ok: false,
    });
    expect(fetchImplementation).not.toHaveBeenCalled();
    expect(rateLimiter.checkAndConsume).not.toHaveBeenCalled();
  });

  it('returns a stable error for malformed JSON', async () => {
    const { app } = testApp();
    const response = await app.request(
      '/api/v1/fetch-page',
      {
        body: '{broken',
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      },
      enabledBindings,
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: { code: 'INVALID_URL' },
      requestId: 'request-test-id',
    });
  });

  it('enforces anonymous rate limits before fetching', async () => {
    const rateLimiter = staticRateLimiter({
      allowed: false,
      code: 'RATE_LIMITED',
      remainingDaily: 18,
      remainingShort: 0,
      retryAfterSeconds: 45,
    });
    const { app, fetchImplementation } = testApp({ rateLimiter });
    const response = await app.request(
      '/api/v1/fetch-page',
      postRequest('https://example.com'),
      enabledBindings,
    );

    expect(response.status).toBe(429);
    expect(response.headers.get('Retry-After')).toBe('45');
    await expect(response.json()).resolves.toMatchObject({
      error: { code: 'RATE_LIMITED', details: { retryAfterSeconds: 45 } },
    });
    expect(fetchImplementation).not.toHaveBeenCalled();
  });

  it('fails closed when the external-fetch safety switch is disabled', async () => {
    const { app, fetchImplementation } = testApp();
    const response = await app.request('/api/v1/fetch-page', postRequest('https://example.com'), {
      ...enabledBindings,
      EXTERNAL_FETCH_ENABLED: 'false',
    });

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      error: { code: 'SERVICE_LIMIT_REACHED' },
    });
    expect(fetchImplementation).not.toHaveBeenCalled();
  });

  it('applies restrictive CORS and API security headers', async () => {
    const { app } = testApp();
    const response = await app.request(
      '/api/v1/fetch-page',
      postRequest('https://example.com', 'https://app.scrapestudio.example'),
      enabledBindings,
    );

    expect(response.headers.get('Access-Control-Allow-Origin')).toBe(
      'https://app.scrapestudio.example',
    );
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(response.headers.get('Content-Security-Policy')).toContain("default-src 'none'");
    expect(response.headers.get('Referrer-Policy')).toBe('no-referrer');
    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
  });

  it('does not grant CORS access to an unconfigured origin', async () => {
    const { app } = testApp();
    const response = await app.request(
      '/api/v1/fetch-page',
      postRequest('https://example.com', 'https://attacker.example'),
      enabledBindings,
    );

    expect(response.headers.get('Access-Control-Allow-Origin')).toBeNull();
    expect(response.headers.get('Vary')).toContain('Origin');
  });

  it('follows a validated redirect chain through the API boundary', async () => {
    const fetchImplementation = vi.fn<FetchImplementation>(async (url) =>
      url.endsWith('/start')
        ? new Response(null, { headers: { Location: '/final' }, status: 302 })
        : new Response('<p>final</p>', { headers: { 'Content-Type': 'text/html' } }),
    );
    const { app } = testApp({ fetchImplementation });
    const response = await app.request(
      '/api/v1/fetch-page',
      postRequest('https://example.com/start'),
      enabledBindings,
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      page: { finalUrl: 'https://example.com/final', html: '<p>final</p>' },
    });
    expect(fetchImplementation).toHaveBeenCalledTimes(2);
  });

  it('blocks a redirect to private infrastructure before the second fetch', async () => {
    const fetchImplementation = vi.fn<FetchImplementation>(
      async () =>
        new Response(null, { headers: { Location: 'http://10.0.0.1/admin' }, status: 302 }),
    );
    const { app } = testApp({ fetchImplementation });
    const response = await app.request(
      '/api/v1/fetch-page',
      postRequest('https://example.com/start'),
      enabledBindings,
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: { code: 'REDIRECT_BLOCKED', details: { blockedReason: 'BLOCKED_IP' } },
    });
    expect(fetchImplementation).toHaveBeenCalledTimes(1);
  });

  it('returns timeout and oversized-response errors at the API boundary', async () => {
    const stalledFetch: FetchImplementation = (_url, init) =>
      new Promise((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () =>
          reject(new DOMException('Aborted', 'AbortError')),
        );
      });
    const timeoutApp = testApp({ fetchImplementation: stalledFetch }).app;
    const timeoutResponse = await timeoutApp.request(
      '/api/v1/fetch-page',
      postRequest('https://example.com/slow'),
      { ...enabledBindings, FETCH_TIMEOUT_MS: '1' },
    );

    expect(timeoutResponse.status).toBe(504);
    await expect(timeoutResponse.json()).resolves.toMatchObject({
      error: { code: 'FETCH_TIMEOUT' },
    });

    const oversizedFetch = vi.fn<FetchImplementation>(
      async () => new Response(new Uint8Array(6), { headers: { 'Content-Type': 'text/html' } }),
    );
    const oversizedApp = testApp({ fetchImplementation: oversizedFetch }).app;
    const oversizedResponse = await oversizedApp.request(
      '/api/v1/fetch-page',
      postRequest('https://example.com/large'),
      { ...enabledBindings, MAX_HTML_BYTES: '5' },
    );

    expect(oversizedResponse.status).toBe(413);
    await expect(oversizedResponse.json()).resolves.toMatchObject({
      error: { code: 'RESPONSE_TOO_LARGE' },
    });
  });

  it('preserves secure-fetch errors without exposing internal failures', async () => {
    const fetchImplementation = vi.fn<FetchImplementation>(
      async () =>
        new Response('binary', { headers: { 'Content-Type': 'application/octet-stream' } }),
    );
    const { app } = testApp({ fetchImplementation });
    const response = await app.request(
      '/api/v1/fetch-page',
      postRequest('https://example.com/file'),
      enabledBindings,
    );
    const payload = await response.json();

    expect(response.status).toBe(415);
    expect(payload).toMatchObject({ error: { code: 'UNSUPPORTED_CONTENT_TYPE' } });
    expect(JSON.stringify(payload)).not.toContain('stack');
  });
});
