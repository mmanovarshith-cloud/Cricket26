
import { useState } from 'react';

type AvatarProps = {
  name: string;
  imageUrl?: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
};

export default function Avatar({
  name,
  imageUrl,
  size = 'medium',
  className = '',
}: AvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);

  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  const showImage = Boolean(imageUrl) && !imageFailed;

  return (
    <div
      className={`player-avatar avatar-${size} ${className}`.trim()}
      role="img"
      aria-label={`${name} avatar`}
    >
      {showImage ? (
        <img
          src={imageUrl}
          alt=""
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span>{initials || '?'}</span>
      )}
    </div>
  );
}
