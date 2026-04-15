import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/index.js';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary-600 text-white',
        secondary: 'border-transparent bg-neutral-100 text-neutral-700',
        success: 'border-transparent bg-success-100 text-success-700',
        warning: 'border-transparent bg-warning-100 text-warning-700',
        destructive: 'border-transparent bg-error-100 text-error-700',
        info: 'border-transparent bg-info-100 text-info-700',
        outline: 'border-neutral-300 text-neutral-700',
        infoOutline: 'border-info-200 bg-info-50 text-info-700',
        successOutline: 'border-success-200 bg-success-50 text-success-700',
        warningOutline: 'border-warning-200 bg-warning-50 text-warning-700',
        errorOutline: 'border-error-200 bg-error-50 text-error-700',
      },
      size: {
        default: 'px-2.5 py-0.5 text-xs',
        sm: 'px-2 py-px text-[10px]',
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
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
