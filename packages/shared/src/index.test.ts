import { describe, expect, it } from 'vitest';

import {
  API_ERROR_CODES,
  LOCAL_DATA_LIMITS,
  PROJECT_NAME,
  PUBLIC_EXTRACTION_LIMITS,
  SUPPORTED_LOCALES,
} from './index';

describe('project metadata', () => {
  it('defines the public product name and required locales', () => {
    expect(PROJECT_NAME).toBe('ScrapeStudio');
    expect(SUPPORTED_LOCALES).toEqual(['en', 'fa']);
    expect(PUBLIC_EXTRACTION_LIMITS).toEqual({
      customFields: 10,
      customItemMatches: 200,
      customValuesPerField: 100,
      images: 100,
      jsonLdBlocks: 20,
      links: 500,
      rows: 200,
    });
    expect(LOCAL_DATA_LIMITS).toEqual({ historyEntries: 100, recipes: 100 });
    expect(new Set(API_ERROR_CODES).size).toBe(API_ERROR_CODES.length);
    expect(API_ERROR_CODES).toContain('FETCH_TIMEOUT');
  });
});
