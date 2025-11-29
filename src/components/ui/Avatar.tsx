interface AvatarProps {
  src: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function Avatar({ src, alt = 'User', size = 'md' }: AvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  };

  return (
    <img
      src={src}
      alt={alt}
      className={`${sizeClasses[size]} rounded-full border-2 border-white shadow-sm`}
    />
  );
}