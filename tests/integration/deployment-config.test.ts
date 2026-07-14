import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = path.resolve('.');

describe('production deployment preparation', () => {
  it('passes the repository deployment policy check', () => {
    expect(() =>
      execFileSync(process.execPath, ['scripts/check-deployment-config.mjs'], {
        cwd: root,
        stdio: 'pipe',
      }),
    ).not.toThrow();
  });

  it('generates an exact-origin secret-free Worker configuration', async () => {
    const temporary = await mkdtemp(path.join(os.tmpdir(), 'scrapestudio-worker-'));
    const output = path.join(temporary, 'wrangler.json');
    try {
      execFileSync(process.execPath, ['scripts/create-production-worker-config.mjs'], {
        cwd: root,
        env: {
          ...process.env,
          CLOUDFLARE_WORKER_NAME: 'scrapestudio-api',
          PUBLIC_APP_ORIGIN: 'https://app.scrapestudio.example',
          WORKER_CONFIG_OUTPUT: output,
        },
        stdio: 'pipe',
      });
      const config = JSON.parse(await readFile(output, 'utf8')) as {
        name: string;
        vars: Record<string, string>;
        limits?: unknown;
      };
      expect(config.name).toBe('scrapestudio-api');
      expect(config.vars.ALLOWED_ORIGINS).toBe('https://app.scrapestudio.example');
      expect(config.vars.EXTERNAL_FETCH_ENABLED).toBe('true');
      expect(config.vars).not.toHaveProperty('IP_HASH_SALT');
      expect(config).not.toHaveProperty('limits');
    } finally {
      await rm(temporary, { force: true, recursive: true });
    }
  });

  it('rejects non-HTTPS production origins', () => {
    const result = spawnSync(process.execPath, ['scripts/create-production-worker-config.mjs'], {
      cwd: root,
      env: {
        ...process.env,
        CLOUDFLARE_WORKER_NAME: 'scrapestudio-api',
        PUBLIC_APP_ORIGIN: 'http://app.example.com',
      },
      encoding: 'utf8',
    });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('must use HTTPS');
  });
});
