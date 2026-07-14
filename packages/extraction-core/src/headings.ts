import { boundedLimit, resolveExtractionLimits } from './limits.js';
import { normalizeText } from './text.js';
import type { DetachedPage, ExtractedHeading, ExtractionCollection } from './types.js';

function headingAnchor(heading: HTMLHeadingElement, page: DetachedPage): string | null {
  if (!heading.id) {
    return null;
  }

  const url = new URL(page.finalUrl);
  url.hash = heading.id;
  return url.toString();
}

export function extractHeadings(
  page: DetachedPage,
  requestedLimit?: number,
): ExtractionCollection<ExtractedHeading> {
  const defaultLimit = resolveExtractionLimits().headings;
  const limit = boundedLimit(requestedLimit, defaultLimit);
  const headings = [...page.document.querySelectorAll<HTMLHeadingElement>('h1,h2,h3,h4,h5,h6')].map(
    (heading, index): ExtractedHeading => ({
      anchor: headingAnchor(heading, page),
      level: Number(heading.tagName.slice(1)) as ExtractedHeading['level'],
      order: index + 1,
      text: normalizeText(heading.textContent),
    }),
  );
  const items = headings.slice(0, limit);

  return {
    items,
    returnedCount: items.length,
    totalCount: headings.length,
    truncated: items.length < headings.length,
  };
}
