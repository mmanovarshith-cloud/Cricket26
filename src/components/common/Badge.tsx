
type BadgeVariant =
  | 'gold'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'neutral';

type BadgeProps = {
  children: string;
  variant?: BadgeVariant;
  dot?: boolean;
};

export default function Badge({
  children,
  variant = 'neutral',
  dot = false,
}: BadgeProps) {
  return (
    <span className={`badge badge-${variant}`}>
      {dot && <span className="badge-dot" />}
      {children}
    </span>
  );
}
