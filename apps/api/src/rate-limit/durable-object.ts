import { z } from 'zod';

import { consumeRateLimit, type RateLimitState } from './policy.js';

const checkRequestSchema = z.object({
  now: z.number().int().nonnegative(),
  settings: z.object({
    dailyLimit: z.number().int().positive().max(10_000),
    shortWindowLimit: z.number().int().positive().max(1_000),
    shortWindowSeconds: z.number().int().positive().max(86_400),
  }),
});

const CLEANUP_DELAY_MILLISECONDS = 172_800_000;

export class RateLimitDurableObject implements DurableObject {
  readonly #state: DurableObjectState;

  constructor(state: DurableObjectState) {
    this.#state = state;
    this.#state.blockConcurrencyWhile(() => {
      this.#state.storage.sql.exec(`
        CREATE TABLE IF NOT EXISTS usage (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          daily_count INTEGER NOT NULL,
          day_start INTEGER NOT NULL,
          short_count INTEGER NOT NULL,
          short_window_start INTEGER NOT NULL,
          updated_at INTEGER NOT NULL
        )
      `);
      return Promise.resolve();
    });
  }

  async fetch(request: Request): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response(null, { status: 405 });
    }

    const parsed = checkRequestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return Response.json({ error: 'invalid_request' }, { status: 400 });
    }

    const row = this.#state.storage.sql
      .exec<{
        daily_count: number;
        day_start: number;
        short_count: number;
        short_window_start: number;
        updated_at: number;
      }>(
        'SELECT daily_count, day_start, short_count, short_window_start, updated_at FROM usage WHERE id = 1',
      )
      .toArray()[0];

    const previous: RateLimitState | undefined = row
      ? {
          dailyCount: row.daily_count,
          dayStart: row.day_start,
          shortCount: row.short_count,
          shortWindowStart: row.short_window_start,
          updatedAt: row.updated_at,
        }
      : undefined;
    const evaluation = consumeRateLimit(previous, parsed.data.now, parsed.data.settings);

    this.#state.storage.sql.exec(
      `INSERT INTO usage (
        id, daily_count, day_start, short_count, short_window_start, updated_at
      ) VALUES (1, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        daily_count = excluded.daily_count,
        day_start = excluded.day_start,
        short_count = excluded.short_count,
        short_window_start = excluded.short_window_start,
        updated_at = excluded.updated_at`,
      evaluation.nextState.dailyCount,
      evaluation.nextState.dayStart,
      evaluation.nextState.shortCount,
      evaluation.nextState.shortWindowStart,
      evaluation.nextState.updatedAt,
    );

    await this.#state.storage.setAlarm(parsed.data.now + CLEANUP_DELAY_MILLISECONDS);

    return Response.json(evaluation.decision);
  }

  alarm(): void {
    this.#state.storage.sql.exec('DELETE FROM usage');
  }
}
