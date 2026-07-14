import { describe, expect, it } from 'vitest';

import { extractMetadata, visibleDocumentText } from '../src/index';
import { parseFixture } from './fixture';

describe('metadata extraction', () => {
  it('extracts standard, Open Graph, Twitter, JSON-LD, canonical, and favicon fields', () => {
    const page = parseFixture('metadata');
    const metadata = extractMetadata(page);

    expect(metadata).toMatchObject({
      canonicalUrl: 'https://cdn.example.org/articles/urban-garden',
      description: 'راهنمای کوتاه برای نگهداری یک باغچه کوچک شهری',
      documentLanguage: 'fa',
      h1Count: 1,
      robots: 'index,follow',
      title: 'راهنمای باغچه شهری',
      viewport: 'width=device-width, initial-scale=1',
    });
    expect(metadata.openGraph).toEqual({
      'og:image': ['cover-large.jpg', 'cover-square.jpg'],
      'og:title': ['باغچه شهری'],
    });
    expect(metadata.twitter).toEqual({
      'twitter:card': ['summary_large_image'],
    });
    expect(metadata.favicons).toEqual([
      {
        rel: ['icon'],
        sizes: 'any',
        type: 'image/svg+xml',
        url: 'https://cdn.example.org/guides/icons/garden.svg',
      },
      {
        rel: ['apple-touch-icon'],
        sizes: null,
        type: null,
        url: 'https://cdn.example.org/icons/touch.png',
      },
    ]);
    expect(metadata.jsonLd).toMatchObject({
      returnedCount: 2,
      totalCount: 2,
      truncated: false,
    });
    expect(metadata.jsonLd.items[0]).toMatchObject({
      valid: true,
      value: { '@type': 'Article', headline: 'راهنمای باغچه شهری' },
    });
    expect(metadata.jsonLd.items[1]).toMatchObject({ valid: false, value: null });
  });

  it('computes basic document statistics without script or style content', () => {
    const page = parseFixture('article');
    const metadata = extractMetadata(page);
    const text = visibleDocumentText(page.document);

    expect(metadata.statistics).toMatchObject({
      headingCount: 3,
      imageCount: 0,
      linkCount: 0,
      paragraphCount: 3,
      tableCount: 0,
    });
    expect(metadata.statistics.textLength).toBe(text.length);
    expect(metadata.statistics.wordEstimate).toBeGreaterThan(20);
    expect(text).not.toContain('window.shouldNeverRun');
    expect(text).not.toContain('not document text');
  });

  it('caps JSON-LD blocks and reports truncation', () => {
    const result = extractMetadata(parseFixture('metadata'), 1).jsonLd;

    expect(result).toMatchObject({ returnedCount: 1, totalCount: 2, truncated: true });
  });
});
