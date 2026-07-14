import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const DIST_DIR = path.resolve('apps/web/dist');
const ASSETS_DIR = path.join(DIST_DIR, 'assets');
const KIB = 1024;
const BUDGETS = {
  largestCss: 100 * KIB,
  largestJavaScript: 350 * KIB,
  totalJavaScript: 700 * KIB,
};

async function assetSizes(extension) {
  const names = (await readdir(ASSETS_DIR)).filter((name) => name.endsWith(extension));
  return Promise.all(
    names.map(async (name) => ({
      bytes: (await stat(path.join(ASSETS_DIR, name))).size,
      name,
    })),
  );
}

function largest(assets) {
  return assets.reduce((current, asset) => (asset.bytes > current.bytes ? asset : current), {
    bytes: 0,
    name: 'none',
  });
}

function assertWithin(label, actual, budget) {
  if (actual > budget) {
    throw new Error(
      `${label} is ${(actual / KIB).toFixed(2)} KiB; the release budget is ${(budget / KIB).toFixed(2)} KiB.`,
    );
  }
}

const [javascript, css, headers, redirects, robots] = await Promise.all([
  assetSizes('.js'),
  assetSizes('.css'),
  stat(path.join(DIST_DIR, '_headers')),
  stat(path.join(DIST_DIR, '_redirects')),
  stat(path.join(DIST_DIR, 'robots.txt')),
]);

if (headers.size === 0 || redirects.size === 0 || robots.size === 0) {
  throw new Error('Production headers, SPA redirects, and robots policy must not be empty.');
}

const largestJavaScript = largest(javascript);
const largestCss = largest(css);
const totalJavaScript = javascript.reduce((total, asset) => total + asset.bytes, 0);

assertWithin('Largest JavaScript asset', largestJavaScript.bytes, BUDGETS.largestJavaScript);
assertWithin('Total JavaScript assets', totalJavaScript, BUDGETS.totalJavaScript);
assertWithin('Largest CSS asset', largestCss.bytes, BUDGETS.largestCss);

console.info(
  JSON.stringify({
    largestCss: { ...largestCss, kib: Number((largestCss.bytes / KIB).toFixed(2)) },
    largestJavaScript: {
      ...largestJavaScript,
      kib: Number((largestJavaScript.bytes / KIB).toFixed(2)),
    },
    totalJavaScriptKiB: Number((totalJavaScript / KIB).toFixed(2)),
  }),
);
