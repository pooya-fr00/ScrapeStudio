import { Braces, Heading, Image, Link2, Table2, Tags } from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';
import { useTranslation } from 'react-i18next';

import type { PageAnalysis } from '@scrapestudio/extraction-core';
import {
  categoryCount,
  RESULT_CATEGORIES,
  type ResultCategory,
} from '../../features/scrape/categories';

const ICONS: Record<ResultCategory, ComponentType<SVGProps<SVGSVGElement>>> = {
  headings: Heading,
  images: Image,
  links: Link2,
  metadata: Tags,
  tables: Table2,
};

export function CategoryPicker({
  analysis,
  onSelect,
  selected,
}: {
  analysis: PageAnalysis;
  onSelect: (category: ResultCategory) => void;
  selected: ResultCategory;
}) {
  const { i18n, t } = useTranslation();
  const number = new Intl.NumberFormat(i18n.resolvedLanguage);

  return (
    <section aria-labelledby="detected-title" className="detected-section" data-reveal="up">
      <div className="workspace-section-heading">
        <div>
          <p>{t('workspace.categories.kicker')}</p>
          <h2 id="detected-title">{t('workspace.categories.title')}</h2>
        </div>
        <Braces aria-hidden="true" />
      </div>
      <p className="section-description">{t('workspace.categories.description')}</p>
      <div className="category-grid">
        {RESULT_CATEGORIES.map((category) => {
          const count = categoryCount(analysis, category);
          const Icon = ICONS[category];
          return (
            <button
              aria-pressed={selected === category}
              className={`category-card${selected === category ? ' is-selected' : ''}`}
              disabled={count === 0}
              key={category}
              onClick={() => onSelect(category)}
              type="button"
            >
              <span className="category-icon">
                <Icon aria-hidden="true" />
              </span>
              <span className="category-copy">
                <strong>{t(`workspace.categories.${category}`)}</strong>
                <small>
                  {count === 0
                    ? t('workspace.categories.none')
                    : t('workspace.categories.count', { count: number.format(count) })}
                </small>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
