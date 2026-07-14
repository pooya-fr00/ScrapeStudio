import { API_ERROR_CODES, type ApiErrorCode } from '@scrapestudio/shared';
import { z } from 'zod';

const CLIENT_ID_STORAGE_KEY = 'scrapestudio.anonymous-client-id';
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const fetchedPageSchema = z.object({
  byteLength: z.number().int().nonnegative(),
  contentType: z.string().min(1),
  fetchedAt: z.iso.datetime(),
  finalUrl: z.url(),
  html: z.string(),
  requestedUrl: z.url(),
  status: z.number().int().min(100).max(599),
});

const successResponseSchema = z.object({
  features: z.object({
    smartDetection: z.boolean(),
  }),
  limits: z.object({
    maxHtmlBytes: z.number().int().positive(),
    maxRows: z.number().int().positive(),
  }),
  ok: z.literal(true),
  page: fetchedPageSchema,
  requestId: z.string().min(1),
});

const errorResponseSchema = z.object({
  error: z.object({
    code: z.enum(API_ERROR_CODES),
    details: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
    message: z.string(),
  }),
  ok: z.literal(false),
  requestId: z.string().min(1),
});

export type FetchedPage = z.infer<typeof fetchedPageSchema>;
export type FetchPageResult = z.infer<typeof successResponseSchema>;
export type WorkspaceErrorCode =
  ApiErrorCode | 'ANALYSIS_ERROR' | 'INVALID_RESPONSE' | 'NETWORK_ERROR';

export class WorkspaceRequestError extends Error {
  readonly code: WorkspaceErrorCode;
  readonly requestId: string | undefined;
  readonly retryAfterSeconds: number | undefined;
  readonly status: number;

  constructor(
    code: WorkspaceErrorCode,
    status: number,
    options: {
      cause?: unknown;
      requestId?: string;
      retryAfterSeconds?: number;
    } = {},
  ) {
    super(code, { cause: options.cause });
    this.name = 'WorkspaceRequestError';
    this.code = code;
    this.status = status;
    this.requestId = options.requestId;
    this.retryAfterSeconds = options.retryAfterSeconds;
  }
}

export type WebFetch = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

function anonymousClientId(): string {
  try {
    const existing = window.localStorage.getItem(CLIENT_ID_STORAGE_KEY);
    if (existing && UUID_PATTERN.test(existing)) {
      return existing;
    }

    const created = crypto.randomUUID();
    window.localStorage.setItem(CLIENT_ID_STORAGE_KEY, created);
    return created;
  } catch {
    return crypto.randomUUID();
  }
}

function endpointUrl(): string {
  const configuredBase = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/+$/u, '') ?? '';
  return `${configuredBase}/api/v1/fetch-page`;
}

function retryAfterSeconds(response: Response, details: Record<string, unknown> | undefined) {
  const detailValue = details?.retryAfterSeconds;
  if (typeof detailValue === 'number' && Number.isFinite(detailValue)) {
    return Math.max(0, Math.trunc(detailValue));
  }

  const headerValue = response.headers.get('Retry-After');
  if (headerValue && /^\d+$/u.test(headerValue)) {
    return Number(headerValue);
  }

  return undefined;
}

export async function fetchPageFromApi(
  url: string,
  options: { fetchImplementation?: WebFetch; signal?: AbortSignal } = {},
): Promise<FetchPageResult> {
  const fetchImplementation = options.fetchImplementation ?? globalThis.fetch;
  let response: Response;

  try {
    const request: RequestInit = {
      body: JSON.stringify({ url }),
      headers: {
        'Content-Type': 'application/json',
        'X-ScrapeStudio-Client': anonymousClientId(),
      },
      method: 'POST',
    };
    if (options.signal) {
      request.signal = options.signal;
    }
    response = await fetchImplementation(endpointUrl(), request);
  } catch (cause) {
    if (cause instanceof Error && cause.name === 'AbortError') {
      throw cause;
    }
    throw new WorkspaceRequestError('NETWORK_ERROR', 0, { cause });
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch (cause) {
    throw new WorkspaceRequestError('INVALID_RESPONSE', response.status, { cause });
  }

  if (!response.ok) {
    const errorPayload = errorResponseSchema.safeParse(payload);
    if (!errorPayload.success) {
      throw new WorkspaceRequestError('INVALID_RESPONSE', response.status, {
        cause: errorPayload.error,
      });
    }
    const retryAfter = retryAfterSeconds(response, errorPayload.data.error.details);
    throw new WorkspaceRequestError(errorPayload.data.error.code, response.status, {
      requestId: errorPayload.data.requestId,
      ...(retryAfter === undefined ? {} : { retryAfterSeconds: retryAfter }),
    });
  }

  const success = successResponseSchema.safeParse(payload);
  if (!success.success) {
    throw new WorkspaceRequestError('INVALID_RESPONSE', response.status, {
      cause: success.error,
    });
  }

  return success.data;
}

export { CLIENT_ID_STORAGE_KEY };
