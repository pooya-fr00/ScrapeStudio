import { describe, expect, it } from 'vitest';

import { en, fa, flattenTranslationKeys } from './resources';

describe('localization resources', () => {
  it('keeps English and Persian translation keys in sync', () => {
    expect(flattenTranslationKeys(fa).sort()).toEqual(flattenTranslationKeys(en).sort());
  });

  it('does not contain blank localized values', () => {
    const values = [en, fa].flatMap((locale) =>
      flattenTranslationKeys(locale).map((key) => {
        const value = key
          .split('.')
          .reduce<unknown>(
            (current, segment) => (current as Record<string, unknown>)[segment],
            locale,
          );
        return value;
      }),
    );

    expect(values.every((value) => typeof value === 'string' && value.trim().length > 0)).toBe(
      true,
    );
  });
});
