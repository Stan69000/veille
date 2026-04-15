import { createHash } from 'crypto';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { UploadError } from '@core/errors';
import {
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE,
  validateFile,
  sanitizeFilename,
} from './validators/index.js';

export interface UploadResult {
  path: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  sha256: string;
  url?: string;
}

export interface UploadOptions {
  directory: string;
  maxSize?: number;
  allowedTypes?: readonly string[];
  subdirectory?: string;
  publicUrl?: string;
}

function getExtension(mimeType: string): string {
  const extensions: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'application/pdf': 'pdf',
  };
  return extensions[mimeType] || 'bin';
}

async function calculateSHA256(buffer: Buffer): Promise<string> {
  return createHash('sha256').update(buffer).digest('hex');
}

export async function uploadFile(
  file: {
    name: string;
    size: number;
    type: string;
    data: Buffer;
  },
  options: UploadOptions
): Promise<UploadResult> {
  validateFile({
    name: file.name,
    size: file.size,
    type: file.type,
  });

  const allowedTypes = options.allowedTypes ?? ALLOWED_MIME_TYPES;
  const maxSize = options.maxSize ?? MAX_FILE_SIZE;

  if (!allowedTypes.includes(file.type as typeof ALLOWED_MIME_TYPES[number])) {
    throw new UploadError(
      `Type de fichier non autorisé: ${file.type}`,
      allowedTypes,
      maxSize
    );
  }

  if (file.size > maxSize) {
    throw new UploadError(
      `Fichier trop volumineux: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
      allowedTypes,
      maxSize
    );
  }

  const sha256 = await calculateSHA256(file.data);
  const extension = getExtension(file.type);
  const safeName = sanitizeFilename(file.name.replace(/\.[^.]+$/, ''));
  const timestamp = Date.now();
  const finalFilename = `${safeName}_${timestamp}.${extension}`;

  const subdir = options.subdirectory ? `/${options.subdirectory}` : '';
  const relativePath = path.join(options.directory, subdir, finalFilename);
  const absolutePath = path.resolve(relativePath);

  const dir = path.dirname(absolutePath);
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }

  await writeFile(absolutePath, file.data);

  const publicUrl = options.publicUrl
    ? `${options.publicUrl}${subdir}/${finalFilename}`
    : undefined;

  return {
    path: absolutePath,
    filename: finalFilename,
    originalName: file.name,
    mimeType: file.type,
    size: file.size,
    sha256,
    url: publicUrl,
  };
}

export async function uploadImage(
  file: {
    name: string;
    size: number;
    type: string;
    data: Buffer;
  },
  options: Omit<UploadOptions, 'allowedTypes'>
): Promise<UploadResult> {
  return uploadFile(file, {
    ...options,
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  });
}

export async function uploadDocument(
  file: {
    name: string;
    size: number;
    type: string;
    data: Buffer;
  },
  options: Omit<UploadOptions, 'allowedTypes'>
): Promise<UploadResult> {
  return uploadFile(file, {
    ...options,
    allowedTypes: ['application/pdf'],
    maxSize: options.maxSize ?? 25 * 1024 * 1024,
  });
}

export function isImage(mimeType: string): boolean {
  return ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(mimeType);
}

export function isPdf(mimeType: string): boolean {
  return mimeType === 'application/pdf';
}
