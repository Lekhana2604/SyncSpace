import React from 'react';

/**
 * Reusable Card component for SyncSpace Forest Theme.
 * Demonstrates: Component composition, children prop, modular UI layout.
 */
export function Card({ children, className = '', hoverEffect = false, ...props }) {
  return (
    <div
      className={`bg-surface-light dark:bg-surface-dark border border-forest-100 dark:border-forest-900/60 rounded-xl shadow-forest-sm transition-all duration-200 ${
        hoverEffect ? 'hover:shadow-forest-md hover:border-forest-200 dark:hover:border-forest-700/60' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', ...props }) {
  return (
    <div className={`p-5 pb-3 border-b border-forest-50 dark:border-forest-900/30 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '', ...props }) {
  return (
    <h3 className={`text-base font-semibold text-content-light-primary dark:text-content-dark-primary tracking-tight ${className}`} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = '', ...props }) {
  return (
    <p className={`text-xs text-content-light-secondary dark:text-content-dark-secondary mt-1 leading-relaxed ${className}`} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ children, className = '', ...props }) {
  return (
    <div className={`p-5 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '', ...props }) {
  return (
    <div className={`p-4 pt-3 border-t border-forest-50 dark:border-forest-900/30 flex items-center justify-between ${className}`} {...props}>
      {children}
    </div>
  );
}

export default Card;
