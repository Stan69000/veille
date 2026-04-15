import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

const alertVariants = cva(
  `relative w-full rounded-lg border p-4 [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg+div]:translate-y-[-3px] [&:has(svg)]:pl-11`,
  {
    variants: {
      variant: {
        default: 'bg-white text-neutral-900 border-neutral-200 dark:bg-neutral-900 dark:text-neutral-100 dark:border-neutral-800',
        destructive: 'border-error-200 bg-error-50 text-error-900 dark:border-error-800 dark:bg-error-900/20 dark:text-error-100 [&>svg]:text-error-600 dark:[&>svg]:text-error-400',
        success: 'border-success-200 bg-success-50 text-success-900 dark:border-success-800 dark:bg-success-900/20 dark:text-success-100 [&>svg]:text-success-600 dark:[&>svg]:text-success-400',
        warning: 'border-warning-200 bg-warning-50 text-warning-900 dark:border-warning-800 dark:bg-warning-900/20 dark:text-warning-100 [&>svg]:text-warning-600 dark:[&>svg]:text-warning-400',
        info: 'border-primary-200 bg-primary-50 text-primary-900 dark:border-primary-800 dark:bg-primary-900/20 dark:text-primary-100 [&>svg]:text-primary-600 dark:[&>svg]:text-primary-400',
        outline: 'border-current bg-transparent',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

interface AlertProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertVariants> {}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
);
Alert.displayName = 'Alert';

const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h5
      ref={ref}
      className={cn('mb-1 font-medium leading-none tracking-tight', className)}
      {...props}
    />
  )
);
AlertTitle.displayName = 'AlertTitle';

const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('text-sm [&_p]:leading-relaxed', className)}
      {...props}
    />
  )
);
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertTitle, AlertDescription };
