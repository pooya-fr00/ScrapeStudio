import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import {
  createProductionWorkerConfig,
  parseJsonc,
  relativeToRoot,
} from './lib/deployment-config.mjs';

const basePath = path.resolve('apps/api/wrangler.jsonc');
const outputPath = path.resolve(
  process.env.WORKER_CONFIG_OUTPUT ?? 'apps/api/wrangler.production.generated.json',
);
const baseConfig = parseJsonc(await readFile(basePath, 'utf8'));
const config = createProductionWorkerConfig(baseConfig, {
  appOrigin: process.env.PUBLIC_APP_ORIGIN,
  workerName: process.env.CLOUDFLARE_WORKER_NAME,
});

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(config, null, 2)}\n`, { mode: 0o600 });
console.info(`Prepared secret-free Worker configuration at ${relativeToRoot(outputPath)}.`);
