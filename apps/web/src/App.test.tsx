import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LOCALE_STORAGE_KEY } from './app/locale';
import { THEME_STORAGE_KEY } from './app/theme';
import { i18n } from './i18n';
import { App } from './App';

async function renderAt(pathname: string) {
  window.history.replaceState({}, '', pathname);
  render(<App />);
  await screen.findByRole('banner');
}

describe('localized application shell', () => {
  beforeEach(async () => {
    window.localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.removeAttribute('data-theme-preference');
    document.documentElement.lang = 'en';
    document.documentElement.dir = 'ltr';
    vi.mocked(window.scrollTo).mockClear();
    await i18n.changeLanguage('en');
  });

  afterEach(() => {
    cleanup();
  });

  it('renders an English LTR route with localized navigation', async () => {
    await renderAt('/en');

    expect(document.documentElement).toHaveAttribute('lang', 'en');
    expect(document.documentElement).toHaveAttribute('dir', 'ltr');
    const heading = screen.getByRole('heading', {
      name: 'Turn public web pages into structured data.',
    });
    expect(heading).toBeInTheDocument();
    expect(heading.closest('[data-reveal]')).toHaveClass('is-visible');
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    expect(within(screen.getByRole('banner')).getByRole('link', { name: 'Docs' })).toHaveAttribute(
      'href',
      '/en/docs',
    );
    expect(screen.getByRole('heading', { name: 'Pouya Fereydouni' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View GitHub profile' })).toHaveAttribute(
      'href',
      'https://github.com/pooya-fr00',
    );
  });

  it('renders a Persian RTL route and Persian copy', async () => {
    await renderAt('/fa');

    const heading = await screen.findByRole('heading', {
      name: 'داده‌های یک صفحهٔ وب را تمیز و مرتب تحویل بگیرید.',
    });
    expect(heading.closest('[data-reveal]')).toHaveClass('is-visible');
    expect(document.documentElement).toHaveAttribute('lang', 'fa');
    expect(document.documentElement).toHaveAttribute('dir', 'rtl');
    expect(
      within(screen.getByRole('banner')).getByRole('link', { name: 'مستندات' }),
    ).toHaveAttribute('href', '/fa/docs');
  });

  it('switches locale while preserving the current route', async () => {
    const user = userEvent.setup();
    await renderAt('/fa/docs?source=phase-one#method');
    await screen.findByRole('heading', {
      name: 'پیش از اعتماد به نتیجه، روش کار را بشناسید.',
    });

    await user.click(screen.getByRole('button', { name: 'تغییر زبان به English' }));

    await screen.findByRole('heading', {
      name: 'Understand the method before you trust the result.',
    });
    expect(window.location.pathname).toBe('/en/docs');
    expect(window.location.search).toBe('?source=phase-one');
    expect(window.location.hash).toBe('#method');
    expect(window.localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('en');
    expect(document.documentElement).toHaveAttribute('dir', 'ltr');
  });

  it('redirects the root route to the stored locale', async () => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, 'fa');
    await renderAt('/');

    await screen.findByRole('heading', {
      name: 'داده‌های یک صفحهٔ وب را تمیز و مرتب تحویل بگیرید.',
    });
    expect(window.location.pathname).toBe('/fa');
  });

  it('persists and applies an explicit dark theme', async () => {
    const user = userEvent.setup();
    await renderAt('/en');

    await user.click(screen.getByRole('button', { name: 'Color theme: System' }));
    const themeList = screen.getByRole('listbox', { name: 'Color theme' });
    await user.click(within(themeList).getByRole('option', { name: /Dark/ }));

    await waitFor(() => expect(document.documentElement).toHaveAttribute('data-theme', 'dark'));
    expect(document.documentElement).toHaveAttribute('data-theme-preference', 'dark');
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
  });

  it('supports keyboard navigation in the custom theme picker', async () => {
    const user = userEvent.setup();
    await renderAt('/en');
    const trigger = screen.getByRole('button', { name: 'Color theme: System' });

    trigger.focus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('listbox', { name: 'Color theme' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /System/ })).toHaveFocus();
    await user.keyboard('{Home}{Enter}');

    await waitFor(() => expect(document.documentElement).toHaveAttribute('data-theme', 'light'));
    expect(trigger).toHaveFocus();
  });

  it('opens and closes the accessible mobile navigation drawer', async () => {
    const user = userEvent.setup();
    await renderAt('/en');
    const menuButton = screen.getByRole('button', { name: 'Open navigation menu' });

    await user.click(menuButton);

    const dialog = screen.getByRole('dialog', { name: 'Navigation' });
    expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    expect(document.body).toHaveClass('mobile-menu-open');
    expect((document.querySelector('#main-content') as HTMLElement).inert).toBe(true);
    expect(
      within(dialog).getByText(
        'Move through the product without losing your current language or theme.',
      ),
    ).toBeInTheDocument();
    expect(within(dialog).getByRole('link', { name: 'Workspace' })).toHaveAttribute(
      'href',
      '/en/scrape',
    );
    expect(within(dialog).getByRole('link', { name: /ScrapeStudio/ })).toHaveFocus();
    await user.tab({ shift: true });
    expect(within(dialog).getByRole('button', { name: 'Color theme: System' })).toHaveFocus();

    await user.click(within(dialog).getByRole('button', { name: 'Close navigation menu' }));

    expect(screen.queryByRole('dialog', { name: 'Navigation' })).not.toBeInTheDocument();
    expect(document.body).not.toHaveClass('mobile-menu-open');
    expect((document.querySelector('#main-content') as HTMLElement).inert).toBe(false);
    expect(menuButton).toHaveFocus();

    await user.click(menuButton);
    expect(screen.getByRole('dialog', { name: 'Navigation' })).toBeInTheDocument();
    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog', { name: 'Navigation' })).not.toBeInTheDocument();
    expect(menuButton).toHaveFocus();
  });

  it('balances foundation pages with localized product highlights', async () => {
    await renderAt('/en/tools');

    expect(
      await screen.findByRole('heading', {
        name: 'Give each kind of data a clear extraction path.',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('complementary', { name: 'Available in the workspace' }),
    ).toHaveTextContent('Multi-field custom selector builder');
    expect(screen.getByRole('link', { name: 'Open workspace' })).toHaveAttribute(
      'href',
      '/en/scrape',
    );
  });

  it('shows a localized not-found state inside a valid locale', async () => {
    await renderAt('/fa/unknown');

    expect(
      await screen.findByRole('heading', { name: 'این مسیر وجود ندارد.' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'بازگشت به خانه' })).toHaveAttribute('href', '/fa');
  });
});
