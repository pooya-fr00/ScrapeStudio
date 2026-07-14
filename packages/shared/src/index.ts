export const PROJECT_NAME = 'ScrapeStudio';

export const SUPPORTED_LOCALES = ['en', 'fa'] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const PUBLIC_EXTRACTION_LIMITS = {
  customFields: 10,
  customItemMatches: 200,
  customValuesPerField: 100,
  images: 100,
  jsonLdBlocks: 20,
  links: 500,
  rows: 200,
} as const;

export const SMART_DETECTION_LIMITS = {
  candidates: 5,
  childrenPerNode: 80,
  depth: 12,
  minimumItems: 3,
  nodes: 2_500,
  suggestedFields: 4,
  timeoutMs: 750,
} as const;

export const LOCAL_DATA_LIMITS = {
  historyEntries: 100,
  recipes: 100,
} as const;

export const API_ERROR_CODES = [
  'INVALID_URL',
  'UNSUPPORTED_PROTOCOL',
  'BLOCKED_HOST',
  'BLOCKED_IP',
  'BLOCKED_PORT',
  'TOO_MANY_REDIRECTS',
  'REDIRECT_BLOCKED',
  'FETCH_TIMEOUT',
  'UPSTREAM_ERROR',
  'UNSUPPORTED_CONTENT_TYPE',
  'RESPONSE_TOO_LARGE',
  'RATE_LIMITED',
  'DAILY_LIMIT_REACHED',
  'SERVICE_LIMIT_REACHED',
  'INTERNAL_ERROR',
] as const;

export type ApiErrorCode = (typeof API_ERROR_CODES)[number];
