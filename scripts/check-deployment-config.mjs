import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import {
  createProductionWorkerConfig,
  parseJsonc,
  productionHeaders,
  productionRobots,
  productionSitemap,
} from './lib/deployment-config.mjs';

const [apiConfigSource, headers, workflow, ignore, rootPackage] = await Promise.all([
  readFile('apps/api/wrangler.jsonc', 'utf8'),
  readFile('apps/web/public/_headers', 'utf8'),
  readFile('.github/workflows/deploy-production.yml', 'utf8'),
  readFile('.gitignore', 'utf8'),
  readFile('package.json', 'utf8'),
]);
const baseConfig = parseJsonc(apiConfigSource);
const packageJson = JSON.parse(rootPackage);
const failures = [];

if (
  baseConfig.vars?.ALLOWED_ORIGINS !== '' ||
  baseConfig.vars?.EXTERNAL_FETCH_ENABLED !== 'false'
) {
  failures.push('the committed Worker configuration must fail closed');
}
if (/\bpush\s*:/u.test(workflow) || !workflow.includes('workflow_dispatch:')) {
  failures.push('production deployment must be manual-only');
}
for (const required of [
  "inputs.confirm == 'DEPLOY_PRODUCTION'",
  'CLOUDFLARE_API_TOKEN',
  'CLOUDFLARE_ACCOUNT_ID',
  'IP_HASH_SALT',
  'PUBLIC_APP_ORIGIN',
  'PUBLIC_API_ORIGIN',
  'SMOKE_FETCH_URL',
]) {
  if (!workflow.includes(required)) failures.push(`deployment workflow is missing ${required}`);
}
if (!/environment:\s*\n\s+name:\s*production/u.test(workflow)) {
  failures.push('deployment workflow is missing the protected production environment');
}
for (const script of ['build:production', 'check:release-artifacts', 'test:smoke']) {
  if (!packageJson.scripts?.[script]) failures.push(`package.json is missing ${script}`);
}
if (!ignore.includes('wrangler.production.generated.json')) {
  failures.push('generated production Worker config is not ignored');
}

const appOrigin = 'https://app.scrapestudio.example';
const apiOrigin = 'https://api.scrapestudio.example';
const generated = createProductionWorkerConfig(baseConfig, {
  appOrigin,
  workerName: 'scrapestudio-api',
});
if (
  generated.vars.ALLOWED_ORIGINS !== appOrigin ||
  generated.vars.EXTERNAL_FETCH_ENABLED !== 'true'
) {
  failures.push('production Worker generation did not enable exact-origin public fetching');
}
if ('IP_HASH_SALT' in generated.vars) failures.push('generated Worker config contains a secret');

const temporary = await mkdtemp(path.join(os.tmpdir(), 'scrapestudio-deploy-check-'));
try {
  await Promise.all([
    writeFile(path.join(temporary, '_headers'), productionHeaders(headers, apiOrigin)),
    writeFile(path.join(temporary, 'robots.txt'), productionRobots(appOrigin)),
    writeFile(path.join(temporary, 'sitemap.xml'), productionSitemap(appOrigin)),
  ]);
  const finalizedHeaders = await readFile(path.join(temporary, '_headers'), 'utf8');
  if (/connect-src\s+'self'\s+https:(?:\s|;)/u.test(finalizedHeaders)) {
    failures.push('production CSP still permits every HTTPS connection');
  }
} finally {
  await rm(temporary, { force: true, recursive: true });
}

if (failures.length > 0) {
  throw new Error(
    `Deployment configuration checks failed:\n${failures.map((item) => `- ${item}`).join('\n')}`,
  );
}
console.info(
  'Deployment configuration is manual-only, fail-closed, exact-origin, and secret-free.',
);
