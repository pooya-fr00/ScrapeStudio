import type { SupportedLocale } from '@scrapestudio/shared';
import { createContext } from 'react';

export const LocaleContext = createContext<SupportedLocale | null>(null);
