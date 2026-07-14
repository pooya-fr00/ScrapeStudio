import type { ApiErrorCode } from '@scrapestudio/shared';

export type { ApiErrorCode } from '@scrapestudio/shared';

const DEFAULT_MESSAGES: Record<ApiErrorCode, string> = {
  BLOCKED_HOST: 'This host cannot be fetched.',
  BLOCKED_IP: 'This network address cannot be fetched.',
  BLOCKED_PORT: 'This port cannot be fetched.',
  DAILY_LIMIT_REACHED: 'The anonymous daily fetch limit has been reached.',
  FETCH_TIMEOUT: 'The remote page did not respond in time.',
  INTERNAL_ERROR: 'An unexpected server error occurred.',
  INVALID_URL: 'Enter a valid public page URL.',
  RATE_LIMITED: 'Too many fetch requests were made in a short period.',
  REDIRECT_BLOCKED: 'The remote page redirected to a blocked destination.',
  RESPONSE_TOO_LARGE: 'The remote HTML exceeds the maximum allowed size.',
  SERVICE_LIMIT_REACHED: 'External fetching is temporarily unavailable.',
  TOO_MANY_REDIRECTS: 'The remote page redirected too many times.',
  UNSUPPORTED_CONTENT_TYPE: 'The remote response is not an HTML page.',
  UNSUPPORTED_PROTOCOL: 'Only HTTP and HTTPS URLs are supported.',
  UPSTREAM_ERROR: 'The remote page could not be fetched.',
};

export class AppError extends Error {
  readonly code: ApiErrorCode;
  readonly details: Readonly<Record<string, string | number | boolean>> | undefined;
  readonly status: number;

  constructor(
    code: ApiErrorCode,
    status: number,
    options: {
      cause?: unknown;
      details?: Readonly<Record<string, string | number | boolean>>;
      message?: string;
    } = {},
  ) {
    super(options.message ?? DEFAULT_MESSAGES[code], { cause: options.cause });
    this.name = 'AppError';
    this.code = code;
    this.status = status;
    this.details = options.details;
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
