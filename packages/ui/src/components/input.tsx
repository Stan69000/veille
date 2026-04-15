import * as React from 'react';
import { cn } from '../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  hint?: string;
  label?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  wrapperClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, hint, label, leftIcon, rightIcon, wrapperClassName, id, ...props }, ref) => {
    const inputId = id || React.useId();
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;

    return (
      <div className={cn('w-full space-y-1.5', wrapperClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-neutral-700 dark:text-neutral-200"
          >
            {label}
            {props.required && (
              <span className="ml-1 text-error-500" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-neutral-400" aria-hidden="true">
                {leftIcon}
              </span>
            </div>
          )}
          <input
            type={type}
            id={inputId}
            aria-invalid={error}
            aria-describedby={
              error ? errorId : hint ? hintId : undefined
            }
            className={cn(
              `flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm
               transition-colors duration-200
               placeholder:text-neutral-400
               focus:outline-none focus:ring-2 focus:ring-offset-0
               disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:opacity-50
               dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500
               dark:border-neutral-700
               file:border-0 file:bg-transparent file:text-sm file:font-medium`,
              error
                ? 'border-error-300 focus:border-error-500 focus:ring-error-200'
                : 'border-neutral-200 focus:border-primary-500 focus:ring-primary-200',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            ref={ref}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <span className="text-neutral-400" aria-hidden="true">
                {rightIcon}
              </span>
            </div>
          )}
        </div>
        {error && (
          <p id={errorId} className="flex items-center gap-1 text-sm text-error-600" role="alert">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={hintId} className="text-sm text-neutral-500">
            {hint}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
