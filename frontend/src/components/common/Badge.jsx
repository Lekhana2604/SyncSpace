import React from 'react';

/**
 * Reusable Badge component for roles, tags, and status.
 */
export function Badge({ children, variant = 'forest', size = 'sm', className = '' }) {
  const variants = {
    forest: 'bg-forest-100 text-forest-800 dark:bg-forest-900/60 dark:text-forest-200 border border-forest-200 dark:border-forest-800',
    emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
    neutral: 'bg-surface-light-subtle text-content-light-secondary dark:bg-surface-dark-subtle dark:text-content-dark-secondary border border-forest-100 dark:border-forest-900/40',
    success: 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300 border border-green-200 dark:border-green-800',
    warning: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
    danger: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-800',
    owner: 'bg-forest-900 text-white dark:bg-forest-700 dark:text-forest-50 font-medium',
    editor: 'bg-forest-100 text-forest-800 dark:bg-forest-800 dark:text-forest-100 font-medium',
    viewer: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 font-medium',
  };

  const sizes = {
    xs: 'text-[10px] px-1.5 py-0.5 rounded',
    sm: 'text-xs px-2.5 py-0.5 rounded-full',
    md: 'text-sm px-3 py-1 rounded-full',
  };

  return (
    <span className={`inline-flex items-center gap-1 font-medium select-none ${variants[variant] || variants.forest} ${sizes[size] || sizes.sm} ${className}`}>
      {children}
    </span>
  );
}

export default Badge;
