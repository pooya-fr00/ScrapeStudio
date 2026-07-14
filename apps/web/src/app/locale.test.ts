import { describe, expect, it } from 'vitest';

import { detectPreferredLocale, getLocaleDirection, isSupportedLocale } from './locale';

describe('locale helpers', () => {
  it('prefers a valid stored locale', () => {
    expect(detectPreferredLocale('fa', ['en-US'])).toBe('fa');
  });

  it('falls back to a supported browser language', () => {
    expect(detectPreferredLocale('de', ['de-DE', 'fa-IR', 'en-US'])).toBe('fa');
  });

  it('uses English when no supported preference exists', () => {
    expect(detectPreferredLocale(null, ['de-DE'])).toBe('en');
  });

  it('maps supported locales to the correct writing direction', () => {
    expect(getLocaleDirection('en')).toBe('ltr');
    expect(getLocaleDirection('fa')).toBe('rtl');
    expect(isSupportedLocale('en')).toBe(true);
    expect(isSupportedLocale('ar')).toBe(false);
  });
});
