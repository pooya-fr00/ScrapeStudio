import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const DOCUMENTS = [
  'CHANGELOG.md',
  'CODE_OF_CONDUCT.md',
  'CONTRIBUTING.md',
  'README.md',
  'SECURITY.md',
  'docs/CODE_GENERATOR.md',
  'docs/DEPLOYMENT.md',
  'docs/EXTRACTION_CORE.md',
  'docs/HARDENING.md',
  'docs/IMPLEMENTATION_STATUS.md',
  'docs/LOCAL_DATA_AND_EXPORT.md',
  'docs/PLAYGROUND_AND_PUBLIC_DOCS.md',
  'docs/RELEASE_CHECKLIST.md',
  'docs/SECURE_FETCH.md',
  'docs/SMART_REPEATED_STRUCTURES.md',
];

const failures = [];

for (const document of DOCUMENTS) {
  const source = await readFile(path.join(ROOT, document), 'utf8');
  const links = source.matchAll(/\[[^\]]*\]\(([^)]+)\)/gu);

  for (const [, rawTarget] of links) {
    const target = rawTarget.trim().replace(/^<|>$/gu, '');
    if (/^(?:https?:|mailto:|#)/u.test(target)) continue;

    const pathname = decodeURIComponent(target.split('#')[0]?.split('?')[0] ?? '');
    if (!pathname) continue;

    const resolved = path.resolve(path.dirname(path.join(ROOT, document)), pathname);
    try {
      await access(resolved);
    } catch {
      failures.push(`${document}: ${target}`);
    }
  }
}

if (failures.length > 0) {
  console.error(
    `Broken local documentation links:\n${failures.map((failure) => `- ${failure}`).join('\n')}`,
  );
  process.exitCode = 1;
} else {
  console.info(`Checked local links in ${DOCUMENTS.length} documentation files.`);
}
