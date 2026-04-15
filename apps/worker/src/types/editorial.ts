import { z } from 'zod';

export const generateEditorialJobSchema = z.object({
  workspaceId: z.string().uuid(),
  storyIds: z.array(z.string().uuid()).optional(),
  itemIds: z.array(z.string().uuid()).optional(),
  since: z.string().datetime().optional(),
  limit: z.number().int().positive().max(50).optional().default(20),
  options: z.object({
    summaryShort: z.boolean().optional().default(true),
    summaryPublic: z.boolean().optional().default(true),
    whyItMatters: z.boolean().optional().default(true),
    whatToDo: z.boolean().optional().default(true),
    whoIsConcerned: z.boolean().optional().default(true),
  }).optional(),
});

export type GenerateEditorialJob = z.infer<typeof generateEditorialJobSchema>;
