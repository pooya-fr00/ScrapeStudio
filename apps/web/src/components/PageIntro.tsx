import { ArrowRight, Check, Layers3 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

export function PageIntro({
  badge,
  description,
  homePath,
  title,
  actionLabel,
  visualItems = [],
  visualTitle,
}: {
  badge: string;
  description: string;
  homePath: string;
  title: string;
  actionLabel?: string;
  visualItems?: string[];
  visualTitle?: string;
}) {
  const { t } = useTranslation();

  return (
    <section
      className={`page-intro page-container${visualItems.length === 0 ? ' page-intro-single' : ''}`}
    >
      <div className="page-intro-copy" data-reveal="up">
        <span className="eyebrow">{badge}</span>
        <h1>{title}</h1>
        <p>{description}</p>
        <Link className="button button-secondary" to={homePath}>
          {actionLabel ?? t('actions.backHome')}
          <ArrowRight aria-hidden="true" className="directional-icon" size={18} />
        </Link>
      </div>

      {visualItems.length > 0 ? (
        <aside
          aria-label={visualTitle}
          className="page-intro-visual reveal-delay-1"
          data-reveal="scale"
        >
          <div className="page-intro-visual-heading">
            <span className="card-icon">
              <Layers3 aria-hidden="true" />
            </span>
            <strong>{visualTitle}</strong>
          </div>
          <ul>
            {visualItems.map((item) => (
              <li key={item}>
                <Check aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div aria-hidden="true" className="page-intro-data-flow">
            <span />
            <span />
            <span />
          </div>
        </aside>
      ) : null}
    </section>
  );
}
