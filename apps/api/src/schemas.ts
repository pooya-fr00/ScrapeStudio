import { z } from 'zod';

export const fetchPageRequestSchema = z
  .object({
    url: z.string().trim().min(1).max(2_048),
  })
  .strict();

export type FetchPageRequest = z.infer<typeof fetchPageRequestSchema>;

export const rateLimitDecisionSchema = z.object({
  allowed: z.boolean(),
  code: z.enum(['RATE_LIMITED', 'DAILY_LIMIT_REACHED']).optional(),
  remainingDaily: z.number().int().nonnegative(),
  remainingShort: z.number().int().nonnegative(),
  retryAfterSeconds: z.number().int().nonnegative(),
});
