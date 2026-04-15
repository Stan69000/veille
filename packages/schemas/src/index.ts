import { z } from 'zod';

export * from './common/index.js';
export * from './auth/index.js';
export * from './items/index.js';
export * from './stories/index.js';
export * from './sources/index.js';
export * from './users/index.js';

export { z };

export const uuidSchema = z.string().uuid('Invalid UUID format');

export const emailSchema = z
  .string()
  .email('Invalid email format')
  .max(255, 'Email must be at most 255 characters');

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

export const paginationWithSortSchema = paginationSchema.extend({
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const dateRangeSchema = z.object({
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});

export const searchSchema = z.object({
  search: z.string().max(255).optional(),
});

export const listQuerySchema = paginationWithSortSchema.merge(dateRangeSchema).merge(searchSchema);

export const idParamSchema = z.object({
  id: uuidSchema,
});

export const slugParamSchema = z.object({
  slug: z.string().min(1).max(255),
});

export const optionalUrlSchema = z
  .string()
  .url('Invalid URL format')
  .max(2048)
  .nullable()
  .optional();
