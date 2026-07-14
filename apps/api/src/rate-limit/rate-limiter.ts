import type { RuntimeConfig } from '../config.js';
import { AppError } from '../errors.js';
import { rateLimitDecisionSchema } from '../schemas.js';
import type { RateLimitDecision, RateLimitSettings } from './policy.js';

export interface RateLimiter {
  checkAndConsume(
    identityHash: string,
    now: number,
    settings: RateLimitSettings,
  ): Promise<RateLimitDecision>;
}

export class DurableObjectRateLimiter implements RateLimiter {
  readonly #namespace: DurableObjectNamespace;

  constructor(namespace: DurableObjectNamespace) {
    this.#namespace = namespace;
  }

  async checkAndConsume(
    identityHash: string,
    now: number,
    settings: RateLimitSettings,
  ): Promise<RateLimitDecision> {
    const id = this.#namespace.idFromName(identityHash);
    const response = await this.#namespace.get(id).fetch('https://rate-limit.internal/check', {
      body: JSON.stringify({ now, settings }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });

    if (!response.ok) {
      throw new AppError('SERVICE_LIMIT_REACHED', 503);
    }

    const parsed = rateLimitDecisionSchema.safeParse(await response.json());
    if (!parsed.success) {
      throw new AppError('SERVICE_LIMIT_REACHED', 503, { cause: parsed.error });
    }

    if (parsed.data.code) {
      return { ...parsed.data, code: parsed.data.code };
    }

    return {
      allowed: parsed.data.allowed,
      remainingDaily: parsed.data.remainingDaily,
      remainingShort: parsed.data.remainingShort,
      retryAfterSeconds: parsed.data.retryAfterSeconds,
    };
  }
}

export function rateLimitSettings(config: RuntimeConfig): RateLimitSettings {
  return {
    dailyLimit: config.dailyLimit,
    shortWindowLimit: config.shortWindowLimit,
    shortWindowSeconds: config.shortWindowSeconds,
  };
}
