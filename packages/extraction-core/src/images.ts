import { boundedLimit, resolveExtractionLimits } from './limits.js';
import { normalizeText } from './text.js';
import type { DetachedPage, ExtractedImage, ExtractionCollection } from './types.js';
import { resolveHttpUrl } from './url.js';

interface SourceCandidate {
  attribute: ExtractedImage['sourceAttribute'];
  value: string;
}

function bestSrcsetCandidate(srcset: string | null): string | null {
  if (srcset?.trim().toLowerCase().includes('data:')) {
    return null;
  }

  const candidates = (srcset ?? '')
    .split(',')
    .map((candidate, index) => {
      const [url = '', descriptor = ''] = candidate.trim().split(/\s+/u, 2);
      const width = descriptor.endsWith('w') ? Number(descriptor.slice(0, -1)) : 0;
      const density = descriptor.endsWith('x') ? Number(descriptor.slice(0, -1)) : 0;
      return {
        density: Number.isFinite(density) ? density : 0,
        index,
        url,
        width: Number.isFinite(width) ? width : 0,
      };
    })
    .filter((candidate) => candidate.url);

  if (candidates.length === 0) {
    return null;
  }

  const hasWidths = candidates.some((candidate) => candidate.width > 0);
  return candidates.reduce((best, candidate) => {
    const bestScore = hasWidths ? best.width : best.density;
    const candidateScore = hasWidths ? candidate.width : candidate.density;
    return candidateScore > bestScore ||
      (candidateScore === bestScore && candidate.index > best.index)
      ? candidate
      : best;
  }).url;
}

function sourceCandidates(image: HTMLImageElement): SourceCandidate[] {
  const candidates: SourceCandidate[] = [];
  const srcset = bestSrcsetCandidate(image.getAttribute('srcset'));
  const dataSrc = image.getAttribute('data-src')?.trim();
  const src = image.getAttribute('src')?.trim();

  if (srcset) {
    candidates.push({ attribute: 'srcset', value: srcset });
  }
  if (dataSrc) {
    candidates.push({ attribute: 'data-src', value: dataSrc });
  }
  if (src) {
    candidates.push({ attribute: 'src', value: src });
  }

  return candidates;
}

function positiveDimension(value: string | null): number | null {
  if (!value || !/^\d+$/u.test(value)) {
    return null;
  }
  const dimension = Number(value);
  return Number.isSafeInteger(dimension) && dimension > 0 ? dimension : null;
}

function extractImage(image: HTMLImageElement, page: DetachedPage): ExtractedImage | null {
  for (const candidate of sourceCandidates(image)) {
    const url = resolveHttpUrl(candidate.value, page.baseUrl);
    if (!url) {
      continue;
    }

    const loading = image.getAttribute('loading')?.trim().toLowerCase();
    return {
      alt: normalizeText(image.getAttribute('alt')),
      height: positiveDimension(image.getAttribute('height')),
      loading: loading === 'lazy' || loading === 'eager' ? loading : null,
      sourceAttribute: candidate.attribute,
      title: normalizeText(image.getAttribute('title')) || null,
      url: url.toString(),
      width: positiveDimension(image.getAttribute('width')),
    };
  }

  return null;
}

export function extractImages(
  page: DetachedPage,
  requestedLimit?: number,
): ExtractionCollection<ExtractedImage> {
  const defaultLimit = resolveExtractionLimits().images;
  const limit = boundedLimit(requestedLimit, defaultLimit);
  const images = [...page.document.querySelectorAll<HTMLImageElement>('img')]
    .map((image) => extractImage(image, page))
    .filter((image): image is ExtractedImage => image !== null);
  const items = images.slice(0, limit);

  return {
    items,
    returnedCount: items.length,
    totalCount: images.length,
    truncated: items.length < images.length,
  };
}
