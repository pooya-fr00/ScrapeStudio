import { Hono, type Context } from 'hono';

import { readRuntimeConfig, type WorkerBindings } from './config.js';
import { AppError, isAppError } from './errors.js';
import { fetchPage, type FetchImplementation } from './fetch/page-fetcher.js';
import {
  DurableObjectRateLimiter,
  rateLimitSettings,
  type RateLimiter,
} from './rate-limit/rate-limiter.js';
import { fetchPageRequestSchema } from './schemas.js';
import { createAnonymousIdentityHash } from './security/identity.js';
import { validatePublicUrl } from './security/url-policy.js';

interface AppVariables {
  requestId: string;
}

export interface AppEnvironment {
  Bindings: WorkerBindings;
  Variables: AppVariables;
}

export interface SafeLogEvent {
  byteLength?: number;
  code: 'OK' | AppError['code'];
  durationMs: number;
  hostname?: string | undefined;
  requestId: string;
  route: '/api/v1/fetch-page';
  upstreamStatus?: number;
}

export interface SafeLogger {
  info(event: SafeLogEvent): void;
}

export interface AppDependencies {
  fetchImplementation: FetchImplementation;
  idFactory: () => string;
  logger: SafeLogger;
  now: () => number;
  rateLimiterFactory: (bindings: WorkerBindings) => RateLimiter;
}

const consoleLogger: SafeLogger = {
  info(event) {
    console.info(JSON.stringify(event));
  },
};

function defaultRateLimiterFactory(bindings: WorkerBindings): RateLimiter {
  if (!bindings.RATE_LIMITER) {
    throw new AppError('SERVICE_LIMIT_REACHED', 503);
  }

  return new DurableObjectRateLimiter(bindings.RATE_LIMITER);
}

function applySecurityHeaders(context: Context<AppEnvironment>): void {
  context.header('Cache-Control', 'no-store');
  context.header(
    'Content-Security-Policy',
    "default-src 'none'; frame-ancestors 'none'; base-uri 'none'",
  );
  context.header('Permissions-Policy', 'camera=(), geolocation=(), microphone=()');
  context.header('Referrer-Policy', 'no-referrer');
  context.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  context.header('X-Content-Type-Options', 'nosniff');
  context.header('X-Frame-Options', 'DENY');
  context.header('X-Request-Id', context.get('requestId'));
}

function applyCorsHeaders(context: Context<AppEnvironment>): void {
  const origin = context.req.header('Origin');
  const config = readRuntimeConfig(context.env ?? {});

  context.header('Vary', 'Origin');
  if (origin && config.allowedOrigins.has(origin)) {
    context.header('Access-Control-Allow-Origin', origin);
    context.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    context.header('Access-Control-Allow-Headers', 'Content-Type, X-ScrapeStudio-Client');
    context.header('Access-Control-Max-Age', '86400');
  }
}

function errorResponse(context: Context<AppEnvironment>, error: unknown): Response {
  const appError = isAppError(error)
    ? error
    : new AppError('INTERNAL_ERROR', 500, { cause: error });
  const errorPayload = appError.details
    ? { code: appError.code, details: appError.details, message: appError.message }
    : { code: appError.code, message: appError.message };

  if (appError.code === 'RATE_LIMITED' || appError.code === 'DAILY_LIMIT_REACHED') {
    const retryAfter = appError.details?.retryAfterSeconds;
    if (typeof retryAfter === 'number') {
      context.header('Retry-After', String(retryAfter));
    }
  }

  return context.json(
    {
      error: errorPayload,
      ok: false as const,
      requestId: context.get('requestId'),
    },
    appError.status as 400,
  );
}

export function createApp(overrides: Partial<AppDependencies> = {}): Hono<AppEnvironment> {
  const dependencies: AppDependencies = {
    fetchImplementation: globalThis.fetch,
    idFactory: () => crypto.randomUUID(),
    logger: consoleLogger,
    now: Date.now,
    rateLimiterFactory: defaultRateLimiterFactory,
    ...overrides,
  };
  const app = new Hono<AppEnvironment>();

  app.use('*', async (context, next) => {
    context.set('requestId', dependencies.idFactory());
    await next();
    applyCorsHeaders(context);
    applySecurityHeaders(context);
  });

  app.options('*', (context) => context.body(null, 204));

  app.get('/api/v1/health', (context) =>
    context.json({
      ok: true,
      service: 'scrapestudio-api',
    }),
  );

  app.post('/api/v1/fetch-page', async (context) => {
    const startedAt = dependencies.now();
    let hostname: string | undefined;

    try {
      let body: unknown;
      try {
        body = await context.req.json();
      } catch (cause) {
        throw new AppError('INVALID_URL', 400, { cause });
      }

      const request = fetchPageRequestSchema.safeParse(body);
      if (!request.success) {
        throw new AppError('INVALID_URL', 400, { cause: request.error });
      }

      const validated = validatePublicUrl(request.data.url);
      hostname = validated.hostname;
      const config = readRuntimeConfig(context.env);

      if (!config.externalFetchEnabled || config.demoOnlyMode) {
        throw new AppError('SERVICE_LIMIT_REACHED', 503);
      }

      const identityHash = await createAnonymousIdentityHash(context.req.raw, config.ipHashSalt);
      const rateLimiter = dependencies.rateLimiterFactory(context.env);
      const rateLimit = await rateLimiter.checkAndConsume(
        identityHash,
        dependencies.now(),
        rateLimitSettings(config),
      );

      context.header('X-RateLimit-Remaining-Daily', String(rateLimit.remainingDaily));
      context.header('X-RateLimit-Remaining-Short', String(rateLimit.remainingShort));
      if (!rateLimit.allowed) {
        throw new AppError(rateLimit.code ?? 'RATE_LIMITED', 429, {
          details: { retryAfterSeconds: rateLimit.retryAfterSeconds },
        });
      }

      const result = await fetchPage(validated.url.toString(), {
        config,
        fetchImplementation: dependencies.fetchImplementation,
        now: dependencies.now,
      });

      dependencies.logger.info({
        byteLength: result.byteLength,
        code: 'OK',
        durationMs: dependencies.now() - startedAt,
        hostname,
        requestId: context.get('requestId'),
        route: '/api/v1/fetch-page',
        upstreamStatus: result.status,
      });

      return context.json({
        features: {
          smartDetection: config.smartDetectionEnabled,
        },
        limits: {
          maxHtmlBytes: config.maxHtmlBytes,
          maxRows: config.maxRows,
        },
        ok: true as const,
        page: result,
        requestId: context.get('requestId'),
      });
    } catch (error) {
      const appError = isAppError(error)
        ? error
        : new AppError('INTERNAL_ERROR', 500, { cause: error });
      dependencies.logger.info({
        code: appError.code,
        durationMs: dependencies.now() - startedAt,
        hostname,
        requestId: context.get('requestId'),
        route: '/api/v1/fetch-page',
      });
      return errorResponse(context, appError);
    }
  });

  app.onError((error, context) => errorResponse(context, error));

  return app;
}

export const app = createApp();
