import type { SupportedLocale } from '@scrapestudio/shared';
import type { ReactNode } from 'react';

import { LocaleContext } from './locale-context';

export function LocaleProvider({
  children,
  locale,
}: {
  children: ReactNode;
  locale: SupportedLocale;
}) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}
