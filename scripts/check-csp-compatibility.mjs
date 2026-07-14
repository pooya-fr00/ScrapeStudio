import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const SOURCE_ROOTS = ['apps/web/src', 'apps/web/index.html'];
const SOURCE_EXTENSIONS = new Set(['.html', '.ts', '.tsx']);
const FORBIDDEN_PATTERNS = [
  { label: 'React inline style', pattern: /\bstyle\s*=\s*\{/gu },
  { label: 'DOM inline style mutation', pattern: /\.style\s*\./gu },
  { label: 'raw HTML injection', pattern: /dangerouslySetInnerHTML/gu },
];

async function sourceFiles(entry) {
  const absolute = path.resolve(entry);
  if (path.extname(absolute)) return [absolute];

  const files = [];
  for (const item of await readdir(absolute, { withFileTypes: true })) {
    const target = path.join(absolute, item.name);
    if (item.isDirectory()) files.push(...(await sourceFiles(target)));
    else if (SOURCE_EXTENSIONS.has(path.extname(item.name)) && !item.name.includes('.test.')) {
      files.push(target);
    }
  }
  return files;
}

const files = (await Promise.all(SOURCE_ROOTS.map(sourceFiles))).flat();
const failures = [];

for (const file of files) {
  const source = await readFile(file, 'utf8');
  for (const { label, pattern } of FORBIDDEN_PATTERNS) {
    pattern.lastIndex = 0;
    if (pattern.test(source)) failures.push(`${path.relative(process.cwd(), file)}: ${label}`);
  }
}

if (failures.length > 0) {
  console.error(
    `Frontend source is incompatible with the production CSP:\n${failures.map((failure) => `- ${failure}`).join('\n')}`,
  );
  process.exitCode = 1;
} else {
  console.info(`Checked ${files.length} frontend source files for CSP-incompatible patterns.`);
}
