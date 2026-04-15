import { z } from 'zod';
import { uuidSchema, paginationWithSortSchema, dateRangeSchema, searchSchema } from './index.js';

export const itemTypeSchema = z.enum([
  'ARTICLE',
  'NEWS',
  'ALERT',
  'POST',
  'EVENT',
  'JOB',
  'PRODUCT',
  'VIDEO',
  'PODCAST',
  'DOCUMENT',
  'UNKNOWN',
]);

export const itemStatusSchema = z.enum([
  'RAW',
  'PARSED',
  'DEDUPLICATED',
  'ENRICHED',
  'PENDING_REVIEW',
  'APPROVED',
  'REJECTED',
  'QUARANTINED',
  'PUBLISHED',
  'ARCHIVED',
]);

export const severitySchema = z.enum(['INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);

export const audienceSchema = z.enum([
  'GENERAL',
  'PROFESSIONNELS',
  'ASSOCIATIONS',
  'PARTICULIERS',
  'SENIORS',
  'JEUNES',
  'ENTREPRISES',
  'INSTITUTIONS',
]);

export const listItemsQuerySchema = paginationWithSortSchema.merge(dateRangeSchema).merge(searchSchema).extend({
  status: itemStatusSchema.optional(),
  sourceId: uuidSchema.optional(),
  category: z.string().optional(),
  severity: severitySchema.optional(),
  type: itemTypeSchema.optional(),
});

export const updateItemSchema = z.object({
  status: itemStatusSchema.optional(),
  severity: severitySchema.optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  tags: z.array(z.string()).optional(),
  summaryShort: z.string().optional(),
  summaryPublic: z.string().optional(),
  storyId: uuidSchema.nullable().optional(),
});

export const itemResponseSchema = z.object({
  id: z.string(),
  type: itemTypeSchema,
  title: z.string(),
  canonicalUrl: z.string().nullable(),
  domain: z.string().nullable(),
  author: z.string().nullable(),
  publishedAt: z.string().nullable(),
  extractedText: z.string().nullable(),
  cleanedText: z.string().nullable(),
  summaryShort: z.string().nullable(),
  summaryPublic: z.string().nullable(),
  category: z.string().nullable(),
  subcategory: z.string().nullable(),
  tags: z.array(z.string()),
  severity: severitySchema,
  importanceScore: z.number(),
  relevanceScore: z.number(),
  confidenceScore: z.number(),
  status: itemStatusSchema,
  language: z.string(),
  wordCount: z.number().nullable(),
  readingTimeMin: z.number().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  source: z.object({
    id: z.string(),
    name: z.string(),
    type: z.string(),
    domain: z.string().nullable(),
  }),
  story: z.object({
    id: z.string(),
    title: z.string(),
    slug: z.string(),
  }).nullable(),
  images: z.array(z.object({
    id: z.string(),
    url: z.string().nullable(),
    alt: z.string().nullable(),
  })),
  _count: z.object({
    storyItems: z.number(),
  }).optional(),
});

export const itemsListResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    items: z.array(itemResponseSchema),
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

export const itemResponseWrapperSchema = z.object({
  success: z.literal(true),
  data: itemResponseSchema,
});

export type ListItemsQuery = z.infer<typeof listItemsQuerySchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;
