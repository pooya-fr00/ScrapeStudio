import { productionOrigin, workerName } from './lib/deployment-config.mjs';

productionOrigin(process.env.PUBLIC_APP_ORIGIN, 'PUBLIC_APP_ORIGIN');
productionOrigin(process.env.PUBLIC_API_ORIGIN, 'PUBLIC_API_ORIGIN');
workerName(process.env.CLOUDFLARE_WORKER_NAME);
workerName(process.env.CLOUDFLARE_PAGES_PROJECT);

const smokeTarget = new URL(process.env.SMOKE_FETCH_URL ?? '');
if (smokeTarget.protocol !== 'https:' || smokeTarget.username || smokeTarget.password) {
  throw new Error(
    'SMOKE_FETCH_URL must be an uncredentialed HTTPS page approved for a single smoke fetch.',
  );
}

const requiredSecrets = [
  ['CLOUDFLARE_API_TOKEN', process.env.CLOUDFLARE_API_TOKEN, 20],
  ['CLOUDFLARE_ACCOUNT_ID', process.env.CLOUDFLARE_ACCOUNT_ID, 16],
  ['IP_HASH_SALT', process.env.IP_HASH_SALT, 32],
];
for (const [label, value, minimum] of requiredSecrets) {
  if (!value || value.length < minimum) throw new Error(`${label} is missing or too short.`);
}
console.info('Production origins, resource names, smoke target, and secret presence are valid.');
