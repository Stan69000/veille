import { z } from 'zod';
import { REGEX } from '@core/constants';

export const uuidSchema = z.string().uuid('Invalid UUID format');

export const emailSchema = z
  .string()
  .email('Invalid email format')
  .max(255, 'Email must be at most 255 characters');

export const urlSchema = z
  .string()
  .url('Invalid URL format')
  .startsWith('https://', 'URL must start with https://')
  .max(2048, 'URL must be at most 2048 characters');

export const optionalUrlSchema = z
  .string()
  .url('Invalid URL format')
  .startsWith('https://', 'URL must start with https://')
  .max(2048)
  .nullable()
  .optional();

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

export const sortSchema = z.object({
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

export const paginationWithSortSchema = paginationSchema.merge(sortSchema);

export const idParamSchema = z.object({
  id: uuidSchema,
});

export const slugParamSchema = z.object({
  slug: z.string().min(1).max(255),
});

export const listQuerySchema = paginationWithSortSchema.merge(dateRangeSchema).merge(searchSchema);

export const timestampsSchema = z.object({
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
}

export function createListSchema<T extends z.ZodTypeAny>(
  itemSchema: T
) {
  return z.object({
    data: z.array(itemSchema),
    pagination: z.object({
      total: z.number(),
      page: z.number(),
      limit: z.number(),
      totalPages: z.number(),
      hasNext: z.boolean(),
      hasPrev: z.boolean(),
    }),
  });
}

export function createResponseSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    success: z.literal(true),
    data: dataSchema,
    meta: z.object({
      timestamp: z.string(),
      requestId: z.string().optional(),
    }).optional(),
  });
}

export function createErrorSchema() {
  return z.object({
    success: z.literal(false),
    error: z.object({
      code: z.string(),
      message: z.string(),
      details: z.record(z.unknown()).optional(),
    }),
  });
}

export function createApiResponseSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.discriminatedUnion('success', [
    createResponseSchema(dataSchema),
    createErrorSchema(),
  ]);
}
