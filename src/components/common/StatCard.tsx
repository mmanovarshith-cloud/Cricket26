
import type { LucideIcon } from 'lucide-react';

type StatCardProps = {
  title: string;
  value: string;
  change?: string;
  description?: string;
  icon: LucideIcon;
  accent: string;
};

export default function StatCard({
  title,
  value,
  change,
  description,
  icon: Icon,
  accent,
}: StatCardProps) {
  return (
    <article className="stat-card">
      <div className="stat-card-top">
        <span className="stat-card-title">{title}</span>

        <span
          className="stat-card-icon"
          style={{
            color: accent,
            backgroundColor: `${accent}18`,
          }}
        >
          <Icon size={20} strokeWidth={1.8} />
        </span>
      </div>

      <div className="stat-card-value">{value}</div>

      {(change || description) && (
        <div className="stat-card-footer">
          {change && (
            <span className="stat-card-change">{change}</span>
          )}

          {description && (
            <span className="stat-card-description">
              {description}
            </span>
          )}
        </div>
      )}
    </article>
  );
}
