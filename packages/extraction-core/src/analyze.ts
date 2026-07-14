import { extractHeadings } from './headings.js';
import { extractImages } from './images.js';
import { extractLinks, type LinkExtractionOptions } from './links.js';
import { resolveExtractionLimits, type ExtractionLimits } from './limits.js';
import { extractMetadata } from './metadata.js';
import { parseDetachedPage, type DetachedParser } from './parse.js';
import { extractTables } from './tables.js';
import type { PageAnalysis } from './types.js';

export interface AnalyzePageOptions {
  limits?: Partial<ExtractionLimits>;
  linkOptions?: Omit<LinkExtractionOptions, 'limit'>;
  parser?: DetachedParser;
}

export function analyzePage(
  html: string,
  finalUrl: string,
  options: AnalyzePageOptions = {},
): PageAnalysis {
  const page = parseDetachedPage(html, finalUrl, options.parser);
  const limits = resolveExtractionLimits(options.limits);

  return {
    headings: extractHeadings(page, limits.headings),
    images: extractImages(page, limits.images),
    links: extractLinks(page, { ...options.linkOptions, limit: limits.links }),
    metadata: extractMetadata(page, limits.jsonLdBlocks),
    tables: extractTables(page.document, {
      columnLimit: limits.tableColumns,
      rowLimit: limits.tableRows,
      tableLimit: limits.tables,
    }),
  };
}
