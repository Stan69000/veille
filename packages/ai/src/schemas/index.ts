import { z } from 'zod';
import type { AiTaskType, AiMode, Audience, Severity } from '@core/types';

export const AiTaskTypeSchema = z.enum([
  'SUMMARIZE_ITEM',
  'SUMMARIZE_STORY',
  'CLASSIFY_CATEGORY',
  'CLASSIFY_AUDIENCE',
  'DEDUPE_HINT',
  'CLUSTER_HINT',
  'EXTRACT_ACTIONS',
  'REWRITE_PUBLIC',
  'REWRITE_ASSOCIATION',
  'GENERATE_SEO',
  'DETECT_PHISHING',
]);

export const AiModeSchema = z.enum(['OFF', 'SUGGEST', 'ASSIST', 'AUTO_REVIEW_REQUIRED', 'AUTO']);

export const SummarizeItemInputSchema = z.object({
  title: z.string(),
  content: z.string(),
  sourceType: z.string().optional(),
  language: z.string().default('fr'),
});

export const SummarizeItemOutputSchema = z.object({
  summary: z.string(),
  summaryShort: z.string().optional(),
  keyPoints: z.array(z.string()).optional(),
  confidence: z.number().min(0).max(1),
});

export const SummarizeStoryInputSchema = z.object({
  title: z.string(),
  items: z.array(z.object({
    title: z.string(),
    summary: z.string(),
    publishedAt: z.string().optional(),
  })),
});

export const SummarizeStoryOutputSchema = z.object({
  summary: z.string(),
  whyItMatters: z.string().optional(),
  whatToDo: z.string().optional(),
  whoIsConcerned: z.string().optional(),
  severity: z.enum(['INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
});

export const ClassifyCategoryInputSchema = z.object({
  title: z.string(),
  content: z.string(),
  existingCategories: z.array(z.string()).optional(),
});

export const ClassifyCategoryOutputSchema = z.object({
  category: z.string(),
  subcategory: z.string().optional(),
  confidence: z.number().min(0).max(1),
  alternatives: z.array(z.object({
    category: z.string(),
    confidence: z.number(),
  })).optional(),
});

export const ClassifyAudienceInputSchema = z.object({
  title: z.string(),
  content: z.string(),
  category: z.string().optional(),
});

export const ClassifyAudienceOutputSchema = z.object({
  audiences: z.array(z.enum([
    'GENERAL',
    'PROFESSIONNELS',
    'ASSOCIATIONS',
    'PARTICULIERS',
    'SENIORS',
    'JEUNES',
    'ENTREPRISES',
    'INSTITUTIONS',
  ])),
  primary: z.enum([
    'GENERAL',
    'PROFESSIONNELS',
    'ASSOCIATIONS',
    'PARTICULIERS',
    'SENIORS',
    'JEUNES',
    'ENTREPRISES',
    'INSTITUTIONS',
  ]),
  confidence: z.number().min(0).max(1),
});

export const DedupeHintInputSchema = z.object({
  newItem: z.object({
    title: z.string(),
    content: z.string(),
    url: z.string().optional(),
    publishedAt: z.string().optional(),
  }),
  existingItems: z.array(z.object({
    id: z.string(),
    title: z.string(),
    content: z.string(),
    url: z.string().optional(),
  })),
});

export const DedupeHintOutputSchema = z.object({
  isDuplicate: z.boolean(),
  originalId: z.string().optional(),
  similarity: z.number().min(0).max(1),
  reason: z.string(),
});

export const RewritePublicInputSchema = z.object({
  title: z.string(),
  content: z.string(),
  audience: z.enum([
    'GENERAL',
    'PROFESSIONNELS',
    'ASSOCIATIONS',
    'PARTICULIERS',
    'SENIORS',
    'JEUNES',
    'ENTREPRISES',
    'INSTITUTIONS',
  ]),
  tone: z.enum(['formal', 'informal', 'accessible']).default('accessible'),
});

export const RewritePublicOutputSchema = z.object({
  title: z.string(),
  summary: z.string(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

export const GenerateSeoInputSchema = z.object({
  title: z.string(),
  content: z.string(),
  keywords: z.array(z.string()).optional(),
  maxTitleLength: z.number().default(60),
  maxDescriptionLength: z.number().default(160),
});

export const GenerateSeoOutputSchema = z.object({
  seoTitle: z.string(),
  seoDescription: z.string(),
  keywords: z.array(z.string()).optional(),
});

export const ExtractActionsInputSchema = z.object({
  content: z.string(),
  audience: z.enum([
    'GENERAL',
    'PROFESSIONNELS',
    'ASSOCIATIONS',
    'PARTICULIERS',
    'SENIORS',
    'JEUNES',
    'ENTREPRISES',
    'INSTITUTIONS',
  ]).optional(),
});

export const ExtractActionsOutputSchema = z.object({
  actions: z.array(z.object({
    type: z.enum(['read', 'sign', 'share', 'contact', 'donate', 'participate', 'learn', 'other']),
    description: z.string(),
    urgency: z.enum(['low', 'medium', 'high']).default('medium'),
    targetAudience: z.string().optional(),
  })),
  whatToDo: z.string().optional(),
});

export const DetectPhishingInputSchema = z.object({
  title: z.string(),
  content: z.string(),
  url: z.string().optional(),
  sourceDomain: z.string().optional(),
});

export const DetectPhishingOutputSchema = z.object({
  isPhishing: z.boolean(),
  confidence: z.number().min(0).max(1),
  signals: z.array(z.object({
    type: z.string(),
    description: z.string(),
    severity: z.enum(['low', 'medium', 'high']),
  })),
  recommendation: z.string(),
});

export const AiProviderConfigSchema = z.object({
  apiKey: z.string().optional(),
  baseUrl: z.string().url().optional(),
  model: z.string().optional(),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().positive().default(2000),
  timeout: z.number().positive().default(60000),
});

export const AiRequestSchema = z.object({
  model: z.string(),
  messages: z.array(z.object({
    role: z.enum(['system', 'user', 'assistant']),
    content: z.string(),
  })),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().positive().optional(),
  topP: z.number().min(0).max(1).optional(),
  stop: z.array(z.string()).optional(),
});

export const AiResponseSchema = z.object({
  id: z.string(),
  model: z.string(),
  choices: z.array(z.object({
    index: z.number(),
    message: z.object({
      role: z.string(),
      content: z.string(),
    }),
    finishReason: z.string(),
  })),
  usage: z.object({
    promptTokens: z.number(),
    completionTokens: z.number(),
    totalTokens: z.number(),
  }).optional(),
  created: z.number().optional(),
});

export type AiTaskInputMap = {
  SUMMARIZE_ITEM: z.infer<typeof SummarizeItemInputSchema>;
  SUMMARIZE_STORY: z.infer<typeof SummarizeStoryInputSchema>;
  CLASSIFY_CATEGORY: z.infer<typeof ClassifyCategoryInputSchema>;
  CLASSIFY_AUDIENCE: z.infer<typeof ClassifyAudienceInputSchema>;
  DEDUPE_HINT: z.infer<typeof DedupeHintInputSchema>;
  CLUSTER_HINT: z.infer<typeof DedupeHintInputSchema>;
  EXTRACT_ACTIONS: z.infer<typeof ExtractActionsInputSchema>;
  REWRITE_PUBLIC: z.infer<typeof RewritePublicInputSchema>;
  REWRITE_ASSOCIATION: z.infer<typeof RewritePublicInputSchema>;
  GENERATE_SEO: z.infer<typeof GenerateSeoInputSchema>;
  DETECT_PHISHING: z.infer<typeof DetectPhishingInputSchema>;
};

export type AiTaskOutputMap = {
  SUMMARIZE_ITEM: z.infer<typeof SummarizeItemOutputSchema>;
  SUMMARIZE_STORY: z.infer<typeof SummarizeStoryOutputSchema>;
  CLASSIFY_CATEGORY: z.infer<typeof ClassifyCategoryOutputSchema>;
  CLASSIFY_AUDIENCE: z.infer<typeof ClassifyAudienceOutputSchema>;
  DEDUPE_HINT: z.infer<typeof DedupeHintOutputSchema>;
  CLUSTER_HINT: z.infer<typeof DedupeHintOutputSchema>;
  EXTRACT_ACTIONS: z.infer<typeof ExtractActionsOutputSchema>;
  REWRITE_PUBLIC: z.infer<typeof RewritePublicOutputSchema>;
  REWRITE_ASSOCIATION: z.infer<typeof RewritePublicOutputSchema>;
  GENERATE_SEO: z.infer<typeof GenerateSeoOutputSchema>;
  DETECT_PHISHING: z.infer<typeof DetectPhishingOutputSchema>;
};
