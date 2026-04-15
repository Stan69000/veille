import { prisma } from '@database/client';
import { createJobLogger } from '../../utils/logger.js';
import { generateEditorialSummary, type EditorialContext } from '@editorial/summary';
import type { GenerateEditorialJob } from '../../types/editorial.js';
import type { Logger } from 'pino';

export interface GenerateEditorialResult {
  workspaceId: string;
  storiesUpdated: number;
  itemsUpdated: number;
  skipped: number;
  errors: number;
  duration: number;
}

export async function handleGenerateEditorial(
  payload: GenerateEditorialJob,
  logger: Logger
): Promise<GenerateEditorialResult> {
  const { workspaceId, storyIds, itemIds, since, limit, options } = payload;
  const startTime = Date.now();

  const jobLogger = createJobLogger('generate-editorial');
  const opts = {
    summaryShort: true,
    summaryPublic: true,
    whyItMatters: true,
    whatToDo: true,
    whoIsConcerned: true,
    ...options,
  };

  jobLogger.info({ workspaceId, storyIds, itemIds, since }, 'Starting editorial generation');

  let storiesUpdated = 0;
  let itemsUpdated = 0;
  let skipped = 0;
  let errors = 0;

  if (storyIds?.length) {
    for (const storyId of storyIds) {
      try {
        const story = await prisma.story.findUnique({
          where: { id: storyId },
          include: {
            items: {
              include: { item: true },
              orderBy: { relevanceScore: 'desc' },
              take: 5,
            },
          },
        });

        if (!story) {
          skipped++;
          continue;
        }

        const primaryItem = story.items[0]?.item;
        const ctx: EditorialContext = {
          title: story.title,
          content: primaryItem?.extractedText || primaryItem?.excerpt || story.summary || '',
          excerpt: story.summaryPublic || undefined,
          author: primaryItem?.author || undefined,
          category: story.category || undefined,
          tags: story.tags,
        };

        const editorial = generateEditorialSummary(ctx);

        await prisma.story.update({
          where: { id: storyId },
          data: {
            summaryPublic: opts.summaryPublic ? editorial.summaryPublic : undefined,
            whyItMatters: opts.whyItMatters ? editorial.whyItMatters : undefined,
            whatToDo: opts.whatToDo ? editorial.whatToDo : undefined,
            whoIsConcerned: opts.whoIsConcerned ? editorial.whoIsConcerned : undefined,
          },
        });

        storiesUpdated++;
      } catch (error) {
        jobLogger.error({ storyId, error: String(error) }, 'Failed to generate editorial for story');
        errors++;
      }
    }
  }

  if (itemIds?.length || since) {
    const whereClause: {
      workspaceId: string;
      id?: { in: string[] };
      fetchedAt?: { gte: Date };
      status?: { in: string[] };
    } = {
      workspaceId,
      status: { in: ['NORMALIZED', 'CLUSTERED'] },
    };

    if (itemIds?.length) {
      whereClause.id = { in: itemIds };
    }

    if (since) {
      whereClause.fetchedAt = { gte: new Date(since) };
    }

    const items = await prisma.item.findMany({
      where: whereClause,
      take: limit,
      orderBy: { importanceScore: 'desc' },
      include: { source: true },
    });

    for (const item of items) {
      try {
        if (!item.extractedText && !item.excerpt) {
          skipped++;
          continue;
        }

        const ctx: EditorialContext = {
          title: item.title,
          content: item.extractedText || '',
          excerpt: item.excerpt || undefined,
          author: item.author || undefined,
          sourceName: item.source.name,
          category: item.category || undefined,
          tags: item.tags,
        };

        const editorial = generateEditorialSummary(ctx);

        await prisma.item.update({
          where: { id: item.id },
          data: {
            summaryShort: opts.summaryShort ? editorial.summaryShort : undefined,
            summaryPublic: opts.summaryPublic ? editorial.summaryPublic : undefined,
          },
        });

        itemsUpdated++;
      } catch (error) {
        jobLogger.error({ itemId: item.id, error: String(error) }, 'Failed to generate editorial for item');
        errors++;
      }
    }
  }

  await prisma.auditLog.create({
    data: {
      workspaceId,
      userId: 'SYSTEM',
      action: 'EDITORIAL_GENERATED',
      resource: 'Story',
      metadata: {
        storiesUpdated,
        itemsUpdated,
        skipped,
        errors,
        duration: Date.now() - startTime,
      },
    },
  });

  const duration = Date.now() - startTime;
  jobLogger.info(
    { storiesUpdated, itemsUpdated, skipped, errors, duration },
    'Editorial generation completed'
  );

  return {
    workspaceId,
    storiesUpdated,
    itemsUpdated,
    skipped,
    errors,
    duration,
  };
}
