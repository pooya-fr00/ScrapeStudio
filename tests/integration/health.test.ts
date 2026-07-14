import { describe, expect, it } from 'vitest';

import { app } from '../../apps/api/src/index';

describe('API application wiring', () => {
  it('serves a versioned health endpoint', async () => {
    const response = await app.request('/api/v1/health');

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      service: 'scrapestudio-api',
    });
  });
});
