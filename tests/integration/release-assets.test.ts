import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const headersPath = path.resolve('apps/web/public/_headers');
const redirectsPath = path.resolve('apps/web/public/_redirects');
const robotsPath = path.resolve('apps/web/public/robots.txt');

describe('static release security assets', () => {
  it('defines a restrictive browser security policy for every route', async () => {
    const headers = await readFile(headersPath, 'utf8');

    expect(headers).toContain("default-src 'self'");
    expect(headers).toContain("frame-ancestors 'none'");
    expect(headers).toContain("object-src 'none'");
    expect(headers).toContain("script-src 'self'");
    expect(headers).toContain('Strict-Transport-Security: max-age=31536000; includeSubDomains');
    expect(headers).toContain('X-Content-Type-Options: nosniff');
    expect(headers).toContain('Referrer-Policy: no-referrer');
    expect(headers).not.toContain("'unsafe-eval'");
    expect(headers).not.toContain("'unsafe-inline'");
  });

  it('ships an explicit crawl policy that excludes private local workspaces', async () => {
    const robots = await readFile(robotsPath, 'utf8');
    expect(robots).toContain('User-agent: *\nAllow: /');
    expect(robots).toContain('Disallow: /en/scrape');
    expect(robots).toContain('Disallow: /fa/recipes');
    expect(robots).not.toContain('Sitemap:');
  });

  it('routes Cloudflare Pages deep links through the SPA entry point', async () => {
    await expect(readFile(redirectsPath, 'utf8')).resolves.toBe('/* /index.html 200\n');
  });
});
