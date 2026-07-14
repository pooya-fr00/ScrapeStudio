import { describe, expect, it } from 'vitest';

import { consumeRateLimit, type RateLimitState } from './policy';

const settings = {
  dailyLimit: 3,
  shortWindowLimit: 2,
  shortWindowSeconds: 600,
};

describe('anonymous fixed-window rate-limit policy', () => {
  it('consumes allowance and reports remaining capacity', () => {
    const first = consumeRateLimit(undefined, 1_000, settings);
    const second = consumeRateLimit(first.nextState, 2_000, settings);

    expect(first.decision).toMatchObject({
      allowed: true,
      remainingDaily: 2,
      remainingShort: 1,
    });
    expect(second.decision).toMatchObject({
      allowed: true,
      remainingDaily: 1,
      remainingShort: 0,
    });
  });

  it('blocks the short window without consuming another request', () => {
    const first = consumeRateLimit(undefined, 1_000, settings);
    const second = consumeRateLimit(first.nextState, 2_000, settings);
    const blocked = consumeRateLimit(second.nextState, 3_000, settings);

    expect(blocked.decision).toEqual({
      allowed: false,
      code: 'RATE_LIMITED',
      remainingDaily: 1,
      remainingShort: 0,
      retryAfterSeconds: 598,
    });
    expect(blocked.nextState.dailyCount).toBe(2);
  });

  it('resets the short window and preserves the UTC daily count', () => {
    const prior: RateLimitState = {
      dailyCount: 2,
      dayStart: 0,
      shortCount: 2,
      shortWindowStart: 1_000,
      updatedAt: 2_000,
    };
    const result = consumeRateLimit(prior, 601_000, settings);

    expect(result.decision).toMatchObject({
      allowed: true,
      remainingDaily: 0,
      remainingShort: 1,
    });
  });

  it('blocks the daily quota until the next UTC day and then resets it', () => {
    const prior: RateLimitState = {
      dailyCount: 3,
      dayStart: 0,
      shortCount: 0,
      shortWindowStart: 0,
      updatedAt: 1_000,
    };
    const blocked = consumeRateLimit(prior, 86_399_000, settings);
    const reset = consumeRateLimit(blocked.nextState, 86_400_000, settings);

    expect(blocked.decision).toMatchObject({
      allowed: false,
      code: 'DAILY_LIMIT_REACHED',
      retryAfterSeconds: 1,
    });
    expect(reset.decision).toMatchObject({ allowed: true, remainingDaily: 2 });
  });
});
