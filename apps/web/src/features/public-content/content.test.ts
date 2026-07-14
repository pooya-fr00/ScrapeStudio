import { describe, expect, it } from 'vitest';

import { DOCUMENT_SLUGS, phaseNineContent, TOOL_GUIDE_SLUGS } from './content';

function collectStrings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(collectStrings);
  if (value && typeof value === 'object') {
    return Object.values(value).flatMap(collectStrings);
  }
  return [];
}

describe('localized public content', () => {
  it('provides every public document and tool guide in both locales', () => {
    for (const locale of ['en', 'fa'] as const) {
      expect(Object.keys(phaseNineContent[locale].documents).sort()).toEqual(
        [...DOCUMENT_SLUGS].sort(),
      );
      expect(Object.keys(phaseNineContent[locale].tools).sort()).toEqual(
        [...TOOL_GUIDE_SLUGS].sort(),
      );
    }
  });

  it('contains no blank public copy in either locale', () => {
    for (const locale of ['en', 'fa'] as const) {
      const strings = collectStrings(phaseNineContent[locale]);
      expect(strings.length).toBeGreaterThan(100);
      expect(strings.every((value) => value.trim().length > 0)).toBe(true);
    }
  });
});
