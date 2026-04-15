import { z } from 'zod';
import { ValidationError } from '@core/errors';

export const URL_REGEX = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
export const SAFE_URL_REGEX = /^https:\/\//;
export const INTERNAL_DOMAINS = [
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
];

export function validateUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return SAFE_URL_REGEX.test(url) && !INTERNAL_DOMAINS.includes(parsed.hostname);
  } catch {
    return false;
  }
}

export function validateUrlStrict(url: string): boolean {
  if (!url) return false;
  if (!SAFE_URL_REGEX.test(url)) return false;
  
  try {
    const parsed = new URL(url);
    
    if (INTERNAL_DOMAINS.includes(parsed.hostname)) return false;
    if (parsed.hostname.startsWith('192.168.')) return false;
    if (parsed.hostname.startsWith('10.')) return false;
    if (parsed.hostname.startsWith('172.16.')) return false;
    if (parsed.hostname.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./)) return false;
    
    return true;
  } catch {
    return false;
  }
}

export const urlSchema = z.string().url().refine(validateUrlStrict, {
  message: 'URL invalide ou non sécurisée',
});

export const emailSchema = z.string().email().max(255);

export const uuidSchema = z.string().uuid();

export const passwordSchema = z
  .string()
  .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
  .max(128, 'Le mot de passe ne peut pas dépasser 128 caractères')
  .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
  .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
  .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre')
  .regex(/[^A-Za-z0-9]/, 'Le mot de passe doit contenir au moins un caractère spécial');

export function validatePassword(password: string): boolean {
  return passwordSchema.safeParse(password).success;
}

export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 255);
}

export function validateMimeType(
  mimeType: string,
  allowed: readonly string[]
): boolean {
  return allowed.includes(mimeType);
}

export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
] as const;

export const MimeTypeSchema = z.enum(['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']);

export const MAX_FILE_SIZE = 10 * 1024 * 1024;

export function validateFileSize(size: number): boolean {
  return size > 0 && size <= MAX_FILE_SIZE;
}

export function validateFile(
  file: { name: string; size: number; type: string }
): void {
  if (!validateMimeType(file.type, ALLOWED_MIME_TYPES)) {
    throw new ValidationError(
      `Type de fichier non autorisé: ${file.type}`,
      { allowed: ALLOWED_MIME_TYPES, provided: file.type }
    );
  }

  if (!validateFileSize(file.size)) {
    throw new ValidationError(
      `Taille du fichier trop importante: ${(file.size / 1024 / 1024).toFixed(2)}MB (max: ${MAX_FILE_SIZE / 1024 / 1024}MB)`
    );
  }
}

export function hashContent(content: string): string {
  const crypto = globalThis.crypto || require('crypto').webcrypto;
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  return crypto.subtle.digest('SHA-256', data).then((hash) => {
    return Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  });
}

export function generateFingerprint(data: {
  url?: string;
  title?: string;
  content?: string;
  author?: string;
  publishedAt?: Date;
}): string {
  const parts: string[] = [];
  
  if (data.url) parts.push(data.url.toLowerCase().trim());
  if (data.title) parts.push(data.title.toLowerCase().trim());
  if (data.author) parts.push(data.author.toLowerCase().trim());
  if (data.publishedAt) parts.push(data.publishedAt.toISOString());
  
  const combined = parts.join('|');
  
  try {
    const crypto = globalThis.crypto || require('crypto').webcrypto;
    const encoder = new TextEncoder();
    const hashBuffer = crypto.subtle.digestSync('SHA-256', encoder.encode(combined));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(combined).digest('hex');
  }
}

export interface FetchResult {
  url: string;
  statusCode: number;
  headers: Record<string, string>;
  body: string;
  contentType: string | null;
}

export function validateFetcherResult(result: FetchResult): void {
  if (result.statusCode < 200 || result.statusCode >= 400) {
    throw new ValidationError(
      `HTTP error: ${result.statusCode}`,
      { url: result.url, statusCode: result.statusCode }
    );
  }

  const allowedContentTypes = [
    'application/rss+xml',
    'application/atom+xml',
    'application/xml',
    'text/xml',
    'application/xhtml+xml',
  ];

  const contentType = result.contentType?.toLowerCase() || '';
  const isAllowed = allowedContentTypes.some((type) =>
    contentType.includes(type)
  );

  if (!isAllowed && !result.body.trim().startsWith('<')) {
    throw new ValidationError(
      'Invalid content type for RSS/Atom feed',
      { contentType, url: result.url }
    );
  }
}
