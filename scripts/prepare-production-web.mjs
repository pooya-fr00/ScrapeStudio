import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import {
  productionHeaders,
  productionOrigin,
  productionRobots,
  productionSitemap,
} from './lib/deployment-config.mjs';

const dist = path.resolve(process.env.WEB_DIST_DIR ?? 'apps/web/dist');
const appOrigin = productionOrigin(process.env.PUBLIC_APP_ORIGIN, 'PUBLIC_APP_ORIGIN');
const apiOrigin = productionOrigin(process.env.PUBLIC_API_ORIGIN, 'PUBLIC_API_ORIGIN');
const buildApiOrigin = productionOrigin(process.env.VITE_API_BASE_URL, 'VITE_API_BASE_URL');

if (apiOrigin !== buildApiOrigin) {
  throw new Error('VITE_API_BASE_URL must exactly match PUBLIC_API_ORIGIN.');
}

const headersPath = path.join(dist, '_headers');
const headers = await readFile(headersPath, 'utf8');
await Promise.all([
  writeFile(headersPath, productionHeaders(headers, apiOrigin)),
  writeFile(path.join(dist, 'robots.txt'), productionRobots(appOrigin)),
  writeFile(path.join(dist, 'sitemap.xml'), productionSitemap(appOrigin)),
]);

console.info(`Prepared exact-origin web release assets for ${appOrigin} -> ${apiOrigin}.`);
