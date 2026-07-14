import { analyzePage } from '@scrapestudio/extraction-core';
import { describe, expect, it } from 'vitest';

import { createDemoHtml, createDemoPage, getDemoUrl } from './demo';

describe('phase nine bundled demos', () => {
  it('provides twelve original repeated product cards', () => {
    const page = createDemoPage(0, 'products', 'en');
    const analysis = analyzePage(page.html, page.finalUrl);

    expect(page.finalUrl).toBe(getDemoUrl('products', 'en'));
    expect(page.html.match(/class="product-card"/gu)).toHaveLength(12);
    expect(analysis.links.totalCount).toBe(12);
    expect(analysis.images.totalCount).toBe(12);
    expect(page.html).toContain('Field Notes Supply Co.');
  });

  it('provides a meaningful eight-row semantic table', () => {
    const page = createDemoPage(0, 'table', 'en');
    const analysis = analyzePage(page.html, page.finalUrl);

    expect(analysis.tables.totalCount).toBe(1);
    expect(analysis.tables.items[0]?.rows).toHaveLength(8);
    expect(analysis.tables.items[0]?.columns).toEqual([
      'Session',
      'Time',
      'Place',
      'Capacity',
      'Status',
    ]);
  });

  it('provides an article with headings, metadata, image, link, and JSON-LD', () => {
    const page = createDemoPage(0, 'article', 'en');
    const analysis = analyzePage(page.html, page.finalUrl);

    expect(analysis.headings.totalCount).toBe(4);
    expect(analysis.images.totalCount).toBe(1);
    expect(analysis.links.totalCount).toBe(1);
    expect(analysis.metadata.jsonLd.totalCount).toBe(1);
    expect(analysis.metadata.description).toContain('original long-form sample');
  });

  it('bundles Persian equivalents with explicit RTL document metadata', () => {
    const html = createDemoHtml('products', 'fa');

    expect(html).toContain('<html lang="fa" dir="rtl">');
    expect(html).toContain('فروشگاه یادداشت‌های میدانی');
    expect(html.match(/class="product-card"/gu)).toHaveLength(12);
  });
});
