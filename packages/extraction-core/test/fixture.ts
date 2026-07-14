import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { parseDetachedPage } from '../src/index';

export function loadFixture(name: string): string {
  return readFileSync(resolve(process.cwd(), 'tests', 'fixtures', `${name}.html`), 'utf8');
}

export function parseFixture(name: string, finalUrl = 'https://example.com/source/page') {
  return parseDetachedPage(loadFixture(name), finalUrl);
}
