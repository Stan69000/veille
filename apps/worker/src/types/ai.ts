import { z } from 'zod';

export const aiEnrichJobSchema = z.object({
  workspaceId: z.string().uuid(),
  targetType: z.enum(['item', 'story', 'workspace']),
  targetIds: z.array(z.string().uuid()).optional(),
  since: z.string().datetime().optional(),
  forceMode: z.enum(['OFF', 'SUGGEST', 'ASSIST', 'AUTO_REVIEW_REQUIRED', 'AUTO']).optional(),
  options: z.object({
    summarize: z.boolean().optional().default(true),
    classify: z.boolean().optional().default(true),
    detectPhishing: z.boolean().optional().default(false),
    rewritePublic: z.boolean().optional().default(false),
    generateSeo: z.boolean().optional().default(false),
    maxItems: z.number().int().positive().max(100).optional().default(20),
  }).optional(),
});

export type AiEnrichJob = z.infer<typeof aiEnrichJobSchema>;
