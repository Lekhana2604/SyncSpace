import React, { forwardRef } from 'react';

/**
 * Controlled input component with error states, labels, and icon adornments.
 * Demonstrates: SyntheticEvent handling, Controlled Components, ref forwarding (useRef).
 */
export const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    icon: Icon,
    className = '',
    id,
    type = 'text',
    value,
    onChange,
    placeholder,
    disabled = false,
    required = false,
    ...props
  },
  ref
) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-content-light-primary dark:text-content-dark-primary"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative rounded-lg shadow-sm">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-content-light-secondary dark:text-content-dark-secondary">
            <Icon className="w-4 h-4" />
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`block w-full text-sm rounded-lg border transition-all duration-200 outline-none
            ${Icon ? 'pl-9' : 'pl-3.5'} pr-3.5 py-2
            bg-white dark:bg-surface-dark
            text-content-light-primary dark:text-content-dark-primary
            placeholder:text-content-light-muted dark:placeholder:text-content-dark-muted
            ${
              error
                ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900/40'
                : 'border-forest-200 dark:border-forest-800/80 focus:border-forest-600 dark:focus:border-forest-500 focus:ring-2 focus:ring-forest-100 dark:focus:ring-forest-900/50'
            }
            disabled:bg-gray-50 dark:disabled:bg-gray-900/30 disabled:text-gray-400 disabled:cursor-not-allowed
            ${className}
          `}
          {...props}
        />
      </div>

      {error ? (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-content-light-secondary dark:text-content-dark-secondary mt-1">{helperText}</p>
      ) : null}
    </div>
  );
});

export default Input;
