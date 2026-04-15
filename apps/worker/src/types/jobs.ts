import { z } from 'zod';

export const fetchRssJobSchema = z.object({
  sourceId: z.string().uuid(),
  workspaceId: z.string().uuid(),
  url: z.string().url(),
  forceRefresh: z.boolean().optional().default(false),
});

export const normalizeItemsJobSchema = z.object({
  workspaceId: z.string().uuid(),
  itemIds: z.array(z.string().uuid()).optional(),
  since: z.string().datetime().optional(),
  limit: z.number().int().positive().max(100).optional().default(50),
});

export const generateExportsJobSchema = z.object({
  workspaceId: z.string().uuid(),
  storyIds: z.array(z.string().uuid()).optional(),
  targetId: z.string().uuid().optional(),
  format: z.enum(['JSON', 'CSV', 'RSS', 'RSS_PREMIUM']).optional().default('JSON'),
  since: z.string().datetime().optional(),
});

export const clusterItemsJobSchema = z.object({
  workspaceId: z.string().uuid(),
  itemIds: z.array(z.string().uuid()).optional(),
  since: z.string().datetime().optional(),
  limit: z.number().int().positive().max(100).optional().default(50),
  minSimilarity: z.number().min(0).max(1).optional().default(0.65),
});

export type FetchRssJob = z.infer<typeof fetchRssJobSchema>;
export type NormalizeItemsJob = z.infer<typeof normalizeItemsJobSchema>;
export type GenerateExportsJob = z.infer<typeof generateExportsJobSchema>;
export type ClusterItemsJob = z.infer<typeof clusterItemsJobSchema>;

export type JobPayload = FetchRssJob | NormalizeItemsJob | GenerateExportsJob | ClusterItemsJob;
