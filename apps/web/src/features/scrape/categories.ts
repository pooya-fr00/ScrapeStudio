import type { PageAnalysis } from '@scrapestudio/extraction-core';

export const RESULT_CATEGORIES = ['tables', 'links', 'images', 'headings', 'metadata'] as const;
export type ResultCategory = (typeof RESULT_CATEGORIES)[number];

export function metadataFieldCount(metadata: PageAnalysis['metadata']): number {
  return (
    [
      metadata.title,
      metadata.description,
      metadata.canonicalUrl,
      metadata.documentLanguage,
      metadata.robots,
      metadata.viewport,
    ].filter(Boolean).length +
    Object.keys(metadata.openGraph).length +
    Object.keys(metadata.twitter).length +
    metadata.jsonLd.returnedCount +
    metadata.favicons.length
  );
}

export function categoryCount(analysis: PageAnalysis, category: ResultCategory): number {
  switch (category) {
    case 'headings':
      return analysis.headings.totalCount;
    case 'images':
      return analysis.images.totalCount;
    case 'links':
      return analysis.links.totalCount;
    case 'metadata':
      return metadataFieldCount(analysis.metadata);
    case 'tables':
      return analysis.tables.totalCount;
  }
}

export function initialCategory(analysis: PageAnalysis): ResultCategory {
  return RESULT_CATEGORIES.find((category) => categoryCount(analysis, category) > 0) ?? 'metadata';
}

export function hasLittleExtractableContent(analysis: PageAnalysis): boolean {
  return (
    analysis.tables.totalCount === 0 &&
    analysis.links.totalCount === 0 &&
    analysis.images.totalCount === 0 &&
    analysis.headings.totalCount === 0 &&
    analysis.metadata.statistics.textLength < 50
  );
}
