import type { RuntimeConfig } from '../config.js';
import { AppError, isAppError } from '../errors.js';
import { validatePublicUrl } from '../security/url-policy.js';

const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);
const ALLOWED_CONTENT_TYPES = new Set(['application/xhtml+xml', 'text/html']);

export type FetchImplementation = (input: string, init?: RequestInit) => Promise<Response>;

export interface FetchPageResult {
  byteLength: number;
  contentType: string;
  fetchedAt: string;
  finalUrl: string;
  html: string;
  requestedUrl: string;
  status: number;
}

export interface FetchPageOptions {
  config: Pick<RuntimeConfig, 'fetchTimeoutMs' | 'maxHtmlBytes' | 'maxRedirects'>;
  fetchImplementation?: FetchImplementation;
  now?: () => number;
}

function responseContentType(response: Response): { mediaType: string; value: string } {
  const value = (response.headers.get('content-type') ?? '').trim();
  const mediaType = value.split(';', 1)[0]?.trim().toLowerCase() ?? '';
  return { mediaType, value };
}

function declaredContentLength(response: Response): number | undefined {
  const value = response.headers.get('content-length');

  if (!value || !/^\d+$/.test(value)) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : undefined;
}

async function readLimitedBody(response: Response, maximumBytes: number): Promise<Uint8Array> {
  if (!response.body) {
    return new Uint8Array();
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let byteLength = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      byteLength += value.byteLength;
      if (byteLength > maximumBytes) {
        await reader.cancel();
        throw new AppError('RESPONSE_TOO_LARGE', 413);
      }

      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const body = new Uint8Array(byteLength);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return body;
}

function isAbortError(error: unknown, signal: AbortSignal): boolean {
  return signal.aborted || (error instanceof Error && error.name === 'AbortError');
}

export async function fetchPage(
  input: string,
  options: FetchPageOptions,
): Promise<FetchPageResult> {
  const fetchImplementation = options.fetchImplementation ?? globalThis.fetch;
  const now = options.now ?? Date.now;
  const initial = validatePublicUrl(input);
  const requestedUrl = initial.url.toString();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.config.fetchTimeoutMs);
  let currentUrl = initial.url;
  let redirectCount = 0;

  try {
    while (true) {
      const response = await fetchImplementation(currentUrl.toString(), {
        headers: {
          Accept: 'text/html,application/xhtml+xml;q=0.9',
          'Cache-Control': 'no-cache',
        },
        redirect: 'manual',
        signal: controller.signal,
      });

      if (REDIRECT_STATUSES.has(response.status)) {
        const location = response.headers.get('location');
        await response.body?.cancel();

        if (redirectCount >= options.config.maxRedirects) {
          throw new AppError('TOO_MANY_REDIRECTS', 400);
        }

        if (!location) {
          throw new AppError('UPSTREAM_ERROR', 502);
        }

        try {
          currentUrl = validatePublicUrl(new URL(location, currentUrl)).url;
        } catch (cause) {
          if (isAppError(cause)) {
            throw new AppError('REDIRECT_BLOCKED', 400, {
              cause,
              details: { blockedReason: cause.code },
            });
          }
          throw new AppError('REDIRECT_BLOCKED', 400, {
            cause,
            details: { blockedReason: 'INVALID_URL' },
          });
        }

        redirectCount += 1;
        continue;
      }

      if (!response.ok) {
        await response.body?.cancel();
        throw new AppError('UPSTREAM_ERROR', 502, {
          details: { upstreamStatus: response.status },
        });
      }

      const contentType = responseContentType(response);
      if (!ALLOWED_CONTENT_TYPES.has(contentType.mediaType)) {
        await response.body?.cancel();
        throw new AppError('UNSUPPORTED_CONTENT_TYPE', 415);
      }

      const contentLength = declaredContentLength(response);
      if (contentLength !== undefined && contentLength > options.config.maxHtmlBytes) {
        await response.body?.cancel();
        throw new AppError('RESPONSE_TOO_LARGE', 413);
      }

      const body = await readLimitedBody(response, options.config.maxHtmlBytes);

      return {
        byteLength: body.byteLength,
        contentType: contentType.value,
        fetchedAt: new Date(now()).toISOString(),
        finalUrl: currentUrl.toString(),
        html: new TextDecoder().decode(body),
        requestedUrl,
        status: response.status,
      };
    }
  } catch (cause) {
    if (isAppError(cause)) {
      throw cause;
    }

    if (isAbortError(cause, controller.signal)) {
      throw new AppError('FETCH_TIMEOUT', 504, { cause });
    }

    throw new AppError('UPSTREAM_ERROR', 502, { cause });
  } finally {
    clearTimeout(timeout);
  }
}
