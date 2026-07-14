import { PUBLIC_EXTRACTION_LIMITS } from '@scrapestudio/shared';

export const EXTRACTION_LIMITS = {
  headings: 500,
  images: PUBLIC_EXTRACTION_LIMITS.images,
  jsonLdBlocks: PUBLIC_EXTRACTION_LIMITS.jsonLdBlocks,
  links: PUBLIC_EXTRACTION_LIMITS.links,
  tableColumns: 100,
  tableRows: PUBLIC_EXTRACTION_LIMITS.rows,
  tables: 50,
} as const;

export interface ExtractionLimits {
  headings: number;
  images: number;
  jsonLdBlocks: number;
  links: number;
  tableColumns: number;
  tableRows: number;
  tables: number;
}

export function resolveExtractionLimits(
  overrides: Partial<ExtractionLimits> = {},
): ExtractionLimits {
  return {
    headings: boundedLimit(overrides.headings, EXTRACTION_LIMITS.headings),
    images: boundedLimit(overrides.images, EXTRACTION_LIMITS.images),
    jsonLdBlocks: boundedLimit(overrides.jsonLdBlocks, EXTRACTION_LIMITS.jsonLdBlocks),
    links: boundedLimit(overrides.links, EXTRACTION_LIMITS.links),
    tableColumns: boundedLimit(overrides.tableColumns, EXTRACTION_LIMITS.tableColumns),
    tableRows: boundedLimit(overrides.tableRows, EXTRACTION_LIMITS.tableRows),
    tables: boundedLimit(overrides.tables, EXTRACTION_LIMITS.tables),
  };
}

export function boundedLimit(requested: number | undefined, maximum: number): number {
  if (requested === undefined || !Number.isFinite(requested)) {
    return maximum;
  }
  return Math.max(0, Math.min(maximum, Math.trunc(requested)));
}
