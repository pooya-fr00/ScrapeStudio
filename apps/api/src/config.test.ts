import { describe, expect, it } from 'vitest';

import { DEFAULT_LIMITS, readRuntimeConfig } from './config';

describe('Worker runtime configuration', () => {
  it('fails closed on external and future feature flags by default', () => {
    const config = readRuntimeConfig({});

    expect(config).toMatchObject({
      dailyLimit: DEFAULT_LIMITS.dailyLimit,
      demoOnlyMode: false,
      experimentalBrowserEnabled: false,
      externalFetchEnabled: false,
      fetchTimeoutMs: DEFAULT_LIMITS.fetchTimeoutMs,
      maxHtmlBytes: DEFAULT_LIMITS.maxHtmlBytes,
      maxRedirects: DEFAULT_LIMITS.maxRedirects,
      shortWindowLimit: DEFAULT_LIMITS.shortWindowLimit,
      shortWindowSeconds: DEFAULT_LIMITS.shortWindowSeconds,
      smartDetectionEnabled: false,
    });
  });

  it('accepts bounded operational overrides and an exact origin allowlist', () => {
    const config = readRuntimeConfig({
      ALLOWED_ORIGINS: 'https://app.example, https://fa.example ',
      DEMO_ONLY_MODE: 'true',
      EXTERNAL_FETCH_ENABLED: 'true',
      FETCH_TIMEOUT_MS: '5000',
      MAX_HTML_BYTES: '500000',
      MAX_REDIRECTS: '3',
      RATE_LIMIT_DAILY_MAX: '10',
      RATE_LIMIT_SHORT_MAX: '2',
      RATE_LIMIT_SHORT_WINDOW_SECONDS: '300',
    });

    expect([...config.allowedOrigins]).toEqual(['https://app.example', 'https://fa.example']);
    expect(config).toMatchObject({
      dailyLimit: 10,
      demoOnlyMode: true,
      externalFetchEnabled: true,
      fetchTimeoutMs: 5_000,
      maxHtmlBytes: 500_000,
      maxRedirects: 3,
      shortWindowLimit: 2,
      shortWindowSeconds: 300,
    });
  });

  it('rejects settings outside hard safety bounds', () => {
    expect(() => readRuntimeConfig({ MAX_HTML_BYTES: '999999999' })).toThrow();
    expect(() => readRuntimeConfig({ FETCH_TIMEOUT_MS: '0' })).toThrow();
    expect(() => readRuntimeConfig({ EXTERNAL_FETCH_ENABLED: 'yes' })).toThrow();
  });
});
