import { SUPPORTED_LOCALES, type SupportedLocale } from '@scrapestudio/shared';

export const DEFAULT_LOCALE: SupportedLocale = 'en';
export const LOCALE_STORAGE_KEY = 'scrapestudio-locale';

export function isSupportedLocale(value: string | undefined): value is SupportedLocale {
  return SUPPORTED_LOCALES.some((locale) => locale === value);
}

export function getLocaleDirection(locale: SupportedLocale): 'ltr' | 'rtl' {
  return locale === 'fa' ? 'rtl' : 'ltr';
}

export function detectPreferredLocale(
  storedLocale: string | null,
  browserLanguages: readonly string[],
): SupportedLocale {
  const storedCandidate = storedLocale ?? undefined;
  if (isSupportedLocale(storedCandidate)) {
    return storedCandidate;
  }

  const browserLocale = browserLanguages
    .map((language) => language.toLowerCase().split('-')[0])
    .find(isSupportedLocale);

  return browserLocale ?? DEFAULT_LOCALE;
}

export function readPreferredLocale(): SupportedLocale {
  try {
    return detectPreferredLocale(
      window.localStorage.getItem(LOCALE_STORAGE_KEY),
      window.navigator.languages,
    );
  } catch {
    return detectPreferredLocale(null, window.navigator.languages);
  }
}

export function persistPreferredLocale(locale: SupportedLocale): void {
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // The selected URL remains the source of truth when storage is unavailable.
  }
}
