import type { AiTaskType, AiMode, Audience } from '@core/types';
import type { AiProvider } from '../providers/index.js';
import type { AiTaskInputMap, AiTaskOutputMap } from '../schemas/index.js';
import {
  AiTaskTypeSchema,
  SummarizeItemOutputSchema,
  SummarizeStoryOutputSchema,
  ClassifyCategoryOutputSchema,
  ClassifyAudienceOutputSchema,
  DedupeHintOutputSchema,
  ExtractActionsOutputSchema,
  RewritePublicOutputSchema,
  GenerateSeoOutputSchema,
  DetectPhishingOutputSchema,
} from '../schemas/index.js';
import { buildMessages, getPrompt } from '../prompts/index.js';
import { ValidationError } from '@core/errors';

export interface AiTaskContext {
  provider: AiProvider;
  taskType: AiTaskType;
  mode: AiMode;
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  };
}

export interface AiTaskResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  tokens?: number;
  durationMs?: number;
}

export class AiTaskExecutor {
  private provider: AiProvider;
  private mode: AiMode;

  constructor(context: AiTaskContext) {
    this.provider = context.provider;
    this.mode = context.mode;
  }

  async execute<T>(
    taskType: AiTaskType,
    input: AiTaskInputMap[AiTaskType]
  ): Promise<AiTaskResult<T>> {
    if (this.mode === 'OFF') {
      return { success: false, error: 'AI task is disabled' };
    }

    const startTime = Date.now();

    try {
      const prompt = getPrompt(taskType);
      const messages = buildMessages(prompt, input as Record<string, unknown>);

      const response = await this.provider.complete(messages, {
        model: this.provider.defaultModel,
        temperature: 0.7,
        maxTokens: 2000,
      });

      const durationMs = Date.now() - startTime;
      const output = this.parseOutput(taskType, response.content);

      return {
        success: true,
        data: output as T,
        tokens: response.usage?.totalTokens,
        durationMs,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        durationMs: Date.now() - startTime,
      };
    }
  }

  private parseOutput(taskType: AiTaskType, content: string): unknown {
    const cleaned = content.trim();

    try {
      const jsonMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : cleaned;
      
      const parsed = JSON.parse(jsonStr);

      switch (taskType) {
        case 'SUMMARIZE_ITEM':
          return SummarizeItemOutputSchema.parse(parsed);
        case 'SUMMARIZE_STORY':
          return SummarizeStoryOutputSchema.parse(parsed);
        case 'CLASSIFY_CATEGORY':
          return ClassifyCategoryOutputSchema.parse(parsed);
        case 'CLASSIFY_AUDIENCE':
          return ClassifyAudienceOutputSchema.parse(parsed);
        case 'DEDUPE_HINT':
        case 'CLUSTER_HINT':
          return DedupeHintOutputSchema.parse(parsed);
        case 'EXTRACT_ACTIONS':
          return ExtractActionsOutputSchema.parse(parsed);
        case 'REWRITE_PUBLIC':
        case 'REWRITE_ASSOCIATION':
          return RewritePublicOutputSchema.parse(parsed);
        case 'GENERATE_SEO':
          return GenerateSeoOutputSchema.parse(parsed);
        case 'DETECT_PHISHING':
          return DetectPhishingOutputSchema.parse(parsed);
        default:
          return parsed;
      }
    } catch {
      throw new ValidationError(`Failed to parse AI output for task ${taskType}`);
    }
  }

  async summarizeItem(input: {
    title: string;
    content: string;
    sourceType?: string;
    language?: string;
  }): Promise<AiTaskResult<{ summary: string; summaryShort?: string; keyPoints?: string[] }>> {
    return this.execute('SUMMARIZE_ITEM', input);
  }

  async summarizeStory(input: {
    title: string;
    items: Array<{ title: string; summary: string; publishedAt?: string }>;
  }): Promise<AiTaskResult<{
    summary: string;
    whyItMatters?: string;
    whatToDo?: string;
    whoIsConcerned?: string;
  }>> {
    return this.execute('SUMMARIZE_STORY', input);
  }

  async classifyCategory(input: {
    title: string;
    content: string;
    existingCategories?: string[];
  }): Promise<AiTaskResult<{ category: string; subcategory?: string }>> {
    return this.execute('CLASSIFY_CATEGORY', input);
  }

  async classifyAudience(input: {
    title: string;
    content: string;
    category?: string;
  }): Promise<AiTaskResult<{ audiences: Audience[]; primary: Audience }>> {
    return this.execute('CLASSIFY_AUDIENCE', input);
  }

  async detectPhishing(input: {
    title: string;
    content: string;
    url?: string;
    sourceDomain?: string;
  }): Promise<AiTaskResult<{
    isPhishing: boolean;
    signals: Array<{ type: string; description: string; severity: string }>;
    recommendation: string;
  }>> {
    return this.execute('DETECT_PHISHING', input);
  }

  async rewritePublic(input: {
    title: string;
    content: string;
    audience: Audience;
    tone?: 'formal' | 'informal' | 'accessible';
  }): Promise<AiTaskResult<{ title: string; summary: string; seoTitle?: string; seoDescription?: string }>> {
    return this.execute('REWRITE_PUBLIC', input);
  }

  async generateSeo(input: {
    title: string;
    content: string;
    keywords?: string[];
    maxTitleLength?: number;
    maxDescriptionLength?: number;
  }): Promise<AiTaskResult<{ seoTitle: string; seoDescription: string; keywords?: string[] }>> {
    return this.execute('GENERATE_SEO', input);
  }

  async extractActions(input: {
    content: string;
    audience?: Audience;
  }): Promise<AiTaskResult<{
    actions: Array<{ type: string; description: string; urgency: string }>;
    whatToDo?: string;
  }>> {
    return this.execute('EXTRACT_ACTIONS', input);
  }
}

export function shouldApplyAi(mode: AiMode): boolean {
  return mode !== 'OFF';
}

export function requiresApproval(mode: AiMode): boolean {
  return mode === 'SUGGEST' || mode === 'AUTO_REVIEW_REQUIRED';
}

export function isAutomatic(mode: AiMode): boolean {
  return mode === 'AUTO';
}
