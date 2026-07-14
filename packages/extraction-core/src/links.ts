import { boundedLimit, resolveExtractionLimits } from './limits.js';
import { normalizeText } from './text.js';
import type { DetachedPage, ExtractedLink, ExtractionCollection, LinkType } from './types.js';
import { resolveReferenceUrl } from './url.js';

const DOWNLOAD_EXTENSIONS = new Set([
  '.7z',
  '.csv',
  '.doc',
  '.docx',
  '.epub',
  '.gz',
  '.json',
  '.ods',
  '.odt',
  '.pdf',
  '.ppt',
  '.pptx',
  '.rar',
  '.tar',
  '.tsv',
  '.xls',
  '.xlsx',
  '.xml',
  '.zip',
]);

export interface LinkExtractionOptions {
  filter?: 'all' | 'external' | 'internal';
  limit?: number;
  uniqueOnly?: boolean;
}

function relationTokens(anchor: HTMLAnchorElement): string[] {
  return (
    anchor
      .getAttribute('rel')
      ?.split(/\s+/u)
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean) ?? []
  );
}

function looksDownloadable(anchor: HTMLAnchorElement, url: URL): boolean {
  if (anchor.hasAttribute('download')) {
    return true;
  }

  const pathname = url.pathname.toLowerCase();
  return [...DOWNLOAD_EXTENSIONS].some((extension) => pathname.endsWith(extension));
}

function classifyAnchor(anchor: HTMLAnchorElement, page: DetachedPage): ExtractedLink {
  const rawHref = anchor.getAttribute('href')?.trim() ?? '';
  const resolved = resolveReferenceUrl(rawHref, page.baseUrl);
  let type: LinkType = 'invalid';
  let url: string | null = null;

  if (resolved && rawHref.startsWith('#')) {
    type = 'fragment';
    url = resolved.toString();
  } else if (resolved?.protocol === 'mailto:') {
    type = 'mailto';
    url = resolved.toString();
  } else if (resolved?.protocol === 'tel:') {
    type = 'tel';
    url = resolved.toString();
  } else if (resolved && (resolved.protocol === 'http:' || resolved.protocol === 'https:')) {
    url = resolved.toString();
    if (looksDownloadable(anchor, resolved)) {
      type = 'download';
    } else {
      type = resolved.origin === page.finalUrl.origin ? 'internal' : 'external';
    }
  }

  return {
    rel: relationTokens(anchor),
    target: normalizeText(anchor.getAttribute('target')) || null,
    text: normalizeText(anchor.textContent),
    title: normalizeText(anchor.getAttribute('title')) || null,
    type,
    url,
  };
}

export function extractLinks(
  page: DetachedPage,
  options: LinkExtractionOptions = {},
): ExtractionCollection<ExtractedLink> {
  const defaultLimit = resolveExtractionLimits().links;
  const limit = boundedLimit(options.limit, defaultLimit);
  const filter = options.filter ?? 'all';
  let links = [...page.document.querySelectorAll<HTMLAnchorElement>('a')].map((anchor) =>
    classifyAnchor(anchor, page),
  );

  if (filter !== 'all') {
    links = links.filter((link) => link.type === filter);
  }

  if (options.uniqueOnly) {
    const seen = new Set<string>();
    links = links.filter((link) => {
      const key = link.url ?? `invalid:${link.text}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  const items = links.slice(0, limit);
  return {
    items,
    returnedCount: items.length,
    totalCount: links.length,
    truncated: items.length < links.length,
  };
}
