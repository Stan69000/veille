import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

const badgeVariants = cva(
  `inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium
   transition-colors duration-200
   focus:outline-none focus:ring-2 focus:ring-offset-1`,
  {
    variants: {
      variant: {
        default: 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300',
        secondary: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300',
        success: 'bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-300',
        warning: 'bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-300',
        error: 'bg-error-100 text-error-800 dark:bg-error-900/30 dark:text-error-300',
        outline: 'border border-current bg-transparent',
        ghost: 'bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800',
        info: 'bg-info-100 text-info-800 dark:bg-info-900/30 dark:text-info-300',
      },
      size: {
        sm: 'px-2 py-px text-[10px]',
        default: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

function Badge({ className, variant, size, dot, children, ...props }: BadgeProps) {
  return (
    <div
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full',
            variant === 'success' && 'bg-success-500',
            variant === 'warning' && 'bg-warning-500',
            variant === 'error' && 'bg-error-500',
            variant === 'info' && 'bg-info-500',
            (!variant || variant === 'default') && 'bg-primary-500',
            variant === 'secondary' && 'bg-neutral-500',
            variant === 'outline' && 'bg-current'
          )}
          aria-hidden="true"
        />
      )}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
