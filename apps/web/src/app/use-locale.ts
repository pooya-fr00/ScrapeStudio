import type { SupportedLocale } from '@scrapestudio/shared';
import { useContext } from 'react';

import { LocaleContext } from './locale-context';

export function useLocale(): SupportedLocale {
  const locale = useContext(LocaleContext);
  if (locale === null) {
    throw new Error('useLocale must be used inside LocaleProvider.');
  }
  return locale;
}
