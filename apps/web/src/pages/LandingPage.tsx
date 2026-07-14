import { ArrowRight, Check, DatabaseZap, Languages, LockKeyhole, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { localizedPath } from '../app/routes';
import { useLocale } from '../app/use-locale';

const trustIcons = [Check, Check, Check] as const;

export function LandingPage() {
  const { t } = useTranslation();
  const locale = useLocale();
  const trustItems = [
    t('landing.trust.free'),
    t('landing.trust.openSource'),
    t('landing.trust.noSignup'),
  ];
  const capabilityCards = [
    {
      description: t('landing.cards.secureDescription'),
      icon: ShieldCheck,
      title: t('landing.cards.secureTitle'),
    },
    {
      description: t('landing.cards.bilingualDescription'),
      icon: Languages,
      title: t('landing.cards.bilingualTitle'),
    },
    {
      description: t('landing.cards.localDescription'),
      icon: LockKeyhole,
      title: t('landing.cards.localTitle'),
    },
  ];
  const workflow = [
    {
      description: t('landing.workflow.fetchDescription'),
      title: t('landing.workflow.fetchTitle'),
    },
    {
      description: t('landing.workflow.inspectDescription'),
      title: t('landing.workflow.inspectTitle'),
    },
    {
      description: t('landing.workflow.exportDescription'),
      title: t('landing.workflow.exportTitle'),
    },
  ];

  return (
    <>
      <section className="hero page-container">
        <div className="hero-copy" data-reveal="up">
          <span className="eyebrow">{t('landing.eyebrow')}</span>
          <h1>{t('landing.title')}</h1>
          <p className="hero-description">{t('landing.description')}</p>
          <div className="hero-actions">
            <Link className="button button-primary" to={localizedPath(locale, 'workspace')}>
              {t('actions.tryWorkspace')}
              <ArrowRight aria-hidden="true" className="directional-icon" size={18} />
            </Link>
            <Link className="button button-secondary" to={localizedPath(locale, 'tools')}>
              {t('actions.exploreTools')}
            </Link>
          </div>
          <ul className="trust-list">
            {trustItems.map((item, index) => {
              const TrustIcon = trustIcons[index] ?? Check;
              return (
                <li key={item}>
                  <TrustIcon aria-hidden="true" size={15} strokeWidth={2.2} />
                  {item}
                </li>
              );
            })}
          </ul>
        </div>

        <div aria-hidden="true" className="structure-visual reveal-delay-1" data-reveal="scale">
          <div className="visual-toolbar">
            <span />
            <span />
            <span />
            <code>article.card</code>
          </div>
          <div className="visual-canvas">
            <div className="selector-node selector-node-parent">
              <DatabaseZap size={18} />
              <code>.collection</code>
            </div>
            <div className="selector-branch">
              <div className="selector-node">
                <code>.title</code>
              </div>
              <div className="selector-node">
                <code>.price</code>
              </div>
              <div className="selector-node">
                <code>a[href]</code>
              </div>
            </div>
            <div className="visual-output">
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>
        </div>
      </section>

      <section className="section page-container">
        <div className="section-heading" data-reveal="up">
          <h2>{t('landing.capabilitiesTitle')}</h2>
          <p>{t('landing.capabilitiesDescription')}</p>
        </div>
        <div className="capability-grid">
          {capabilityCards.map(({ description, icon: Icon, title }, index) => (
            <article
              className={`capability-card reveal-delay-${index + 1}`}
              data-reveal="up"
              key={title}
            >
              <span className="card-icon">
                <Icon aria-hidden="true" />
              </span>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="workflow-section">
        <div className="page-container">
          <div className="section-heading compact" data-reveal="up">
            <h2>{t('landing.workflowTitle')}</h2>
          </div>
          <ol className="workflow-list">
            {workflow.map(({ description, title }, index) => (
              <li className={`reveal-delay-${index + 1}`} data-reveal="up" key={title}>
                <span className="step-number" aria-hidden="true">
                  {new Intl.NumberFormat(locale === 'fa' ? 'fa-IR' : 'en', {
                    useGrouping: false,
                  }).format(index + 1)}
                </span>
                <div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
