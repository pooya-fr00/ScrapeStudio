import { describe, expect, it } from 'vitest';

import {
  EXTRACTION_LIMITS,
  analyzePage,
  extractTable,
  parseDetachedPage,
  resolveExtractionLimits,
} from '../src/index';

describe('extraction safety limits', () => {
  it('does not permit runtime overrides above the documented public limits', () => {
    expect(
      resolveExtractionLimits({
        headings: 10_000,
        images: -1,
        links: Number.NaN,
        tableRows: 10,
      }),
    ).toMatchObject({
      headings: EXTRACTION_LIMITS.headings,
      images: 0,
      links: EXTRACTION_LIMITS.links,
      tableRows: 10,
    });
  });

  it('caps every repeated extraction category and retains total counts', () => {
    const anchors = Array.from({ length: 510 }, (_, index) => `<a href="/${index}">L</a>`).join('');
    const images = Array.from({ length: 110 }, (_, index) => `<img src="/${index}.png">`).join('');
    const headings = Array.from({ length: 510 }, (_, index) => `<h2>H${index}</h2>`).join('');
    const scripts = Array.from(
      { length: 25 },
      (_, index) => `<script type="application/ld+json">{"index":${index}}</script>`,
    ).join('');
    const tables = Array.from(
      { length: 55 },
      (_, index) => `<table><tr><td>${index}</td></tr></table>`,
    ).join('');
    const analysis = analyzePage(
      `<html><head>${scripts}</head><body>${anchors}${images}${headings}${tables}</body></html>`,
      'https://example.com',
    );

    expect(analysis.links).toMatchObject({ returnedCount: 500, totalCount: 510, truncated: true });
    expect(analysis.images).toMatchObject({ returnedCount: 100, totalCount: 110, truncated: true });
    expect(analysis.headings).toMatchObject({
      returnedCount: 500,
      totalCount: 510,
      truncated: true,
    });
    expect(analysis.metadata.jsonLd).toMatchObject({
      returnedCount: 20,
      totalCount: 25,
      truncated: true,
    });
    expect(analysis.tables).toMatchObject({ returnedCount: 50, totalCount: 55, truncated: true });
  });

  it('caps extracted table rows at 200', () => {
    const rows = Array.from({ length: 205 }, (_, index) => `<tr><td>${index}</td></tr>`).join('');
    const document = parseDetachedPage(`<table>${rows}</table>`, 'https://example.com').document;
    const table = document.querySelector('table');
    expect(table).not.toBeNull();
    const result = extractTable(table as HTMLTableElement, 0);

    expect(result).toMatchObject({
      returnedRowCount: 200,
      rowCount: 205,
      truncated: true,
    });
  });

  it('applies lower per-analysis limits and link options through the public facade', () => {
    const result = analyzePage(
      '<a href="/one">One</a><a href="/one">Duplicate</a><a href="https://outside.example">Outside</a>',
      'https://example.com',
      {
        limits: { links: 1 },
        linkOptions: { filter: 'internal', uniqueOnly: true },
      },
    );

    expect(result.links).toMatchObject({
      returnedCount: 1,
      totalCount: 1,
      truncated: false,
    });
    expect(result.links.items[0]?.url).toBe('https://example.com/one');
  });
});
