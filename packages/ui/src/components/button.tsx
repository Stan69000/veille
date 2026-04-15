import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

const buttonVariants = cva(
  `inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium
   transition-all duration-200 ease-out
   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
   focus-visible:ring-primary-500 focus-visible:ring-offset-white
   disabled:pointer-events-none disabled:opacity-50
   [&_svg]:pointer-events-none [&_svg]:shrink-0
   aria-disabled:opacity-50 aria-disabled:pointer-events-none
   ring-offset-white dark:focus-visible:ring-primary-400 dark:focus-visible:ring-offset-neutral-900`,
  {
    variants: {
      variant: {
        default: [
          'bg-primary-600 text-white shadow-sm',
          'hover:bg-primary-700 hover:shadow-md hover:-translate-y-0.5',
          'active:bg-primary-800 active:translate-y-0',
        ],
        destructive: [
          'bg-error-600 text-white shadow-sm',
          'hover:bg-error-700 hover:shadow-md hover:-translate-y-0.5',
          'active:bg-error-800 active:translate-y-0',
        ],
        outline: [
          'border-2 border-neutral-200 bg-white text-neutral-700',
          'hover:bg-neutral-50 hover:border-neutral-300 hover:text-neutral-900',
          'active:bg-neutral-100',
          'dark:border-neutral-700 dark:bg-transparent dark:text-neutral-200',
          'dark:hover:bg-neutral-800 dark:hover:border-neutral-600',
        ],
        secondary: [
          'bg-neutral-100 text-neutral-900 shadow-sm',
          'hover:bg-neutral-200 hover:shadow-md hover:-translate-y-0.5',
          'active:bg-neutral-300 active:translate-y-0',
          'dark:bg-neutral-800 dark:text-neutral-100',
          'dark:hover:bg-neutral-700',
        ],
        ghost: [
          'text-neutral-600',
          'hover:bg-neutral-100 hover:text-neutral-900',
          'active:bg-neutral-200',
          'dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100',
        ],
        link: [
          'text-primary-600 underline-offset-4',
          'hover:underline hover:text-primary-700',
          'dark:text-primary-400 dark:hover:text-primary-300',
        ],
        success: [
          'bg-success-600 text-white shadow-sm',
          'hover:bg-success-700 hover:shadow-md hover:-translate-y-0.5',
          'active:bg-success-800 active:translate-y-0',
        ],
        warning: [
          'bg-warning-500 text-white shadow-sm',
          'hover:bg-warning-600 hover:shadow-md hover:-translate-y-0.5',
          'active:bg-warning-700 active:translate-y-0',
        ],
      },
      size: {
        xs: 'h-7 px-2 text-xs rounded-md',
        sm: 'h-9 px-3 text-sm',
        default: 'h-10 px-4 py-2',
        lg: 'h-12 px-6 text-base rounded-xl',
        xl: 'h-14 px-8 text-lg rounded-xl',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8',
        'icon-lg': 'h-12 w-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    
    const isDisabled = disabled || loading;
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-busy={loading}
        {...props}
      >
        {loading && (
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!loading && leftIcon}
        {children}
        {!loading && rightIcon}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
