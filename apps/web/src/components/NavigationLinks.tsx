import type { SupportedLocale } from '@scrapestudio/shared';
import { BookOpen, Clock3, FolderCode, Home, LibraryBig, Shapes, Wrench } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router';

import { localizedPath, type AppRoute } from '../app/routes';

const navigationItems = [
  { icon: Home, route: 'home', label: 'navigation.home' },
  { icon: FolderCode, route: 'workspace', label: 'navigation.workspace' },
  { icon: Wrench, route: 'tools', label: 'navigation.tools' },
  { icon: LibraryBig, route: 'recipes', label: 'navigation.recipes' },
  { icon: Clock3, route: 'history', label: 'navigation.history' },
  { icon: Shapes, route: 'playground', label: 'navigation.playground' },
  { icon: BookOpen, route: 'docs', label: 'navigation.docs' },
] as const satisfies ReadonlyArray<{
  icon: typeof Home;
  route: AppRoute;
  label: string;
}>;

export function NavigationLinks({
  locale,
  mobile = false,
}: {
  locale: SupportedLocale;
  mobile?: boolean;
}) {
  const { t } = useTranslation();

  return (
    <nav
      aria-label={t('navigation.primaryLabel')}
      className={mobile ? 'mobile-links' : 'nav-links'}
    >
      {navigationItems.map(({ icon: Icon, label, route }) => (
        <NavLink
          className={({ isActive }) => (isActive ? 'nav-link nav-link-active' : 'nav-link')}
          end={route === 'home'}
          key={route}
          to={localizedPath(locale, route)}
        >
          <Icon aria-hidden="true" className="nav-link-icon" />
          {t(label)}
        </NavLink>
      ))}
    </nav>
  );
}
