
type ProgressBarProps = {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  color?: string;
  height?: number;
};

export default function ProgressBar({
  value,
  max = 100,
  label,
  showPercentage = false,
  color = '#D6B45B',
  height = 8,
}: ProgressBarProps) {
  const safeMax = Math.max(0, max);
  const percentage =
    safeMax === 0
      ? 0
      : Math.min(100, Math.max(0, (value / safeMax) * 100));

  return (
    <div className="progress-component">
      {(label || showPercentage) && (
        <div className="progress-component-header">
          {label && <span>{label}</span>}

          {showPercentage && (
            <span>{Math.round(percentage)}%</span>
          )}
        </div>
      )}

      <div
        className="progress-track"
        role="progressbar"
        aria-valuenow={Math.round(percentage)}
        aria-valuemin={0}
        aria-valuemax={100}
        style={{ height }}
      >
        <div
          className="progress-fill"
          style={{
            width: `${percentage}%`,
            background: color,
          }}
        />
      </div>
    </div>
  );
}
