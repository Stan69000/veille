import { prisma } from '@database/client';
import { createJobLogger } from '../../utils/logger.js';
import { enrichItemWithAi, enrichStoryWithAi } from '../../ai/enrich.js';
import type { AiEnrichJob } from '../../types/ai.js';
import type { Logger } from 'pino';

export interface AiEnrichResult {
  workspaceId: string;
  targetType: string;
  itemsProcessed: number;
  storiesProcessed: number;
  skipped: number;
  errors: number;
  duration: number;
}

export async function handleAiEnrich(
  payload: AiEnrichJob,
  logger: Logger
): Promise<AiEnrichResult> {
  const { workspaceId, targetType, targetIds, since, forceMode, options } = payload;
  const startTime = Date.now();

  const jobLogger = createJobLogger('ai-enrich');
  jobLogger.info({ workspaceId, targetType, since }, 'Starting AI enrichment');

  const opts = {
    summarize: true,
    classify: true,
    detectPhishing: false,
    rewritePublic: false,
    generateSeo: false,
    maxItems: 20,
    ...options,
  };

  let itemsProcessed = 0;
  let storiesProcessed = 0;
  let skipped = 0;
  let errors = 0;

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { aiMode: true },
  });

  if (!workspace || workspace.aiMode === 'OFF') {
    jobLogger.info('AI is disabled for this workspace');
    return {
      workspaceId,
      targetType,
      itemsProcessed: 0,
      storiesProcessed: 0,
      skipped: 0,
      errors: 0,
      duration: Date.now() - startTime,
    };
  }

  if (targetType === 'item' || targetType === 'workspace') {
    const whereClause: {
      workspaceId: string;
      id?: { in: string[] };
      fetchedAt?: { gte: Date };
      status?: { in: string[] };
      summaryAi?: null;
    } = {
      workspaceId,
      status: { in: ['NORMALIZED', 'CLUSTERED'] },
      summaryAi: null,
    };

    if (targetIds?.length) {
      whereClause.id = { in: targetIds };
    }

    if (since) {
      whereClause.fetchedAt = { gte: new Date(since) };
    }

    const items = await prisma.item.findMany({
      where: whereClause,
      take: opts.maxItems,
      orderBy: { importanceScore: 'desc' },
    });

    for (const item of items) {
      try {
        await enrichItemWithAi({
          workspaceId,
          itemId: item.id,
          forceMode: forceMode as 'OFF' | 'SUGGEST' | 'ASSIST' | 'AUTO_REVIEW_REQUIRED' | 'AUTO' | undefined,
        });
        itemsProcessed++;
      } catch (error) {
        jobLogger.error({ itemId: item.id, error: String(error) }, 'Failed to enrich item');
        errors++;
      }
    }

    skipped = items.length - itemsProcessed - errors;
  }

  if (targetType === 'story' || targetType === 'workspace') {
    const whereClause: {
      workspaceId: string;
      id?: { in: string[] };
      createdAt?: { gte: Date };
      editorialStatus: string;
      aiSummary?: null;
    } = {
      workspaceId,
      editorialStatus: 'DRAFT',
      aiSummary: null,
    };

    if (targetIds?.length) {
      whereClause.id = { in: targetIds };
    }

    if (since) {
      whereClause.createdAt = { gte: new Date(since) };
    }

    const stories = await prisma.story.findMany({
      where: whereClause,
      take: Math.ceil(opts.maxItems / 3),
      orderBy: { importanceScore: 'desc' },
    });

    for (const story of stories) {
      try {
        await enrichStoryWithAi({
          workspaceId,
          storyId: story.id,
          forceMode,
        });
        storiesProcessed++;
      } catch (error) {
        jobLogger.error({ storyId: story.id, error: String(error) }, 'Failed to enrich story');
        errors++;
      }
    }

    skipped += stories.length - storiesProcessed;
  }

  await prisma.auditLog.create({
    data: {
      workspaceId,
      userId: 'SYSTEM',
      action: 'AI_ENRICH_COMPLETED',
      resource: 'Workspace',
      metadata: {
        targetType,
        itemsProcessed,
        storiesProcessed,
        skipped,
        errors,
        duration: Date.now() - startTime,
      },
    },
  });

  const duration = Date.now() - startTime;
  jobLogger.info(
    { itemsProcessed, storiesProcessed, skipped, errors, duration },
    'AI enrichment completed'
  );

  return {
    workspaceId,
    targetType,
    itemsProcessed,
    storiesProcessed,
    skipped,
    errors,
    duration,
  };
}
