import type { ApiErrorCode } from '../errors.js';

export interface RateLimitSettings {
  dailyLimit: number;
  shortWindowLimit: number;
  shortWindowSeconds: number;
}

export interface RateLimitState {
  dailyCount: number;
  dayStart: number;
  shortCount: number;
  shortWindowStart: number;
  updatedAt: number;
}

export interface RateLimitDecision {
  allowed: boolean;
  code?: Extract<ApiErrorCode, 'DAILY_LIMIT_REACHED' | 'RATE_LIMITED'>;
  remainingDaily: number;
  remainingShort: number;
  retryAfterSeconds: number;
}

export interface RateLimitEvaluation {
  decision: RateLimitDecision;
  nextState: RateLimitState;
}

const DAY_MILLISECONDS = 86_400_000;

function utcDayStart(now: number): number {
  return Math.floor(now / DAY_MILLISECONDS) * DAY_MILLISECONDS;
}

export function consumeRateLimit(
  previous: RateLimitState | undefined,
  now: number,
  settings: RateLimitSettings,
): RateLimitEvaluation {
  const dayStart = utcDayStart(now);
  const shortWindowMilliseconds = settings.shortWindowSeconds * 1_000;
  const dailyCount = previous?.dayStart === dayStart ? previous.dailyCount : 0;
  const shortWindowActive =
    previous !== undefined && now < previous.shortWindowStart + shortWindowMilliseconds;
  const shortCount = shortWindowActive ? previous.shortCount : 0;
  const shortWindowStart = shortWindowActive ? previous.shortWindowStart : now;
  const baseState: RateLimitState = {
    dailyCount,
    dayStart,
    shortCount,
    shortWindowStart,
    updatedAt: now,
  };

  if (dailyCount >= settings.dailyLimit) {
    return {
      decision: {
        allowed: false,
        code: 'DAILY_LIMIT_REACHED',
        remainingDaily: 0,
        remainingShort: Math.max(0, settings.shortWindowLimit - shortCount),
        retryAfterSeconds: Math.ceil((dayStart + DAY_MILLISECONDS - now) / 1_000),
      },
      nextState: baseState,
    };
  }

  if (shortCount >= settings.shortWindowLimit) {
    return {
      decision: {
        allowed: false,
        code: 'RATE_LIMITED',
        remainingDaily: settings.dailyLimit - dailyCount,
        remainingShort: 0,
        retryAfterSeconds: Math.ceil((shortWindowStart + shortWindowMilliseconds - now) / 1_000),
      },
      nextState: baseState,
    };
  }

  const nextState = {
    ...baseState,
    dailyCount: dailyCount + 1,
    shortCount: shortCount + 1,
  };

  return {
    decision: {
      allowed: true,
      remainingDaily: settings.dailyLimit - nextState.dailyCount,
      remainingShort: settings.shortWindowLimit - nextState.shortCount,
      retryAfterSeconds: 0,
    },
    nextState,
  };
}
