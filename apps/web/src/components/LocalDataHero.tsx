import { Check, type LucideIcon } from 'lucide-react';

export function LocalDataHero({
  description,
  eyebrow,
  icon: Icon,
  privacy,
  title,
  visualItems,
  visualTitle,
}: {
  description: string;
  eyebrow: string;
  icon: LucideIcon;
  privacy: string;
  title: string;
  visualItems: string[];
  visualTitle: string;
}) {
  return (
    <div className="local-data-heading" data-reveal="up">
      <header className="local-data-heading-copy">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{description}</p>
        <div className="local-privacy-note">{privacy}</div>
      </header>

      <aside aria-label={visualTitle} className="local-data-assurance">
        <div className="local-data-assurance-heading">
          <span>
            <Icon aria-hidden="true" />
          </span>
          <strong>{visualTitle}</strong>
        </div>
        <ul>
          {visualItems.map((item) => (
            <li key={item}>
              <Check aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
