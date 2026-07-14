import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

import { productionOrigin } from './lib/deployment-config.mjs';

const dist = path.resolve(process.env.WEB_DIST_DIR ?? 'apps/web/dist');
const appOrigin = productionOrigin(process.env.PUBLIC_APP_ORIGIN, 'PUBLIC_APP_ORIGIN');
const apiOrigin = productionOrigin(process.env.PUBLIC_API_ORIGIN, 'PUBLIC_API_ORIGIN');

async function filesUnder(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await filesUnder(target)));
    else files.push(target);
  }
  return files;
}

const files = await filesUnder(dist);
const failures = [];
const forbiddenNames = /(?:^|\/)(?:poya\.txt|\.env(?:\..*)?|\.dev\.vars(?:\..*)?)$/iu;

for (const file of files) {
  const relative = path.relative(dist, file).replaceAll('\\', '/');
  if (forbiddenNames.test(relative) || relative.endsWith('.map')) failures.push(relative);
}

const [headers, robots, sitemap] = await Promise.all(
  ['_headers', 'robots.txt', 'sitemap.xml'].map((file) => readFile(path.join(dist, file), 'utf8')),
);
if (
  !headers.includes(`connect-src 'self' ${apiOrigin}`) ||
  /connect-src\s+'self'\s+https:(?:\s|;)/u.test(headers)
) {
  failures.push('_headers does not use the exact production API origin');
}
if (!robots.includes(`Sitemap: ${appOrigin}/sitemap.xml`)) {
  failures.push('robots.txt does not reference the exact production sitemap');
}
if (
  !sitemap.includes(`<loc>${appOrigin}/en</loc>`) ||
  !sitemap.includes(`<loc>${appOrigin}/fa</loc>`)
) {
  failures.push('sitemap.xml is missing localized production roots');
}

if (failures.length > 0) {
  throw new Error(
    `Unsafe or incomplete release artifacts:\n${failures.map((item) => `- ${item}`).join('\n')}`,
  );
}
console.info(
  `Checked ${files.length} web release files; no private files, maps, or broad API CSP remain.`,
);
