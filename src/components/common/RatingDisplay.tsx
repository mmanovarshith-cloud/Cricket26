
type RatingDisplayProps = {
  label: string;
  rating: number;
  compact?: boolean;
};

function getRatingColor(rating: number): string {
  if (rating >= 90) return '#E8BD63';
  if (rating >= 80) return '#42C98A';
  if (rating >= 70) return '#55A9E8';
  if (rating >= 60) return '#E8A94B';

  return '#E47777';
}

export default function RatingDisplay({
  label,
  rating,
  compact = false,
}: RatingDisplayProps) {
  const safeRating = Math.min(100, Math.max(0, rating));
  const color = getRatingColor(safeRating);

  return (
    <div className={`rating-display${compact ? ' rating-compact' : ''}`}>
      <div className="rating-display-header">
        <span className="rating-display-label">{label}</span>

        <strong style={{ color }}>
          {Math.round(safeRating)}
        </strong>
      </div>

      {!compact && (
        <div
          className="rating-track"
          role="progressbar"
          aria-label={label}
          aria-valuenow={Math.round(safeRating)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="rating-fill"
            style={{
              width: `${safeRating}%`,
              backgroundColor: color,
            }}
          />
        </div>
      )}
    </div>
  );
}
