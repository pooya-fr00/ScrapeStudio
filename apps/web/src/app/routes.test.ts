import { describe, expect, it } from 'vitest';

import { localizedPath, localizedPlaygroundPath, replacePathLocale } from './routes';

describe('localized route helpers', () => {
  it('builds locale-prefixed routes', () => {
    expect(localizedPath('en', 'home')).toBe('/en');
    expect(localizedPath('fa', 'workspace')).toBe('/fa/scrape');
    expect(localizedPath('fa', 'docs')).toBe('/fa/docs');
    expect(localizedPath('en', 'history')).toBe('/en/history');
    expect(localizedPath('fa', 'responsibleUse')).toBe('/fa/responsible-use');
    expect(localizedPlaygroundPath('en', 'products')).toBe('/en/playground/products');
  });

  it('replaces only the locale segment of an existing route', () => {
    expect(replacePathLocale('/fa/docs', 'en')).toBe('/en/docs');
    expect(replacePathLocale('/en/tools', 'fa')).toBe('/fa/tools');
  });

  it('returns the locale home for an empty path', () => {
    expect(replacePathLocale('/', 'fa')).toBe('/fa');
  });
});
