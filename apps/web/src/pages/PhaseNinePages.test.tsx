import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { i18n } from '../i18n';
import { App } from '../App';

async function renderAt(pathname: string, locale: 'en' | 'fa' = 'en') {
  await i18n.changeLanguage(locale);
  window.history.replaceState({}, '', pathname);
  render(<App />);
}

describe('phase nine public pages', () => {
  beforeEach(() => {
    cleanup();
    document.body.innerHTML = '';
    window.localStorage.clear();
  });

  afterEach(() => cleanup());

  it('presents all three local playground demos with no-network workspace links', async () => {
    await renderAt('/en/playground');

    expect(
      await screen.findByRole('heading', {
        name: 'Test the complete workflow without depending on another website.',
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Open demo page/u })[0]).toHaveAttribute(
      'href',
      '/en/playground/products',
    );
    const analyzeLinks = screen.getAllByRole('link', { name: /Analyze this demo/u });
    expect(analyzeLinks).toHaveLength(3);
    expect(analyzeLinks.map((link) => link.getAttribute('href'))).toEqual([
      '/en/scrape?demo=products',
      '/en/scrape?demo=table',
      '/en/scrape?demo=article',
    ]);
  });

  it('renders the Persian product fixture as twelve visible cards', async () => {
    await renderAt('/fa/playground/products', 'fa');

    expect(
      await screen.findByRole('heading', { name: 'کاتالوگ دوازده‌محصولی' }),
    ).toBeInTheDocument();
    expect(document.querySelectorAll('.demo-product-card')).toHaveLength(12);
    expect(screen.getByRole('link', { name: /تحلیل این نمونه/u })).toHaveAttribute(
      'href',
      '/fa/scrape?demo=products',
    );
  });

  it('publishes localized methodology with canonical and alternate metadata', async () => {
    await renderAt('/en/methodology');

    expect(
      await screen.findByRole('heading', {
        name: 'A clear boundary between network access and document analysis.',
      }),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute(
        'href',
        'http://localhost:3000/en/methodology',
      ),
    );
    expect(document.querySelector('link[rel="alternate"][hreflang="fa"]')).toHaveAttribute(
      'href',
      'http://localhost:3000/fa/methodology',
    );
  });

  it('publishes the required Persian security and tool-guide routes', async () => {
    await renderAt('/fa/security', 'fa');
    expect(
      await screen.findByRole('heading', {
        name: 'هر نشانی، تغییر مسیر، پاسخ و سند راه‌دور غیرقابل‌اعتماد است.',
      }),
    ).toBeInTheDocument();
    cleanup();

    await renderAt('/fa/tools/table-extractor', 'fa');
    expect(
      await screen.findByRole('heading', {
        name: 'جدول معنایی HTML را به ردیف و ستون محدود تبدیل کنید.',
      }),
    ).toBeInTheDocument();
  });
});
