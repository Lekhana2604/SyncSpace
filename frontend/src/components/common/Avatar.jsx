import React from 'react';

/**
 * Avatar component with presence indicator and initials fallback.
 * Demonstrates: Conditional rendering, string operations in JSX, styling props.
 */
export function Avatar({
  name = 'User',
  src,
  size = 'md',
  status, // 'online' | 'offline' | undefined
  className = '',
}) {
  const getInitials = (str) => {
    if (!str) return 'U';
    const parts = str.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return str.slice(0, 2).toUpperCase();
  };

  const sizes = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-9 h-9 text-xs',
    lg: 'w-11 h-11 text-sm font-semibold',
    xl: 'w-16 h-16 text-lg font-bold',
  };

  const statusSizes = {
    xs: 'w-1.5 h-1.5 ring-1',
    sm: 'w-2 h-2 ring-1.5',
    md: 'w-2.5 h-2.5 ring-2',
    lg: 'w-3 h-3 ring-2',
    xl: 'w-4 h-4 ring-2',
  };

  return (
    <div className={`relative inline-flex flex-shrink-0 ${className}`}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={`${sizes[size] || sizes.md} rounded-full object-cover ring-1 ring-forest-200 dark:ring-forest-800`}
        />
      ) : (
        <div
          className={`${sizes[size] || sizes.md} rounded-full bg-forest-100 dark:bg-forest-900/80 text-forest-800 dark:text-forest-200 font-medium flex items-center justify-center ring-1 ring-forest-200 dark:ring-forest-800 select-none`}
        >
          {getInitials(name)}
        </div>
      )}

      {status && (
        <span
          className={`absolute bottom-0 right-0 block rounded-full ring-white dark:ring-surface-dark ${
            status === 'online' ? 'bg-emerald-500' : 'bg-gray-400'
          } ${statusSizes[size] || statusSizes.md}`}
        />
      )}
    </div>
  );
}

export default Avatar;
