import React from 'react';

/**
 * Reusable Button component for SyncSpace.
 * Supports Forest design system variants, sizes, and loading state.
 * Demonstrates: Props, Children, Conditional styling, Event Handling.
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  loading = false,
  onClick,
  className = '',
  icon: Icon,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer';

  const variants = {
    primary: 'bg-forest-700 hover:bg-forest-800 text-white shadow-forest-sm hover:shadow-forest-md focus:ring-forest-600 active:scale-[0.98]',
    secondary: 'bg-forest-100 hover:bg-forest-200 text-forest-900 dark:bg-forest-900/60 dark:hover:bg-forest-800 dark:text-forest-100 focus:ring-forest-500',
    outline: 'border border-forest-300 dark:border-forest-700 text-forest-800 dark:text-forest-200 hover:bg-forest-50 dark:hover:bg-forest-900/40 focus:ring-forest-500',
    ghost: 'text-content-light-primary dark:text-content-dark-primary hover:bg-forest-50 dark:hover:bg-forest-900/30 focus:ring-forest-400',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-sm active:scale-[0.98]',
    subtle: 'bg-surface-light-subtle dark:bg-surface-dark-subtle text-content-light-primary dark:text-content-dark-primary hover:bg-forest-100/70 dark:hover:bg-forest-900/50',
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        Icon && <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />
      )}
      {children}
    </button>
  );
}

export default Button;
