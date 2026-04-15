import { z } from 'zod';
import { uuidSchema, paginationWithSortSchema, searchSchema, optionalUrlSchema } from './index.js';

export const sourceTypeSchema = z.enum([
  'RSS',
  'ATOM',
  'NEWSLETTER',
  'EMAIL',
  'SMS',
  'MANUAL',
  'WEBHOOK',
  'API',
]);

export const sourceStatusSchema = z.enum(['ACTIVE', 'PAUSED', 'ERROR', 'DISABLED', 'PENDING']);

export const sourceTrustLevelSchema = z.enum(['TRUSTED', 'VERIFIED', 'UNVERIFIED', 'FLAGGED', 'BLOCKED']);

export const fetchFrequencySchema = z.enum([
  'MANUAL',
  'EVERY_15M',
  'HOURLY',
  'EVERY_6H',
  'EVERY_12H',
  'DAILY',
  'WEEKLY',
  'CUSTOM',
]);

export const listSourcesQuerySchema = paginationWithSortSchema.merge(searchSchema).extend({
  status: sourceStatusSchema.optional(),
  type: sourceTypeSchema.optional(),
});

export const createSourceSchema = z.object({
  name: z.string().min(1).max(255),
  type: sourceTypeSchema,
  url: optionalUrlSchema,
  language: z.string().optional().default('fr'),
  trustLevel: sourceTrustLevelSchema.optional().default('UNVERIFIED'),
  priority: z.number().int().min(1).max(100).optional().default(50),
  fetchFrequencyMode: fetchFrequencySchema.optional().default('MANUAL'),
  fetchCron: z.string().optional().nullable(),
  timeoutMs: z.number().int().positive().optional().default(30000),
  categories: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  description: z.string().optional().nullable(),
  iconUrl: optionalUrlSchema,
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().nullable(),
  notes: z.string().optional().nullable(),
  emailAddress: z.string().email().optional().nullable(),
  emailPassword: z.string().optional().nullable(),
});

export const updateSourceSchema = createSourceSchema.partial();

export const sourceResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: sourceTypeSchema,
  url: z.string().nullable(),
  domain: z.string().nullable(),
  status: sourceStatusSchema,
  trustLevel: sourceTrustLevelSchema,
  language: z.string(),
  priority: z.number(),
  fetchFrequencyMode: fetchFrequencySchema,
  fetchCron: z.string().nullable(),
  timeoutMs: z.number(),
  categories: z.array(z.string()),
  tags: z.array(z.string()),
  description: z.string().nullable(),
  iconUrl: z.string().nullable(),
  color: z.string().nullable(),
  notes: z.string().nullable(),
  lastFetchedAt: z.string().nullable(),
  nextFetchAt: z.string().nullable(),
  lastSuccessAt: z.string().nullable(),
  lastFailureAt: z.string().nullable(),
  lastError: z.string().nullable(),
  fetchCount: z.number(),
  successCount: z.number(),
  failureCount: z.number(),
  emailAddress: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  _count: z.object({
    items: z.number(),
    rawIngestions: z.number(),
  }),
});

export const sourcesListResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    sources: z.array(sourceResponseSchema),
    pagination: z.object({
      total: z.number(),
      page: z.number(),
      limit: z.number(),
      totalPages: z.number(),
      hasNext: z.boolean(),
      hasPrev: z.boolean(),
    }),
  }),
});

export const sourceResponseWrapperSchema = z.object({
  success: z.literal(true),
  data: sourceResponseSchema,
});

export type ListSourcesQuery = z.infer<typeof listSourcesQuerySchema>;
export type CreateSourceInput = z.infer<typeof createSourceSchema>;
export type UpdateSourceInput = z.infer<typeof updateSourceSchema>;
