import { z } from 'zod';
import { uuidSchema, paginationWithSortSchema, dateRangeSchema, searchSchema } from './index.js';
import { severitySchema, audienceSchema } from './items/index.js';

export const editorialStatusSchema = z.enum(['DRAFT', 'IN_PROGRESS', 'READY', 'PUBLISHED', 'ARCHIVED']);

export const storyItemRoleSchema = z.enum(['PRIMARY', 'SECONDARY', 'CONTEXT', 'RELATED']);

export const listStoriesQuerySchema = paginationWithSortSchema.merge(dateRangeSchema).merge(searchSchema).extend({
  status: editorialStatusSchema.optional(),
  category: z.string().optional(),
  severity: severitySchema.optional(),
});

export const createStorySchema = z.object({
  title: z.string().min(1).max(255),
  strapline: z.string().max(500).optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  severity: severitySchema.optional(),
  itemIds: z.array(uuidSchema).optional(),
});

export const updateStorySchema = z.object({
  title: z.string().min(1).max(255).optional(),
  strapline: z.string().max(500).optional(),
  summary: z.string().optional(),
  summaryPublic: z.string().optional(),
  whyItMatters: z.string().optional(),
  whatToDo: z.string().optional(),
  whoIsConcerned: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  severity: severitySchema.optional(),
  editorialStatus: editorialStatusSchema.optional(),
});

export const addItemToStorySchema = z.object({
  itemId: uuidSchema,
  role: storyItemRoleSchema.optional().default('SECONDARY'),
});

export const audienceVariantSchema = z.object({
  id: z.string(),
  audience: audienceSchema,
  title: z.string().nullable(),
  summary: z.string().nullable(),
  whyItMatters: z.string().nullable(),
  whatToDo: z.string().nullable(),
  whoIsConcerned: z.string().nullable(),
  seoTitle: z.string().nullable(),
  seoDescription: z.string().nullable(),
  status: z.enum(['DRAFT', 'GENERATED', 'REVIEWED', 'APPROVED', 'PUBLISHED']),
  aiGenerated: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const storyItemSchema = z.object({
  id: z.string(),
  role: storyItemRoleSchema,
  order: z.number(),
  item: z.object({
    id: z.string(),
    title: z.string(),
    canonicalUrl: z.string().nullable(),
    domain: z.string().nullable(),
    author: z.string().nullable(),
    publishedAt: z.string().nullable(),
    summaryShort: z.string().nullable(),
    extractedText: z.string().nullable(),
  }),
});

export const storyResponseSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  strapline: z.string().nullable(),
  summary: z.string().nullable(),
  summaryPublic: z.string().nullable(),
  whyItMatters: z.string().nullable(),
  whatToDo: z.string().nullable(),
  whoIsConcerned: z.string().nullable(),
  category: z.string().nullable(),
  subcategory: z.string().nullable(),
  tags: z.array(z.string()),
  severity: severitySchema,
  editorialStatus: editorialStatusSchema,
  importanceScore: z.number(),
  coverageCount: z.number(),
  firstSeenAt: z.string(),
  lastUpdatedAt: z.string(),
  publishedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  items: z.array(storyItemSchema),
  variants: z.array(audienceVariantSchema),
  _count: z.object({
    items: z.number(),
  }),
});

export const storiesListResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    stories: z.array(storyResponseSchema),
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

export const storyResponseWrapperSchema = z.object({
  success: z.literal(true),
  data: storyResponseSchema,
});

export type ListStoriesQuery = z.infer<typeof listStoriesQuerySchema>;
export type CreateStoryInput = z.infer<typeof createStorySchema>;
export type UpdateStoryInput = z.infer<typeof updateStorySchema>;
export type AddItemToStoryInput = z.infer<typeof addItemToStorySchema>;
