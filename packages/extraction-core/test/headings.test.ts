import { describe, expect, it } from 'vitest';

import { extractHeadings } from '../src/index';
import { parseFixture } from './fixture';

describe('heading extraction', () => {
  it('returns heading text, semantic level, document order, and optional anchors', () => {
    const result = extractHeadings(parseFixture('article'));

    expect(result.items).toEqual([
      {
        anchor: 'https://example.com/source/page#guide',
        level: 1,
        order: 1,
        text: 'Urban stargazing',
      },
      {
        anchor: 'https://example.com/source/page#prepare%20kit',
        level: 2,
        order: 2,
        text: 'Prepare a small kit',
      },
      {
        anchor: null,
        level: 3,
        order: 3,
        text: 'Choose the clearest hour',
      },
    ]);
  });

  it('caps returned headings while retaining the total count', () => {
    const result = extractHeadings(parseFixture('article'), 2);

    expect(result).toMatchObject({ returnedCount: 2, totalCount: 3, truncated: true });
  });
});
