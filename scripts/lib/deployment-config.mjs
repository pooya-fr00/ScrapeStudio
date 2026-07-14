import path from 'node:path';

export const PRODUCTION_ROUTES = [
  '',
  '/about',
  '/docs',
  '/limitations',
  '/methodology',
  '/playground',
  '/playground/article',
  '/playground/products',
  '/playground/table',
  '/privacy',
  '/responsible-use',
  '/security',
  '/tools',
];

export function parseJsonc(source) {
  return JSON.parse(source.replace(/,\s*([}\]])/gu, '$1'));
}

export function productionOrigin(value, label) {
  if (!value?.trim()) throw new Error(`${label} is required.`);

  let url;
  try {
    url = new URL(value.trim());
  } catch {
    throw new Error(`${label} must be a valid absolute URL.`);
  }

  if (url.protocol !== 'https:') throw new Error(`${label} must use HTTPS.`);
  if (url.username || url.password || url.search || url.hash || url.pathname !== '/') {
    throw new Error(`${label} must be an origin without credentials, path, query, or fragment.`);
  }
  if (url.hostname === 'localhost' || url.hostname.endsWith('.localhost')) {
    throw new Error(`${label} must not target localhost.`);
  }

  return url.origin;
}

export function workerName(value) {
  const name = value?.trim();
  if (!name || !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/u.test(name)) {
    throw new Error('CLOUDFLARE_WORKER_NAME must be a lowercase Cloudflare-safe name.');
  }
  return name;
}

export function createProductionWorkerConfig(baseConfig, options) {
  const appOrigin = productionOrigin(options.appOrigin, 'PUBLIC_APP_ORIGIN');
  const name = workerName(options.workerName);

  return {
    ...structuredClone(baseConfig),
    name,
    vars: {
      ...baseConfig.vars,
      ALLOWED_ORIGINS: appOrigin,
      DEMO_ONLY_MODE: 'false',
      EXPERIMENTAL_BROWSER_ENABLED: 'false',
      EXTERNAL_FETCH_ENABLED: 'true',
      SMART_DETECTION_ENABLED: 'true',
    },
  };
}

function xml(value) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

export function productionSitemap(appOrigin) {
  const origin = productionOrigin(appOrigin, 'PUBLIC_APP_ORIGIN');
  const locations = ['en', 'fa'].flatMap((locale) =>
    PRODUCTION_ROUTES.map(
      (route) => `  <url><loc>${xml(`${origin}/${locale}${route}`)}</loc></url>`,
    ),
  );

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...locations,
    '</urlset>',
    '',
  ].join('\n');
}

export function productionRobots(appOrigin) {
  const origin = productionOrigin(appOrigin, 'PUBLIC_APP_ORIGIN');
  return [
    'User-agent: *',
    'Allow: /',
    'Disallow: /en/scrape',
    'Disallow: /fa/scrape',
    'Disallow: /en/recipes',
    'Disallow: /fa/recipes',
    'Disallow: /en/history',
    'Disallow: /fa/history',
    `Sitemap: ${origin}/sitemap.xml`,
    '',
  ].join('\n');
}

export function productionHeaders(template, apiOrigin) {
  const origin = productionOrigin(apiOrigin, 'PUBLIC_API_ORIGIN');
  const expected = "connect-src 'self' https:";
  if (!template.includes(expected)) {
    throw new Error(`The static header template is missing ${expected}.`);
  }
  return template.replace(expected, `connect-src 'self' ${origin}`);
}

export function relativeToRoot(target) {
  return path.relative(process.cwd(), target).replaceAll('\\', '/');
}
