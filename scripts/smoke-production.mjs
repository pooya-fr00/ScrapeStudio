import { productionOrigin } from './lib/deployment-config.mjs';

const appOrigin = productionOrigin(process.env.PUBLIC_APP_ORIGIN, 'PUBLIC_APP_ORIGIN');
const apiOrigin = productionOrigin(process.env.PUBLIC_API_ORIGIN, 'PUBLIC_API_ORIGIN');
const timeoutMs = 15_000;

async function request(url, init = {}) {
  const response = await fetch(url, { ...init, signal: AbortSignal.timeout(timeoutMs) });
  return response;
}

async function expectOk(path, contains) {
  const response = await request(`${appOrigin}${path}`);
  if (!response.ok) throw new Error(`${path} returned ${response.status}.`);
  const body = await response.text();
  if (contains && !body.includes(contains)) throw new Error(`${path} is missing ${contains}.`);
  return response;
}

const english = await expectOk('/en', '<div id="root">');
await expectOk('/fa', '<div id="root">');
await expectOk('/robots.txt', `Sitemap: ${appOrigin}/sitemap.xml`);
await expectOk('/sitemap.xml', `<loc>${appOrigin}/en</loc>`);

const requiredHeaders = [
  ['content-security-policy', "default-src 'self'"],
  ['strict-transport-security', 'max-age=31536000'],
  ['x-content-type-options', 'nosniff'],
  ['x-frame-options', 'DENY'],
  ['referrer-policy', 'no-referrer'],
  ['permissions-policy', 'camera=()'],
];
for (const [name, expected] of requiredHeaders) {
  const value = english.headers.get(name);
  if (!value?.includes(expected))
    throw new Error(`Frontend header ${name} is missing ${expected}.`);
}
const csp = english.headers.get('content-security-policy') ?? '';
const connectTokens = csp
  .split(';')
  .find((directive) => directive.trim().startsWith('connect-src'))
  ?.trim()
  .split(/\s+/u)
  .slice(1);
if (!connectTokens?.includes(apiOrigin) || connectTokens.includes('https:')) {
  throw new Error('Frontend CSP does not restrict connections to the exact API origin.');
}

const health = await request(`${apiOrigin}/api/v1/health`);
const healthBody = await health.json();
if (!health.ok || healthBody?.ok !== true || healthBody?.service !== 'scrapestudio-api') {
  throw new Error(`API health smoke failed with ${health.status}.`);
}

const preflight = await request(`${apiOrigin}/api/v1/fetch-page`, {
  headers: {
    Origin: appOrigin,
    'Access-Control-Request-Headers': 'content-type,x-scrapestudio-client',
    'Access-Control-Request-Method': 'POST',
  },
  method: 'OPTIONS',
});
if (
  preflight.status !== 204 ||
  preflight.headers.get('access-control-allow-origin') !== appOrigin
) {
  throw new Error('Allowed-origin CORS preflight failed.');
}

const denied = await request(`${apiOrigin}/api/v1/health`, {
  headers: { Origin: 'https://cors-denied.invalid' },
});
if (denied.headers.has('access-control-allow-origin')) {
  throw new Error('API exposed CORS to an unapproved origin.');
}

const smokeUrl = process.env.SMOKE_FETCH_URL?.trim();
if (smokeUrl) {
  const target = new URL(smokeUrl);
  if (target.protocol !== 'https:' || target.username || target.password) {
    throw new Error('SMOKE_FETCH_URL must be an uncredentialed HTTPS URL.');
  }
  const fetched = await request(`${apiOrigin}/api/v1/fetch-page`, {
    body: JSON.stringify({ url: target.toString() }),
    headers: {
      'Content-Type': 'application/json',
      Origin: appOrigin,
      'X-ScrapeStudio-Client': crypto.randomUUID(),
    },
    method: 'POST',
  });
  const payload = await fetched.json();
  if (!fetched.ok || payload?.ok !== true || !payload?.page?.html) {
    throw new Error(`Approved live fetch smoke failed with ${fetched.status}.`);
  }
}

console.info(`Production smoke passed for ${appOrigin} and ${apiOrigin}.`);
