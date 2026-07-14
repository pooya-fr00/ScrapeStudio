import { ArrowLeft, ArrowRight, Box, FileText, FlaskConical, Table2 } from 'lucide-react';
import { Link } from 'react-router';

import { localizedPath, localizedPlaygroundPath } from '../app/routes';
import { usePublicPageMetadata } from '../app/use-public-page-metadata';
import { useLocale } from '../app/use-locale';
import {
  getDemoProducts,
  getDemoSchedule,
  getPlaygroundCopy,
  PLAYGROUND_KINDS,
  type PlaygroundKind,
} from '../features/playground/catalog';
import { phaseNineContent } from '../features/public-content/content';

const kindIcons = { article: FileText, products: Box, table: Table2 } as const;

function DirectionalArrow({ locale }: { locale: 'en' | 'fa' }) {
  const Icon = locale === 'fa' ? ArrowLeft : ArrowRight;
  return <Icon aria-hidden="true" />;
}

export function PlaygroundPage() {
  const locale = useLocale();
  const content = phaseNineContent[locale];
  usePublicPageMetadata(content.playground.title, content.playground.description);

  return (
    <div className="public-page playground-page">
      <section className="public-hero">
        <div className="page-container public-hero-grid">
          <div data-reveal="up">
            <p className="eyebrow">{content.playground.eyebrow}</p>
            <h1>{content.playground.title}</h1>
            <p className="public-hero-description">{content.playground.description}</p>
          </div>
          <aside className="public-callout reveal-delay-1" data-reveal="scale">
            <FlaskConical aria-hidden="true" />
            <div>
              <h2>{content.playground.localNoteTitle}</h2>
              <p>{content.playground.localNote}</p>
            </div>
          </aside>
        </div>
      </section>

      <section
        aria-label={content.common.playgroundLabel}
        className="page-container playground-grid"
      >
        {PLAYGROUND_KINDS.map((kind, index) => {
          const Icon = kindIcons[kind];
          const demo = content.playground.demos[kind];
          return (
            <article
              className={`playground-card reveal-delay-${index + 1}`}
              data-reveal="up"
              key={kind}
            >
              <div className={`playground-card-visual playground-visual-${kind}`}>
                <Icon aria-hidden="true" />
                <span>{demo.badge}</span>
              </div>
              <div className="playground-card-body">
                <p className="eyebrow">{content.playground.originalBadge}</p>
                <h2>{demo.title}</h2>
                <p>{demo.description}</p>
                <ul>
                  {demo.signals.map((signal) => (
                    <li key={signal}>{signal}</li>
                  ))}
                </ul>
                <div className="playground-card-actions">
                  <Link className="secondary-action" to={localizedPlaygroundPath(locale, kind)}>
                    {content.common.openPlayground}
                  </Link>
                  <Link
                    className="primary-action"
                    to={`${localizedPath(locale, 'workspace')}?demo=${kind}`}
                  >
                    {content.common.analyzeDemo}
                    <DirectionalArrow locale={locale} />
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}

function DemoHeader({ kind }: { kind: PlaygroundKind }) {
  const locale = useLocale();
  const content = phaseNineContent[locale];
  const demo = content.playground.demos[kind];

  return (
    <section className="demo-page-header">
      <div className="page-container demo-page-header-inner">
        <div>
          <Link className="text-link" to={localizedPath(locale, 'playground')}>
            {locale === 'fa' ? <ArrowRight aria-hidden="true" /> : <ArrowLeft aria-hidden="true" />}
            {content.common.backToPlayground}
          </Link>
          <p className="eyebrow">{demo.badge}</p>
          <h1>{demo.title}</h1>
          <p>{content.playground.pageDescription}</p>
        </div>
        <Link className="primary-action" to={`${localizedPath(locale, 'workspace')}?demo=${kind}`}>
          {content.common.analyzeDemo}
          <DirectionalArrow locale={locale} />
        </Link>
      </div>
    </section>
  );
}

function ProductsDemo() {
  const locale = useLocale();
  const copy = getPlaygroundCopy(locale).products;
  return (
    <section className="page-container demo-products" aria-labelledby="products-demo-title">
      <div className="demo-content-heading">
        <h2 id="products-demo-title">{copy.title}</h2>
        <p>{copy.description}</p>
      </div>
      <div className="demo-product-grid">
        {getDemoProducts(locale).map((product) => (
          <article className="demo-product-card" key={product.id}>
            <div
              aria-label={`${copy.imageLabel} ${product.title}`}
              className="demo-product-image"
              data-product={product.id}
              role="img"
            >
              <span>{product.title.slice(0, 1)}</span>
            </div>
            <p>{product.category}</p>
            <h3>{product.title}</h3>
            <div>
              <strong>{product.price}</strong>
              <a href={`#${product.id}`}>{copy.linkLabel}</a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function TableDemo() {
  const locale = useLocale();
  const copy = getPlaygroundCopy(locale).table;
  const rows = getDemoSchedule(locale);
  return (
    <section className="page-container demo-table-section" aria-labelledby="table-demo-title">
      <div className="demo-content-heading">
        <h2 id="table-demo-title">{copy.title}</h2>
        <p>{copy.description}</p>
      </div>
      <div className="demo-table-shell">
        <table>
          <caption>{copy.caption}</caption>
          <thead>
            <tr>
              {copy.headers.map((header) => (
                <th key={header} scope="col">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.session}>
                <th scope="row">{row.session}</th>
                <td>{row.time}</td>
                <td>{row.format}</td>
                <td>{row.capacity}</td>
                <td>
                  <span className="demo-status">{row.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="demo-table-cards">
        {rows.map((row) => (
          <article key={row.session}>
            <h3>{row.session}</h3>
            <dl>
              {copy.headers.slice(1).map((header, index) => {
                const values = [row.time, row.format, row.capacity, row.status];
                return (
                  <div key={header}>
                    <dt>{header}</dt>
                    <dd>{values[index]}</dd>
                  </div>
                );
              })}
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}

function ArticleDemo() {
  const locale = useLocale();
  const copy = getPlaygroundCopy(locale).article;
  return (
    <article className="page-container demo-article">
      <header>
        <p className="eyebrow">{copy.kicker}</p>
        <h2>{copy.title}</h2>
        <p>{copy.description}</p>
        <div>
          <strong>{copy.author}</strong>
          <span>
            {copy.publishedLabel}: {copy.publishedValue}
          </span>
        </div>
      </header>
      <div aria-label={copy.imageAlt} className="demo-article-image" role="img">
        <span className="demo-notebook" />
        <span className="demo-map" />
        <span className="demo-compass" />
      </div>
      <div className="demo-article-body">
        {copy.sections.map((section) => (
          <section key={section.heading}>
            <h3>{section.heading}</h3>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>
        ))}
      </div>
    </article>
  );
}

export function PlaygroundDemoPage({ kind }: { kind: PlaygroundKind }) {
  const locale = useLocale();
  const demo = phaseNineContent[locale].playground.demos[kind];
  usePublicPageMetadata(demo.title, demo.description);

  return (
    <div className={`public-page demo-page demo-page-${kind}`}>
      <DemoHeader kind={kind} />
      {kind === 'products' ? <ProductsDemo /> : kind === 'table' ? <TableDemo /> : <ArticleDemo />}
    </div>
  );
}
