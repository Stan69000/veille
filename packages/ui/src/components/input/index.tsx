import * as React from 'react';
import { cn } from '../../utils/index.js';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  hint?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, hint, id, ...props }, ref) => {
    const inputId = id || React.useId();
    return (
      <div className="w-full">
        <input
          type={type}
          id={inputId}
          className={cn(
            'flex h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200',
            error && 'border-error-500 focus-visible:ring-error-500',
            className
          )}
          ref={ref}
          aria-invalid={error}
          aria-describedby={hint ? `${inputId}-hint` : undefined}
          {...props}
        />
        {hint && (
          <p
            id={`${inputId}-hint`}
            className={cn(
              'mt-1.5 text-sm',
              error ? 'text-error-600' : 'text-neutral-500'
            )}
          >
            {hint}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
