import { describe, expect, it } from 'vitest';

import { analyzePage } from '../src/index';
import { loadFixture } from './fixture';

describe('fixture-driven page analysis', () => {
  it.each(['products', 'table', 'article', 'metadata', 'relative-links', 'repeated-cards'])(
    'analyzes the %s fixture into serializable extraction results',
    (fixture) => {
      const result = analyzePage(loadFixture(fixture), 'https://example.com/source/page');

      expect(() => JSON.stringify(result)).not.toThrow();
      expect(result).not.toHaveProperty('document');
    },
  );

  it('repairs malformed HTML and completes every extractor without throwing', () => {
    const result = analyzePage(loadFixture('malformed'), 'https://example.com/source/page');

    expect(result.headings.items[0]?.text).toContain('Recovered heading');
    expect(result.links.items[0]).toMatchObject({
      type: 'internal',
      url: 'https://example.com/recovered',
    });
    expect(result.images.items[0]).toMatchObject({
      url: 'https://example.com/recovered.png',
      width: null,
    });
    expect(result.metadata.jsonLd.items[0]).toMatchObject({ valid: false });
    expect(result.tables.items[0]?.rowCount).toBeGreaterThan(0);
    expect(() => JSON.stringify(result)).not.toThrow();
  });
});
