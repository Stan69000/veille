import { prisma } from '@database/client';
import { parseHtmlItem } from '@parsing/html';
import { createJobLogger } from '../../utils/logger.js';
import type { NormalizeItemsJob } from '../../types/jobs.js';
import type { Logger } from 'pino';

export interface NormalizeItemsResult {
  workspaceId: string;
  itemsProcessed: number;
  skipped: number;
  errors: number;
  duration: number;
}

export async function handleNormalizeItems(
  payload: NormalizeItemsJob,
  logger: Logger
): Promise<NormalizeItemsResult> {
  const { workspaceId, itemIds, since, limit } = payload;
  const startTime = Date.now();

  const jobLogger = createJobLogger('normalize-items');
  jobLogger.info({ workspaceId, itemIds, since }, 'Starting items normalization');

  const whereClause: {
    workspaceId: string;
    id?: { in: string[] };
    fetchedAt?: { gte: Date };
    status?: { in: string[] };
  } = {
    workspaceId,
    status: { in: ['FETCHED', 'PARSING_FAILED'] },
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
    include: { source: true },
  });

  let processed = 0;
  let skipped = 0;
  let errors = 0;

  for (const item of items) {
    try {
      if (!item.canonicalUrl && !item.extractedText) {
        await prisma.item.update({
          where: { id: item.id },
          data: { status: 'NORMALIZED' },
        });
        skipped++;
        continue;
      }

      let normalized = {
        title: item.title,
        author: item.author,
        excerpt: item.excerpt,
        imageUrl: item.imageUrl,
      };

      if (item.canonicalUrl) {
        try {
          const fetchResult = await fetch(item.canonicalUrl, {
            headers: {
              'User-Agent': 'VeillePlatform/1.0 Normalizer',
            },
          });

          if (fetchResult.ok) {
            const html = await fetchResult.text();
            const parsed = parseHtmlItem(html, item.canonicalUrl);

            normalized = {
              title: parsed.title || item.title,
              author: parsed.author || item.author,
              excerpt: parsed.excerpt || item.excerpt,
              imageUrl: parsed.image || item.imageUrl,
            };
          }
        } catch (err) {
          jobLogger.debug({ itemId: item.id, error: String(err) }, 'Failed to fetch URL for metadata');
        }
      }

      await prisma.item.update({
        where: { id: item.id },
        data: {
          title: normalized.title,
          author: normalized.author,
          excerpt: normalized.excerpt,
          imageUrl: normalized.imageUrl,
          status: 'NORMALIZED',
        },
      });

      processed++;
    } catch (error) {
      jobLogger.error({ itemId: item.id, error: String(error) }, 'Failed to normalize item');

      await prisma.item.update({
        where: { id: item.id },
        data: { status: 'PARSING_FAILED' },
      });

      errors++;
    }
  }

  await prisma.auditLog.create({
    data: {
      workspaceId,
      userId: 'SYSTEM',
      action: 'ITEMS_NORMALIZED',
      resource: 'Item',
      metadata: {
        processed,
        skipped,
        errors,
        duration: Date.now() - startTime,
      },
    },
  });

  const duration = Date.now() - startTime;
  jobLogger.info(
    { processed, skipped, errors, duration },
    'Items normalization completed'
  );

  return {
    workspaceId,
    itemsProcessed: processed,
    skipped,
    errors,
    duration,
  };
}
