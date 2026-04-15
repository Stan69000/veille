import { createAiPipeline, type AiPipeline } from './pipeline.js';
import { logger } from '../../utils/logger.js';

export interface EnrichWithAiOptions {
  workspaceId: string;
  itemId: string;
  forceMode?: 'OFF' | 'SUGGEST' | 'ASSIST' | 'AUTO_REVIEW_REQUIRED' | 'AUTO';
}

export async function enrichItemWithAi(options: EnrichWithAiOptions): Promise<void> {
  const { workspaceId, itemId, forceMode } = options;

  const pipeline = await createAiPipeline({ workspaceId });

  const item = await import('@database/client').then(({ prisma }) =>
    prisma.item.findUnique({
      where: { id: itemId },
      include: { source: true },
    })
  );

  if (!item) {
    throw new Error(`Item ${itemId} not found`);
  }

  const mode = forceMode || (await import('@database/client')).prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { aiMode: true },
  }).then((w) => w?.aiMode as string | undefined) || 'OFF';

  if (mode === 'OFF') {
    logger.debug({ itemId }, 'AI disabled for workspace');
    return;
  }

  logger.info({ itemId, mode }, 'Enriching item with AI');

  const summaryResult = await pipeline.executeTask('SUMMARIZE_ITEM', {
    title: item.title,
    content: item.extractedText || item.excerpt || '',
    sourceType: item.source.type,
    language: item.language,
  }, { forceMode: mode as 'OFF' | 'SUGGEST' | 'ASSIST' | 'AUTO_REVIEW_REQUIRED' | 'AUTO' });

  const categoryResult = await pipeline.executeTask('CLASSIFY_CATEGORY', {
    title: item.title,
    content: item.extractedText || '',
  }, { forceMode });

  const audienceResult = await pipeline.executeTask('CLASSIFY_AUDIENCE', {
    title: item.title,
    content: item.extractedText || '',
  }, { forceMode });

  const { prisma } = await import('@database/client');
  const updateData: Record<string, unknown> = {
    status: summaryResult.requiresReview ? 'PENDING_REVIEW' : 'ENRICHED',
    importanceScore: 0.5,
  };

  if (summaryResult.result) {
    const summary = summaryResult.result as { summary?: string; summaryShort?: string };
    if (summary.summary) updateData.summaryAi = summary.summary;
    if (summary.summaryShort) updateData.summaryShort = summary.summaryShort;
    updateData.summaryAiMode = summaryResult.mode;
  }

  if (categoryResult.result) {
    const cat = categoryResult.result as { category?: string; subcategory?: string };
    if (cat.category) updateData.category = cat.category;
    if (cat.subcategory) updateData.subcategory = cat.subcategory;
  }

  if (audienceResult.result) {
    const aud = audienceResult.result as { primary?: string };
    if (aud.primary) updateData.audiencePrimary = aud.primary;
  }

  await prisma.item.update({
    where: { id: itemId },
    data: updateData as Parameters<typeof prisma.item.update>[0]['data'],
  });

  logger.info({ itemId, summaryApplied: summaryResult.applied }, 'Item enrichment completed');
}

export async function enrichStoryWithAi(options: {
  workspaceId: string;
  storyId: string;
  forceMode?: string;
}): Promise<void> {
  const { workspaceId, storyId, forceMode } = options;

  const pipeline = await createAiPipeline({ workspaceId });

  const { prisma } = await import('@database/client');

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
    throw new Error(`Story ${storyId} not found`);
  }

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { aiMode: true },
  });

  const mode = (forceMode || workspace?.aiMode || 'OFF') as 'OFF' | 'SUGGEST' | 'ASSIST' | 'AUTO_REVIEW_REQUIRED' | 'AUTO';

  if (mode === 'OFF') {
    return;
  }

  logger.info({ storyId, mode }, 'Enriching story with AI');

  const result = await pipeline.executeTask('SUMMARIZE_STORY', {
    title: story.title,
    items: story.items.map((si) => ({
      title: si.item.title,
      summary: si.item.summaryAi || si.item.excerpt || '',
      publishedAt: si.item.publishedAt?.toISOString(),
    })),
  }, { forceMode: mode });

  if (result.result) {
    const editorial = result.result as {
      summary?: string;
      whyItMatters?: string;
      whatToDo?: string;
      whoIsConcerned?: string;
      severity?: string;
    };

    const updateData: Record<string, unknown> = {
      editorialStatus: result.requiresReview ? 'REVIEW' : 'PUBLISHED',
      aiSummary: editorial.summary,
      aiSummaryMode: mode,
    };

    if (editorial.whyItMatters) updateData.whyItMatters = editorial.whyItMatters;
    if (editorial.whatToDo) updateData.whatToDo = editorial.whatToDo;
    if (editorial.whoIsConcerned) updateData.whoIsConcerned = editorial.whoIsConcerned;
    if (editorial.severity) updateData.severity = editorial.severity;

    await prisma.story.update({
      where: { id: storyId },
      data: updateData as Parameters<typeof prisma.story.update>[0]['data'],
    });
  }

  logger.info({ storyId, applied: result.applied }, 'Story enrichment completed');
}
