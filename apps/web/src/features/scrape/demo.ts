import type { SupportedLocale } from '@scrapestudio/shared';

import {
  getDemoProducts,
  getDemoSchedule,
  getPlaygroundCopy,
  type PlaygroundKind,
} from '../playground/catalog';
import type { FetchedPage } from './api';

export const DEMO_URL = 'https://demo.scrapestudio.example/en/playground/products';

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function getDemoUrl(kind: PlaygroundKind, locale: SupportedLocale): string {
  return `https://demo.scrapestudio.example/${locale}/playground/${kind}`;
}

function productHtml(locale: SupportedLocale): string {
  const content = getPlaygroundCopy(locale).products;
  const cards = getDemoProducts(locale)
    .map(
      (product) => `
        <article class="product-card" data-category="${escapeHtml(product.category)}">
          <img src="/assets/${product.id}.svg" alt="${escapeHtml(`${content.imageLabel} ${product.title}`)}" />
          <p class="product-category">${escapeHtml(product.category)}</p>
          <h2>${escapeHtml(product.title)}</h2>
          <p class="product-price">${escapeHtml(product.price)}</p>
          <a href="/products/${product.id}">${escapeHtml(content.linkLabel)}</a>
        </article>`,
    )
    .join('');

  return `
    <main>
      <h1>${escapeHtml(content.title)}</h1>
      <p>${escapeHtml(content.description)}</p>
      <section class="product-grid" aria-label="${escapeHtml(content.title)}">${cards}</section>
    </main>`;
}

function tableHtml(locale: SupportedLocale): string {
  const content = getPlaygroundCopy(locale).table;
  const headers = content.headers
    .map((header) => `<th scope="col">${escapeHtml(header)}</th>`)
    .join('');
  const rows = getDemoSchedule(locale)
    .map(
      (row) =>
        `<tr><th scope="row">${escapeHtml(row.session)}</th><td>${escapeHtml(row.time)}</td><td>${escapeHtml(row.format)}</td><td>${escapeHtml(row.capacity)}</td><td>${escapeHtml(row.status)}</td></tr>`,
    )
    .join('');

  return `
    <main>
      <h1>${escapeHtml(content.title)}</h1>
      <p>${escapeHtml(content.description)}</p>
      <table>
        <caption>${escapeHtml(content.caption)}</caption>
        <thead><tr>${headers}</tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </main>`;
}

function articleHtml(locale: SupportedLocale): string {
  const content = getPlaygroundCopy(locale).article;
  const sections = content.sections
    .map(
      (section) =>
        `<section><h2>${escapeHtml(section.heading)}</h2>${section.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}</section>`,
    )
    .join('');
  const structuredData = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    author: { '@type': 'Person', name: content.author },
    datePublished: '2026-07-14',
    description: content.description,
    headline: content.title,
  }).replaceAll('<', '\\u003c');

  return `
    <main>
      <article>
        <p>${escapeHtml(content.kicker)}</p>
        <h1>${escapeHtml(content.title)}</h1>
        <p>${escapeHtml(content.description)}</p>
        <p><span>${escapeHtml(content.author)}</span> · <time datetime="2026-07-14">${escapeHtml(content.publishedValue)}</time></p>
        <img src="/assets/field-notes.svg" alt="${escapeHtml(content.imageAlt)}" />
        ${sections}
        <p><a href="/methodology">ScrapeStudio methodology</a></p>
      </article>
    </main>
    <script type="application/ld+json">${structuredData}</script>`;
}

export function createDemoHtml(kind: PlaygroundKind, locale: SupportedLocale): string {
  const content = getPlaygroundCopy(locale)[kind];
  const body =
    kind === 'products'
      ? productHtml(locale)
      : kind === 'table'
        ? tableHtml(locale)
        : articleHtml(locale);
  const finalUrl = getDemoUrl(kind, locale);

  return `<!doctype html>
<html lang="${locale}" dir="${locale === 'fa' ? 'rtl' : 'ltr'}">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(content.title)}</title>
    <meta name="description" content="${escapeHtml(content.description)}" />
    <meta property="og:title" content="${escapeHtml(content.title)}" />
    <meta property="og:description" content="${escapeHtml(content.description)}" />
    <link rel="canonical" href="${finalUrl}" />
  </head>
  <body>${body}</body>
</html>`;
}

export const DEMO_HTML = createDemoHtml('products', 'en');

export function createDemoPage(
  now: number,
  kind: PlaygroundKind = 'products',
  locale: SupportedLocale = 'en',
): FetchedPage {
  const html = createDemoHtml(kind, locale);
  const url = getDemoUrl(kind, locale);

  return {
    byteLength: new TextEncoder().encode(html).byteLength,
    contentType: 'text/html; charset=utf-8',
    fetchedAt: new Date(now).toISOString(),
    finalUrl: url,
    html,
    requestedUrl: url,
    status: 200,
  };
}
