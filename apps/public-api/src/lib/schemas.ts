import { z } from 'zod';

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const dateRangeSchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export const audienceFilterSchema = z.object({
  audience: z.string().optional(),
  audiences: z.string().optional(),
});

export const tagFilterSchema = z.object({
  tag: z.string().optional(),
  tags: z.string().optional(),
});

export const sourceFilterSchema = z.object({
  source: z.string().optional(),
});

export const statusFilterSchema = z.object({
  status: z.enum(['pending', 'normalized', 'approved', 'rejected', 'published']).optional(),
});

export const sortSchema = z.object({
  sort: z.enum(['publishedAt', 'score', 'createdAt', 'title']).default('publishedAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export const searchSchema = z.object({
  q: z.string().optional(),
  query: z.string().optional(),
});

export const itemsQuerySchema = paginationSchema
  .merge(dateRangeSchema)
  .merge(audienceFilterSchema)
  .merge(tagFilterSchema)
  .merge(sourceFilterSchema)
  .merge(statusFilterSchema)
  .merge(sortSchema)
  .merge(searchSchema);

export type ItemsQuery = z.infer<typeof itemsQuerySchema>;

export const storiesQuerySchema = paginationSchema
  .merge(dateRangeSchema)
  .merge(audienceFilterSchema)
  .merge(tagFilterSchema)
  .merge(statusFilterSchema)
  .merge(searchSchema);

export type StoriesQuery = z.infer<typeof storiesQuerySchema>;

export const itemParamsSchema = z.object({
  id: z.string(),
});

export const storyParamsSchema = z.object({
  id: z.string(),
});

export const sourceParamsSchema = z.object({
  id: z.string(),
});

export const audienceParamsSchema = z.object({
  audience: z.string(),
});

export const feedsQuerySchema = paginationSchema
  .merge(audienceFilterSchema)
  .merge(tagFilterSchema);

export type FeedsQuery = z.infer<typeof feedsQuerySchema>;

export function parseCommaSeparated(value: string | undefined): string[] {
  if (!value) return [];
  return value.split(',').map((v) => v.trim()).filter(Boolean);
}

export function buildFilters<T extends Record<string, unknown>>(
  query: T,
  allowedFields: string[]
): Partial<T> {
  const filters: Partial<T> = {};

  for (const field of allowedFields) {
    const value = query[field as keyof T];
    if (value !== undefined && value !== null && value !== '' && value !== 'all') {
      (filters as Record<string, unknown>)[field] = value;
    }
  }

  return filters;
}
