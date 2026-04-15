import { Queue, Worker } from 'bullmq';
import { prisma } from '@database/client';
import { logger } from '../utils/logger.js';
import type { FetchRssJob, NormalizeItemsJob, GenerateExportsJob, ClusterItemsJob } from '../types/jobs.js';
import type { GenerateEditorialJob } from '../types/editorial.js';
import type { AiEnrichJob } from '../types/ai.js';

export interface SchedulerConfig {
  redis: {
    host: string;
    port: number;
  };
  workspaceId?: string;
}

export class Scheduler {
  private queue: Queue;
  private config: SchedulerConfig;

  constructor(config: SchedulerConfig) {
    this.config = config;
    this.queue = new Queue('veillescheduler', {
      connection: config.redis,
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    });
  }

  async scheduleFetchRss(sourceId: string, workspaceId: string, url: string, priority = 0): Promise<string> {
    const job = await this.queue.add(
      'fetch-rss',
      { sourceId, workspaceId, url } satisfies FetchRssJob,
      {
        priority,
        jobId: `fetch-rss-${sourceId}-${Date.now()}`,
      }
    );

    logger.info({ jobId: job.id, sourceId }, 'Scheduled RSS fetch');
    return job.id!;
  }

  async scheduleNormalizeItems(
    workspaceId: string,
    itemIds?: string[],
    since?: Date
  ): Promise<string> {
    const job = await this.queue.add(
      'normalize-items',
      {
        workspaceId,
        itemIds,
        since: since?.toISOString(),
      } satisfies NormalizeItemsJob,
      {
        jobId: `normalize-${workspaceId}-${Date.now()}`,
      }
    );

    logger.info({ jobId: job.id, workspaceId, itemIds }, 'Scheduled items normalization');
    return job.id!;
  }

  async scheduleClusterItems(
    workspaceId: string,
    itemIds?: string[],
    since?: Date,
    minSimilarity = 0.65
  ): Promise<string> {
    const job = await this.queue.add(
      'cluster-items',
      {
        workspaceId,
        itemIds,
        since: since?.toISOString(),
        minSimilarity,
      } satisfies ClusterItemsJob,
      {
        jobId: `cluster-${workspaceId}-${Date.now()}`,
      }
    );

    logger.info({ jobId: job.id, workspaceId, itemIds }, 'Scheduled clustering');
    return job.id!;
  }

  async scheduleGenerateEditorial(
    workspaceId: string,
    storyIds?: string[],
    itemIds?: string[],
    since?: Date
  ): Promise<string> {
    const job = await this.queue.add(
      'generate-editorial',
      {
        workspaceId,
        storyIds,
        itemIds,
        since: since?.toISOString(),
      } satisfies GenerateEditorialJob,
      {
        jobId: `editorial-${workspaceId}-${Date.now()}`,
      }
    );

    logger.info({ jobId: job.id, workspaceId, storyIds, itemIds }, 'Scheduled editorial generation');
    return job.id!;
  }

  async scheduleAiEnrich(
    workspaceId: string,
    targetType: 'item' | 'story' | 'workspace',
    targetIds?: string[],
    since?: Date,
    forceMode?: 'OFF' | 'SUGGEST' | 'ASSIST' | 'AUTO_REVIEW_REQUIRED' | 'AUTO'
  ): Promise<string> {
    const job = await this.queue.add(
      'ai-enrich',
      {
        workspaceId,
        targetType,
        targetIds,
        since: since?.toISOString(),
        forceMode,
      },
      {
        jobId: `ai-${targetType}-${workspaceId}-${Date.now()}`,
      }
    );

    logger.info({ jobId: job.id, workspaceId, targetType }, 'Scheduled AI enrichment');
    return job.id!;
  }

  async scheduleExport(
    workspaceId: string,
    storyIds?: string[],
    format: 'JSON' | 'CSV' | 'RSS' | 'RSS_PREMIUM' = 'JSON'
  ): Promise<string> {
    const job = await this.queue.add(
      'generate-exports',
      { workspaceId, storyIds, format } satisfies GenerateExportsJob,
      {
        jobId: `export-${workspaceId}-${Date.now()}`,
      }
    );

    logger.info({ jobId: job.id, workspaceId, format }, 'Scheduled export');
    return job.id!;
  }

  async scheduleAllSources(): Promise<void> {
    const whereClause = this.config.workspaceId
      ? { workspaceId: this.config.workspaceId, status: 'ACTIVE' as const }
      : { status: 'ACTIVE' as const };

    const sources = await prisma.source.findMany({
      where: whereClause,
      select: { id: true, workspaceId: true, url: true, fetchFrequency: true },
    });

    logger.info({ sourcesCount: sources.length }, 'Scheduling all active sources');

    for (const source of sources) {
      await this.scheduleFetchRss(source.id, source.workspaceId, source.url);
    }
  }

  async scheduleRecurring(): Promise<void> {
    const intervals = [
      { name: 'hourly-sources', frequency: 'HOURLY' },
      { name: 'daily-sources', frequency: 'DAILY' },
      { name: 'weekly-sources', frequency: 'WEEKLY' },
    ];

    for (const interval of intervals) {
      await this.queue.add(
        `scheduled-fetch-${interval.name}`,
        { scheduleType: interval.name, frequency: interval.frequency },
        {
          repeat: {
            pattern: this.getRepeatPattern(interval.frequency),
          },
          jobId: `recurring-${interval.name}`,
        }
      );
    }

    logger.info('Scheduled recurring jobs');
  }

  private getRepeatPattern(frequency: string): string {
    const patterns: Record<string, string> = {
      HOURLY: '* * * * *',
      DAILY: '0 * * * *',
      WEEKLY: '0 0 * * 0',
    };
    return patterns[frequency] || patterns.DAILY;
  }

  async close(): Promise<void> {
    await this.queue.close();
  }
}

export async function initScheduler(config: SchedulerConfig): Promise<Scheduler> {
  const scheduler = new Scheduler(config);
  
  await scheduler.queue.upsertJobScheduler('hourly-cleanup', {
    pattern: '0 * * * *',
    callback: async () => {
      logger.info('Running hourly cleanup');
      await prisma.item.updateMany({
        where: {
          status: 'PARSING_FAILED',
          fetchedAt: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
        data: { status: 'QUARANTINED' },
      });
    },
  });

  return scheduler;
}
