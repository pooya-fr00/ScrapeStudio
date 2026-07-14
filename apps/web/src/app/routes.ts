import type { SupportedLocale } from '@scrapestudio/shared';

export const ROUTE_SEGMENTS = {
  about: 'about',
  docs: 'docs',
  history: 'history',
  home: '',
  limitations: 'limitations',
  methodology: 'methodology',
  playground: 'playground',
  privacy: 'privacy',
  recipes: 'recipes',
  responsibleUse: 'responsible-use',
  security: 'security',
  tools: 'tools',
  workspace: 'scrape',
} as const;

export type AppRoute = keyof typeof ROUTE_SEGMENTS;

export function localizedPath(locale: SupportedLocale, route: AppRoute): string {
  const segment = ROUTE_SEGMENTS[route];
  return segment.length > 0 ? `/${locale}/${segment}` : `/${locale}`;
}

export function localizedPlaygroundPath(
  locale: SupportedLocale,
  demo?: 'article' | 'products' | 'table',
): string {
  const root = localizedPath(locale, 'playground');
  return demo ? `${root}/${demo}` : root;
}

export function replacePathLocale(pathname: string, locale: SupportedLocale): string {
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) {
    return localizedPath(locale, 'home');
  }

  segments[0] = locale;
  return `/${segments.join('/')}`;
}
