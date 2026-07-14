import { boundedLimit, resolveExtractionLimits } from './limits.js';
import { normalizeText, visibleDocumentText } from './text.js';
import type {
  DetachedPage,
  ExtractedMetadata,
  ExtractionCollection,
  FaviconCandidate,
  JsonLdBlock,
  JsonValue,
} from './types.js';
import { resolveHttpUrl } from './url.js';

const MAX_JSON_DEPTH = 100;
const FAVICON_LIMIT = 20;

function isJsonValue(value: unknown, depth = 0): value is JsonValue {
  if (depth > MAX_JSON_DEPTH) {
    return false;
  }
  if (
    value === null ||
    typeof value === 'boolean' ||
    typeof value === 'string' ||
    (typeof value === 'number' && Number.isFinite(value))
  ) {
    return true;
  }
  if (Array.isArray(value)) {
    return value.every((item) => isJsonValue(item, depth + 1));
  }
  if (typeof value === 'object') {
    return Object.values(value).every((item) => isJsonValue(item, depth + 1));
  }
  return false;
}

function firstMetaContent(document: Document, expectedName: string): string | null {
  for (const meta of document.querySelectorAll<HTMLMetaElement>('meta')) {
    if (meta.getAttribute('name')?.trim().toLowerCase() === expectedName) {
      return normalizeText(meta.getAttribute('content')) || null;
    }
  }
  return null;
}

function groupedMetaFields(
  document: Document,
  prefix: 'og:' | 'twitter:',
): Record<string, string[]> {
  const fields: Record<string, string[]> = {};

  for (const meta of document.querySelectorAll<HTMLMetaElement>('meta')) {
    const key = (meta.getAttribute('property') ?? meta.getAttribute('name'))?.trim().toLowerCase();
    const content = normalizeText(meta.getAttribute('content'));
    if (!key?.startsWith(prefix) || !content) {
      continue;
    }
    (fields[key] ??= []).push(content);
  }

  return fields;
}

function parseJsonLd(
  document: Document,
  requestedLimit: number,
): ExtractionCollection<JsonLdBlock> {
  const scripts = [...document.querySelectorAll<HTMLScriptElement>('script[type]')].filter(
    (script) => script.getAttribute('type')?.trim().toLowerCase() === 'application/ld+json',
  );
  const items = scripts.slice(0, requestedLimit).map((script): JsonLdBlock => {
    const raw = script.textContent?.trim() ?? '';
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (isJsonValue(parsed)) {
        return { raw, valid: true, value: parsed };
      }
    } catch {
      // Invalid JSON-LD is represented explicitly and does not stop other extraction.
    }
    return { raw, valid: false, value: null };
  });

  return {
    items,
    returnedCount: items.length,
    totalCount: scripts.length,
    truncated: items.length < scripts.length,
  };
}

function relTokens(link: HTMLLinkElement): string[] {
  return (
    link
      .getAttribute('rel')
      ?.split(/\s+/u)
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean) ?? []
  );
}

function faviconCandidates(page: DetachedPage): FaviconCandidate[] {
  const candidates: FaviconCandidate[] = [];

  for (const link of page.document.querySelectorAll<HTMLLinkElement>('link[href]')) {
    const rel = relTokens(link);
    if (!rel.some((token) => token === 'icon' || token.endsWith('-icon'))) {
      continue;
    }
    const url = resolveHttpUrl(link.getAttribute('href'), page.baseUrl);
    if (!url) {
      continue;
    }
    candidates.push({
      rel,
      sizes: normalizeText(link.getAttribute('sizes')) || null,
      type: normalizeText(link.getAttribute('type')) || null,
      url: url.toString(),
    });
    if (candidates.length >= FAVICON_LIMIT) {
      break;
    }
  }

  return candidates;
}

function canonicalUrl(page: DetachedPage): string | null {
  for (const link of page.document.querySelectorAll<HTMLLinkElement>('link[href]')) {
    if (!relTokens(link).includes('canonical')) {
      continue;
    }
    const url = resolveHttpUrl(link.getAttribute('href'), page.baseUrl);
    if (url) {
      return url.toString();
    }
  }
  return null;
}

export function extractMetadata(page: DetachedPage, jsonLdLimit?: number): ExtractedMetadata {
  const defaultLimit = resolveExtractionLimits().jsonLdBlocks;
  const resolvedJsonLdLimit = boundedLimit(jsonLdLimit, defaultLimit);
  const text = visibleDocumentText(page.document);
  const wordEstimate = text ? text.split(/\s+/u).length : 0;

  return {
    canonicalUrl: canonicalUrl(page),
    description: firstMetaContent(page.document, 'description'),
    documentLanguage: normalizeText(page.document.documentElement.lang) || null,
    favicons: faviconCandidates(page),
    h1Count: page.document.querySelectorAll('h1').length,
    jsonLd: parseJsonLd(page.document, resolvedJsonLdLimit),
    openGraph: groupedMetaFields(page.document, 'og:'),
    robots: firstMetaContent(page.document, 'robots'),
    statistics: {
      headingCount: page.document.querySelectorAll('h1,h2,h3,h4,h5,h6').length,
      imageCount: page.document.images.length,
      linkCount: page.document.links.length,
      paragraphCount: page.document.querySelectorAll('p').length,
      tableCount: page.document.querySelectorAll('table').length,
      textLength: text.length,
      wordEstimate,
    },
    title: normalizeText(page.document.title) || null,
    twitter: groupedMetaFields(page.document, 'twitter:'),
    viewport: firstMetaContent(page.document, 'viewport'),
  };
}
