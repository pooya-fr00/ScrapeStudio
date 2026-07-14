import type { DetachedPage } from './types.js';
import { resolveHttpUrl } from './url.js';

export interface DetachedParser {
  parseFromString(input: string, mimeType: 'text/html'): Document;
}

function parseFinalUrl(value: string): URL {
  let url: URL;
  try {
    url = new URL(value);
  } catch (cause) {
    throw new TypeError('The final page URL must be a valid absolute HTTP(S) URL.', {
      cause,
    });
  }

  if ((url.protocol !== 'http:' && url.protocol !== 'https:') || url.username || url.password) {
    throw new TypeError('The final page URL must be a valid absolute HTTP(S) URL.');
  }

  return url;
}

export function parseDetachedPage(
  html: string,
  finalUrl: string,
  parser: DetachedParser = new DOMParser(),
): DetachedPage {
  const normalizedFinalUrl = parseFinalUrl(finalUrl);
  const document = parser.parseFromString(html, 'text/html');
  const declaredBase = document.querySelector('base[href]')?.getAttribute('href');
  const baseUrl = resolveHttpUrl(declaredBase, normalizedFinalUrl) ?? normalizedFinalUrl;

  return {
    baseUrl,
    document,
    finalUrl: normalizedFinalUrl,
  };
}
