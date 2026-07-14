import { describe, expect, it } from 'vitest';

import { extractImages, parseDetachedPage } from '../src/index';
import { parseFixture } from './fixture';

describe('image extraction', () => {
  it('extracts src, lazy data-src, and the strongest srcset candidate', () => {
    const result = extractImages(parseFixture('products'));

    expect(result).toMatchObject({ returnedCount: 3, totalCount: 3, truncated: false });
    expect(result.items[0]).toEqual({
      alt: 'A cedar-colored notebook',
      height: 480,
      loading: null,
      sourceAttribute: 'src',
      title: null,
      url: 'https://example.com/images/cedar.jpg',
      width: 640,
    });
    expect(result.items[1]).toMatchObject({
      loading: 'lazy',
      sourceAttribute: 'data-src',
      url: 'https://example.com/images/brass-ruler.jpg',
    });
    expect(result.items[2]).toMatchObject({
      sourceAttribute: 'srcset',
      url: 'https://example.com/images/indigo-large.jpg',
    });
  });

  it('ignores unsupported sources, falls back to a valid source, and enforces limits', () => {
    const page = parseDetachedPage(
      `<img srcset="data:image/png;base64,abc 2x" data-src="/fallback.jpg" width="0">
       <img src="javascript:alert(1)">
       <img src="/second.jpg">`,
      'https://example.com/catalog',
    );
    const result = extractImages(page, 1);

    expect(result).toMatchObject({ returnedCount: 1, totalCount: 2, truncated: true });
    expect(result.items[0]).toMatchObject({
      sourceAttribute: 'data-src',
      url: 'https://example.com/fallback.jpg',
      width: null,
    });
  });
});
