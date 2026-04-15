import { Queue } from 'bullmq';
import { prisma } from '@database/client';
import { createJobLogger, createSourceLogger } from '../../utils/logger.js';
import { generateFingerprint, extractKeywords } from '@dedupe/fingerprint';
import { clusterItem } from '@dedupe/clustering';
import type { FetchRssJob } from '../../types/jobs.js';
import type { Logger } from 'pino';

export interface FetchRssResult {
  sourceId: string;
  workspaceId: string;
  feedTitle: string;
  itemsFetched: number;
  newItems: number;
  duplicates: number;
  storiesCreated: number;
  storiesJoined: number;
  duration: number;
}

export async function handleFetchRss(
  payload: FetchRssJob,
  logger: Logger
): Promise<FetchRssResult> {
  const { sourceId, workspaceId, url, forceRefresh } = payload;
  const startTime = Date.now();

  const sourceLogger = createSourceLogger(sourceId);
  sourceLogger.info({ url }, 'Starting RSS fetch');

  const source = await prisma.source.findUnique({
    where: { id: sourceId },
    include: { workspace: true },
  });

  if (!source) {
    throw new Error(`Source ${sourceId} not found`);
  }

  if (!forceRefresh && source.lastFetchedAt) {
    const cooldownMs = getCooldownMs(source.fetchFrequency);
    const timeSinceLastFetch = Date.now() - source.lastFetchedAt.getTime();

    if (timeSinceLastFetch < cooldownMs) {
      sourceLogger.debug({ cooldownMs, timeSinceLastFetch }, 'Source in cooldown');
      return {
        sourceId, workspaceId, feedTitle: source.name,
        itemsFetched: 0, newItems: 0, duplicates: 0,
        storiesCreated: 0, storiesJoined: 0, duration: Date.now() - startTime,
      };
    }
  }

  try {
    const { fetchAndParseRss } = await import('@ingestion/rss');
    const result = await fetchAndParseRss(url, { timeout: 30000, maxRedirects: 5 });

    const ingestion = await prisma.rawIngestion.create({
      data: {
        sourceId,
        channel: 'RSS',
        rawText: result.feed.description || null,
        receivedAt: new Date(),
        processingStatus: 'PENDING',
      },
    });

    let newItems = 0;
    let duplicates = 0;
    let storiesCreated = 0;
    let storiesJoined = 0;

    for (let i = 0; i < result.normalizedItems.length; i++) {
      const item = result.normalizedItems[i];
      const fingerprint = result.fingerprints[i];

      const existingItem = await prisma.item.findFirst({
        where: { sourceId, fingerprint },
      });

      if (existingItem) {
        duplicates++;
        continue;
      }

      const createdItem = await prisma.item.create({
        data: {
          sourceId,
          workspaceId,
          ingestionId: ingestion.id,
          title: item.title,
          extractedText: item.content,
          canonicalUrl: item.url,
          publishedAt: item.publishedAt ? new Date(item.publishedAt) : null,
          author: item.author,
          excerpt: item.excerpt || null,
          imageUrl: item.image || null,
          importanceScore: 0.5,
          fingerprint,
          status: 'FETCHED',
        },
      });

      newItems++;

      const clusteringResult = await clusterItem({
        workspaceId,
        itemId: createdItem.id,
        title: item.title,
        content: item.content,
        url: item.url || undefined,
        publishedAt: item.publishedAt ? new Date(item.publishedAt) : undefined,
        minSimilarity: 0.65,
      });

      if (clusteringResult.action === 'created') {
        storiesCreated++;
      } else if (clusteringResult.action === 'joined') {
        storiesJoined++;
      }

      await prisma.item.update({
        where: { id: createdItem.id },
        data: { storyId: clusteringResult.storyId },
      });
    }

    await prisma.rawIngestion.update({
      where: { id: ingestion.id },
      data: { processingStatus: 'COMPLETED', processedAt: new Date() },
    });

    await prisma.source.update({
      where: { id: sourceId },
      data: { lastFetchedAt: new Date(), failureCount: 0, lastFailureAt: null },
    });

    await prisma.auditLog.create({
      data: {
        workspaceId,
        userId: 'SYSTEM',
        action: 'SOURCE_FETCHED',
        resource: 'Source',
        resourceId: sourceId,
        metadata: {
          feedTitle: result.feed.title,
          itemsFetched: result.normalizedItems.length,
          newItems,
          duplicates,
          storiesCreated,
          storiesJoined,
          duration: Date.now() - startTime,
        },
      },
    });

    const duration = Date.now() - startTime;
    sourceLogger.info(
      { feedTitle: result.feed.title, newItems, duplicates, storiesCreated, storiesJoined, duration },
      'RSS fetch completed'
    );

    return {
      sourceId, workspaceId, feedTitle: result.feed.title,
      itemsFetched: result.normalizedItems.length,
      newItems, duplicates, storiesCreated, storiesJoined, duration,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    sourceLogger.error({ error: errorMessage }, 'RSS fetch failed');

    await prisma.source.update({
      where: { id: sourceId },
      data: {
        status: source.failureCount >= 4 ? 'ERROR' : 'ACTIVE',
        lastFailureAt: new Date(),
        failureCount: { increment: 1 },
      },
    });

    throw error;
  }
}

function getCooldownMs(frequency: string): number {
  const cooldowns: Record<string, number> = {
    REAL_TIME: 60000,
    HOURLY: 3600000,
    DAILY: 86400000,
    WEEKLY: 604800000,
  };
  return cooldowns[frequency] || 3600000;
}
