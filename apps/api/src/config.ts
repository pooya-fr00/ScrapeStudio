import { z } from 'zod';
import { PUBLIC_EXTRACTION_LIMITS } from '@scrapestudio/shared';

export const DEFAULT_LIMITS = {
  dailyLimit: 20,
  fetchTimeoutMs: 10_000,
  maxHtmlBytes: 1_048_576,
  maxRedirects: 5,
  maxRows: PUBLIC_EXTRACTION_LIMITS.rows,
  shortWindowLimit: 5,
  shortWindowSeconds: 600,
} as const;

export interface WorkerBindings {
  ALLOWED_ORIGINS?: string;
  DEMO_ONLY_MODE?: string;
  EXPERIMENTAL_BROWSER_ENABLED?: string;
  EXTERNAL_FETCH_ENABLED?: string;
  FETCH_TIMEOUT_MS?: string;
  IP_HASH_SALT?: string;
  MAX_HTML_BYTES?: string;
  MAX_REDIRECTS?: string;
  RATE_LIMITER?: DurableObjectNamespace;
  RATE_LIMIT_DAILY_MAX?: string;
  RATE_LIMIT_SHORT_MAX?: string;
  RATE_LIMIT_SHORT_WINDOW_SECONDS?: string;
  SMART_DETECTION_ENABLED?: string;
}

export interface RuntimeConfig {
  allowedOrigins: ReadonlySet<string>;
  dailyLimit: number;
  demoOnlyMode: boolean;
  experimentalBrowserEnabled: boolean;
  externalFetchEnabled: boolean;
  fetchTimeoutMs: number;
  ipHashSalt: string | undefined;
  maxHtmlBytes: number;
  maxRedirects: number;
  maxRows: number;
  shortWindowLimit: number;
  shortWindowSeconds: number;
  smartDetectionEnabled: boolean;
}

const booleanString = z
  .enum(['true', 'false'])
  .optional()
  .transform((value) => value === 'true');

function integerSetting(defaultValue: number, maximum: number) {
  return z.coerce.number().int().positive().max(maximum).default(defaultValue);
}

const environmentSchema = z.object({
  DEMO_ONLY_MODE: booleanString,
  EXPERIMENTAL_BROWSER_ENABLED: booleanString,
  EXTERNAL_FETCH_ENABLED: booleanString,
  FETCH_TIMEOUT_MS: integerSetting(DEFAULT_LIMITS.fetchTimeoutMs, 30_000),
  MAX_HTML_BYTES: integerSetting(DEFAULT_LIMITS.maxHtmlBytes, 5_242_880),
  MAX_REDIRECTS: integerSetting(DEFAULT_LIMITS.maxRedirects, 10),
  RATE_LIMIT_DAILY_MAX: integerSetting(DEFAULT_LIMITS.dailyLimit, 10_000),
  RATE_LIMIT_SHORT_MAX: integerSetting(DEFAULT_LIMITS.shortWindowLimit, 1_000),
  RATE_LIMIT_SHORT_WINDOW_SECONDS: integerSetting(DEFAULT_LIMITS.shortWindowSeconds, 86_400),
  SMART_DETECTION_ENABLED: booleanString,
});

export function readRuntimeConfig(bindings: WorkerBindings): RuntimeConfig {
  const parsed = environmentSchema.parse(bindings);
  const allowedOrigins = new Set(
    (bindings.ALLOWED_ORIGINS ?? '')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  );

  return {
    allowedOrigins,
    dailyLimit: parsed.RATE_LIMIT_DAILY_MAX,
    demoOnlyMode: parsed.DEMO_ONLY_MODE,
    experimentalBrowserEnabled: parsed.EXPERIMENTAL_BROWSER_ENABLED,
    externalFetchEnabled: parsed.EXTERNAL_FETCH_ENABLED,
    fetchTimeoutMs: parsed.FETCH_TIMEOUT_MS,
    ipHashSalt: bindings.IP_HASH_SALT?.trim() || undefined,
    maxHtmlBytes: parsed.MAX_HTML_BYTES,
    maxRedirects: parsed.MAX_REDIRECTS,
    maxRows: DEFAULT_LIMITS.maxRows,
    shortWindowLimit: parsed.RATE_LIMIT_SHORT_MAX,
    shortWindowSeconds: parsed.RATE_LIMIT_SHORT_WINDOW_SECONDS,
    smartDetectionEnabled: parsed.SMART_DETECTION_ENABLED,
  };
}
