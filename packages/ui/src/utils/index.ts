import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  });
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'à l\'instant';
  if (diffMin < 60) return `il y a ${diffMin}min`;
  if (diffHour < 24) return `il y a ${diffHour}h`;
  if (diffDay < 7) return `il y a ${diffDay}j`;
  return formatDate(d);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const severityColors = {
  INFO: 'bg-info-100 text-info-700 border-info-200',
  LOW: 'bg-blue-100 text-blue-700 border-blue-200',
  MEDIUM: 'bg-warning-100 text-warning-700 border-warning-200',
  HIGH: 'bg-orange-100 text-orange-700 border-orange-200',
  CRITICAL: 'bg-error-100 text-error-700 border-error-200',
} as const;

export const statusColors = {
  ACTIVE: 'bg-success-100 text-success-700 border-success-200',
  PAUSED: 'bg-warning-100 text-warning-700 border-warning-200',
  ERROR: 'bg-error-100 text-error-700 border-error-200',
  DISABLED: 'bg-neutral-100 text-neutral-700 border-neutral-200',
  PENDING: 'bg-info-100 text-info-700 border-info-200',
  DRAFT: 'bg-neutral-100 text-neutral-700 border-neutral-200',
  PUBLISHED: 'bg-success-100 text-success-700 border-success-200',
  APPROVED: 'bg-success-100 text-success-700 border-success-200',
  REJECTED: 'bg-error-100 text-error-700 border-error-200',
  QUARANTINED: 'bg-warning-100 text-warning-700 border-warning-200',
} as const;

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
