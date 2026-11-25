
import type { ReactNode } from 'react';

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
};

export default function SectionHeader({
  eyebrow,
  title,
  description,
  action,
}: SectionHeaderProps) {
  return (
    <div className="section-header">
      <div className="section-header-content">
        {eyebrow && (
          <span className="section-eyebrow">{eyebrow}</span>
        )}

        <h2 className="section-title">{title}</h2>

        {description && (
          <p className="section-description">{description}</p>
        )}
      </div>

      {action && (
        <div className="section-header-action">
          {action}
        </div>
      )}
    </div>
  );
}
