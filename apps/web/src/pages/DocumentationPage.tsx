import {
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  CircleAlert,
  FileQuestion,
  Fingerprint,
  HeartHandshake,
  Info,
  LockKeyhole,
  ShieldCheck,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router';

import { localizedPath } from '../app/routes';
import { usePublicPageMetadata } from '../app/use-public-page-metadata';
import { useLocale } from '../app/use-locale';
import {
  DOCUMENT_SLUGS,
  phaseNineContent,
  type DocumentSlug,
  type PublicDocumentContent,
  type ToolGuideSlug,
} from '../features/public-content/content';

const documentIcons: Record<DocumentSlug, LucideIcon> = {
  about: Info,
  limitations: CircleAlert,
  methodology: BookOpenCheck,
  privacy: Fingerprint,
  'responsible-use': HeartHandshake,
  security: ShieldCheck,
};

function DirectionalArrow({ locale }: { locale: 'en' | 'fa' }) {
  const Icon = locale === 'fa' ? ArrowLeft : ArrowRight;
  return <Icon aria-hidden="true" />;
}

export function DocumentationPage() {
  const locale = useLocale();
  const content = phaseNineContent[locale];
  usePublicPageMetadata(content.docs.title, content.docs.description);

  return (
    <div className="public-page docs-hub-page">
      <section className="public-hero">
        <div className="page-container public-hero-grid">
          <div data-reveal="up">
            <p className="eyebrow">{content.docs.eyebrow}</p>
            <h1>{content.docs.title}</h1>
            <p className="public-hero-description">{content.docs.description}</p>
          </div>
          <aside className="public-callout reveal-delay-1" data-reveal="scale">
            <LockKeyhole aria-hidden="true" />
            <div>
              <h2>{content.docs.noteTitle}</h2>
              <p>{content.docs.note}</p>
            </div>
          </aside>
        </div>
      </section>

      <section
        aria-label={content.common.documentationLabel}
        className="page-container documentation-grid"
      >
        {DOCUMENT_SLUGS.map((slug, index) => {
          const Icon = documentIcons[slug];
          const item = content.docs.items[slug];
          return (
            <article
              className={`documentation-card reveal-delay-${(index % 3) + 1}`}
              data-reveal="up"
              key={slug}
            >
              <span className="documentation-card-icon">
                <Icon aria-hidden="true" />
              </span>
              <h2>{item.title}</h2>
              <p>{item.description}</p>
              <Link
                to={localizedPath(locale, slug === 'responsible-use' ? 'responsibleUse' : slug)}
              >
                {content.common.readDocument}
                <DirectionalArrow locale={locale} />
              </Link>
            </article>
          );
        })}
      </section>

      <section className="page-container docs-playground-cta" data-reveal="up">
        <FileQuestion aria-hidden="true" />
        <div>
          <p className="eyebrow">{content.playground.eyebrow}</p>
          <h2>{content.playground.title}</h2>
          <p>{content.playground.localNote}</p>
        </div>
        <Link className="primary-action" to={localizedPath(locale, 'playground')}>
          {content.common.openPlayground}
          <DirectionalArrow locale={locale} />
        </Link>
      </section>
    </div>
  );
}

function DocumentBody({ content }: { content: PublicDocumentContent }) {
  return (
    <>
      <aside className="public-callout document-callout" data-reveal="scale">
        <ShieldCheck aria-hidden="true" />
        <div>
          <h2>{content.calloutTitle}</h2>
          <p>{content.callout}</p>
        </div>
      </aside>
      <div className="document-sections">
        {content.sections.map((section, index) => (
          <section data-reveal="up" key={section.title}>
            <span className="document-section-number" aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>
            <div>
              <h2>{section.title}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.points ? (
                <ul>
                  {section.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}

export function PublicDocumentPage({ slug }: { slug: DocumentSlug }) {
  const locale = useLocale();
  const phaseContent = phaseNineContent[locale];
  const content = phaseContent.documents[slug];
  usePublicPageMetadata(content.title, content.summary);

  return (
    <article className="public-page document-page">
      <header className="public-hero document-hero">
        <div className="page-container document-hero-inner" data-reveal="up">
          <Link className="text-link document-back-link" to={localizedPath(locale, 'docs')}>
            {locale === 'fa' ? <ArrowRight aria-hidden="true" /> : <ArrowLeft aria-hidden="true" />}
            {phaseContent.common.backToDocs}
          </Link>
          <p className="eyebrow">{content.eyebrow}</p>
          <h1>{content.title}</h1>
          <p className="public-hero-description">{content.summary}</p>
        </div>
      </header>
      <div className="page-container document-layout">
        <DocumentBody content={content} />
      </div>
    </article>
  );
}

export function ToolGuidePage({ slug }: { slug: ToolGuideSlug }) {
  const locale = useLocale();
  const phaseContent = phaseNineContent[locale];
  const content = phaseContent.tools[slug];
  usePublicPageMetadata(content.title, content.summary);

  return (
    <article className="public-page document-page tool-guide-page">
      <header className="public-hero document-hero">
        <div className="page-container document-hero-inner" data-reveal="up">
          <Link className="text-link document-back-link" to={localizedPath(locale, 'tools')}>
            {locale === 'fa' ? <ArrowRight aria-hidden="true" /> : <ArrowLeft aria-hidden="true" />}
            {locale === 'fa' ? 'بازگشت به ابزارها' : 'Back to tools'}
          </Link>
          <p className="eyebrow">{content.eyebrow}</p>
          <h1>{content.title}</h1>
          <p className="public-hero-description">{content.summary}</p>
          <Link
            className="primary-action document-workspace-action"
            to={localizedPath(locale, 'workspace')}
          >
            {locale === 'fa' ? 'بازکردن فضای استخراج' : 'Open extraction workspace'}
            <DirectionalArrow locale={locale} />
          </Link>
        </div>
      </header>
      <div className="page-container document-layout">
        <DocumentBody content={content} />
      </div>
    </article>
  );
}
