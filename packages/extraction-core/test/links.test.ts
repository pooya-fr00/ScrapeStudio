import { describe, expect, it } from 'vitest';

import { extractLinks } from '../src/index';
import { parseFixture } from './fixture';

describe('link extraction', () => {
  it('resolves relative links and classifies every supported category', () => {
    const result = extractLinks(parseFixture('relative-links'));

    expect(result).toMatchObject({ returnedCount: 11, totalCount: 11, truncated: false });
    expect(result.items.map((link) => link.type)).toEqual([
      'internal',
      'internal',
      'external',
      'mailto',
      'tel',
      'fragment',
      'download',
      'download',
      'invalid',
      'invalid',
      'internal',
    ]);
    expect(result.items[0]).toMatchObject({
      text: 'Guide',
      url: 'https://example.com/docs/v2/guide.html',
    });
    expect(result.items[5]?.url).toBe('https://example.com/docs/v2/#details');
    expect(result.items[8]?.url).toBeNull();
    expect(result.items[9]?.url).toBeNull();
  });

  it('supports internal/external filtering, uniqueness, and a hard result cap', () => {
    const page = parseFixture('relative-links');
    const internal = extractLinks(page, { filter: 'internal' });
    const external = extractLinks(page, { filter: 'external' });
    const unique = extractLinks(page, { uniqueOnly: true });
    const capped = extractLinks(page, { limit: 2 });

    expect(internal.items).toHaveLength(3);
    expect(external.items).toHaveLength(1);
    expect(unique.totalCount).toBe(10);
    expect(capped).toMatchObject({ returnedCount: 2, totalCount: 11, truncated: true });
  });

  it('normalizes relation, target, and optional title fields', () => {
    const page = new DOMParser().parseFromString(
      '<a href="/safe" rel="NOFOLLOW noopener" target=" _blank " title="  More  info "> Read  more </a>',
      'text/html',
    );
    const result = extractLinks({
      baseUrl: new URL('https://example.com'),
      document: page,
      finalUrl: new URL('https://example.com'),
    });

    expect(result.items[0]).toEqual({
      rel: ['nofollow', 'noopener'],
      target: '_blank',
      text: 'Read more',
      title: 'More info',
      type: 'internal',
      url: 'https://example.com/safe',
    });
  });
});
