'use client';

import { cn } from '@/lib/utils';

interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function SkipLink({ href, children, className }: SkipLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        'sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:mx-auto focus:w-full focus:max-w-md',
        'focus:rounded-lg focus:border-2 focus:border-primary-500 focus:bg-white focus:p-4',
        'focus:shadow-lg focus:text-primary-700 focus:font-medium',
        'transform transition-all focus:translate-y-2',
        className
      )}
    >
      {children}
    </a>
  );
}

export function SkipNav() {
  return (
    <>
      <SkipLink href="#main-content">
        Aller au contenu principal
      </SkipLink>
      <SkipLink href="#main-nav">
        Aller à la navigation principale
      </SkipLink>
    </>
  );
}
