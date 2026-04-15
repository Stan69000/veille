import { prisma } from '@database/client';
import { createJobLogger } from '../../utils/logger.js';
import { clusterItem, reclusterStory } from '@dedupe/clustering';
import type { ClusterItemsJob } from '../../types/jobs.js';
import type { Logger } from 'pino';

export interface ClusterItemsResult {
  workspaceId: string;
  itemsProcessed: number;
  storiesCreated: number;
  storiesJoined: number;
  standalone: number;
  duration: number;
}

export async function handleClusterItems(
  payload: ClusterItemsJob,
  logger: Logger
): Promise<ClusterItemsResult> {
  const { workspaceId, itemIds, since, limit, minSimilarity } = payload;
  const startTime = Date.now();

  const jobLogger = createJobLogger('cluster-items');
  jobLogger.info({ workspaceId, itemIds, since, minSimilarity }, 'Starting clustering');

  const whereClause: {
    workspaceId: string;
    id?: { in: string[] };
    fetchedAt?: { gte: Date };
    status?: string;
    storyId?: null;
  } = {
    workspaceId,
    status: 'NORMALIZED',
    storyId: null,
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
    orderBy: { fetchedAt: 'desc' },
  });

  let storiesCreated = 0;
  let storiesJoined = 0;
  let standalone = 0;

  for (const item of items) {
    const result = await clusterItem({
      workspaceId,
      itemId: item.id,
      title: item.title,
      content: item.extractedText || undefined,
      url: item.canonicalUrl || undefined,
      publishedAt: item.publishedAt || undefined,
      minSimilarity,
    });

    if (result.action === 'created') {
      storiesCreated++;
    } else if (result.action === 'joined') {
      storiesJoined++;
    } else {
      standalone++;
    }

    if (result.storyId && result.action === 'joined') {
      await reclusterStory(result.storyId);
    }
  }

  await prisma.auditLog.create({
    data: {
      workspaceId,
      userId: 'SYSTEM',
      action: 'ITEMS_CLUSTERED',
      resource: 'Item',
      metadata: {
        itemsProcessed: items.length,
        storiesCreated,
        storiesJoined,
        standalone,
        duration: Date.now() - startTime,
      },
    },
  });

  const duration = Date.now() - startTime;
  jobLogger.info(
    { itemsProcessed: items.length, storiesCreated, storiesJoined, standalone, duration },
    'Clustering completed'
  );

  return {
    workspaceId,
    itemsProcessed: items.length,
    storiesCreated,
    storiesJoined,
    standalone,
    duration,
  };
}

export async function handleReclusterStory(
  payload: { storyId: string; workspaceId: string },
  logger: Logger
): Promise<{ storyId: string; itemsReclustered: number }> {
  const { storyId, workspaceId } = payload;

  const story = await prisma.story.findUnique({
    where: { id: storyId },
  });

  if (!story) {
    throw new Error(`Story ${storyId} not found`);
  }

  await reclusterStory(storyId);

  const count = await prisma.storyItem.count({ where: { storyId } });

  await prisma.auditLog.create({
    data: {
      workspaceId,
      userId: 'SYSTEM',
      action: 'STORY_RECLUSTERED',
      resource: 'Story',
      resourceId: storyId,
      metadata: { itemsReclustered: count },
    },
  });

  return { storyId, itemsReclustered: count };
}
