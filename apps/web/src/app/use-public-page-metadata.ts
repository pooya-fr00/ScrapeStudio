import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router';

import { replacePathLocale } from './routes';
import { useLocale } from './use-locale';

function upsertMeta(selector: string, attributes: Record<string, string>) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    document.head.append(element);
  }
  Object.entries(attributes).forEach(([name, value]) => element?.setAttribute(name, value));
}

function upsertLink(hreflang: string | undefined, rel: string, href: string) {
  const selector = hreflang
    ? `link[rel="${rel}"][hreflang="${hreflang}"]`
    : `link[rel="${rel}"]:not([hreflang])`;
  let element = document.head.querySelector<HTMLLinkElement>(selector);
  if (!element) {
    element = document.createElement('link');
    element.rel = rel;
    if (hreflang) {
      element.hreflang = hreflang;
    }
    document.head.append(element);
  }
  element.href = href;
}

export function usePublicPageMetadata(title: string, description: string) {
  const locale = useLocale();
  const location = useLocation();

  useLayoutEffect(() => {
    const canonicalUrl = new URL(location.pathname, window.location.origin).toString();
    const englishUrl = new URL(
      replacePathLocale(location.pathname, 'en'),
      window.location.origin,
    ).toString();
    const persianUrl = new URL(
      replacePathLocale(location.pathname, 'fa'),
      window.location.origin,
    ).toString();

    document.title = `${title} — ScrapeStudio`;
    upsertMeta('meta[name="description"]', { content: description, name: 'description' });
    upsertMeta('meta[property="og:title"]', { content: title, property: 'og:title' });
    upsertMeta('meta[property="og:description"]', {
      content: description,
      property: 'og:description',
    });
    upsertMeta('meta[property="og:type"]', { content: 'website', property: 'og:type' });
    upsertMeta('meta[property="og:url"]', { content: canonicalUrl, property: 'og:url' });
    upsertMeta('meta[property="og:locale"]', {
      content: locale === 'fa' ? 'fa_IR' : 'en_US',
      property: 'og:locale',
    });
    upsertLink(undefined, 'canonical', canonicalUrl);
    upsertLink('en', 'alternate', englishUrl);
    upsertLink('fa', 'alternate', persianUrl);
    upsertLink('x-default', 'alternate', englishUrl);
  }, [description, locale, location.pathname, title]);
}
