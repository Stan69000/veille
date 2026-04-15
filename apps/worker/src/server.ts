import { Worker } from 'bullmq';
import { connectDatabase, disconnectDatabase } from '@database/client';
import { logger, createJobLogger } from './utils/logger.js';
import { handleFetchRss, handleNormalizeItems, handleGenerateExports, handleClusterItems, handleGenerateEditorial, handleAiEnrich } from './jobs/index.js';
import { initScheduler } from './scheduler/index.js';
import type { FetchRssJob, NormalizeItemsJob, GenerateExportsJob, ClusterItemsJob } from './types/jobs.js';
import type { GenerateEditorialJob } from './types/editorial.js';
import type { AiEnrichJob } from './types/ai.js';

const redis = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
};

const worker = new Worker(
  'veillescheduler',
  async (job) => {
    const jobLogger = createJobLogger(job.name || 'unknown', job.id);
    jobLogger.info({ data: job.data }, 'Processing job');

    try {
      let result: unknown;

      switch (job.name) {
        case 'fetch-rss':
          result = await handleFetchRss(job.data as FetchRssJob, jobLogger);
          break;
        case 'normalize-items':
          result = await handleNormalizeItems(job.data as NormalizeItemsJob, jobLogger);
          break;
        case 'cluster-items':
          result = await handleClusterItems(job.data as ClusterItemsJob, jobLogger);
          break;
        case 'generate-editorial':
          result = await handleGenerateEditorial(job.data as GenerateEditorialJob, jobLogger);
          break;
        case 'ai-enrich':
          result = await handleAiEnrich(job.data as AiEnrichJob, jobLogger);
          break;
        case 'generate-exports':
          result = await handleGenerateExports(job.data as GenerateExportsJob, jobLogger);
          break;
        case 'scheduled-fetch-hourly-sources':
        case 'scheduled-fetch-daily-sources':
        case 'scheduled-fetch-weekly-sources':
          result = await handleScheduledFetch(job.data, jobLogger);
          break;
        default:
          throw new Error(`Unknown job type: ${job.name}`);
      }

      jobLogger.info({ result }, 'Job completed');
      return result;
    } catch (error) {
      jobLogger.error({ error: String(error) }, 'Job failed');
      throw error;
    }
  },
  {
    connection: redis,
    concurrency: parseInt(process.env.WORKER_CONCURRENCY || '5', 10),
    limiter: {
      max: parseInt(process.env.WORKER_RATE_LIMIT || '100', 10),
      duration: 60000,
    },
  }
);

async function handleScheduledFetch(
  data: { frequency?: string; scheduleType?: string },
  jobLogger: ReturnType<typeof createJobLogger>
) {
  const { prisma } = await import('@database/client');

  const frequencyMap: Record<string, string> = {
    'hourly-sources': 'HOURLY',
    'daily-sources': 'DAILY',
    'weekly-sources': 'WEEKLY',
  };

  const frequency = frequencyMap[data.scheduleType || ''] || data.frequency;

  const sources = await prisma.source.findMany({
    where: {
      status: 'ACTIVE',
      fetchFrequency: frequency,
    },
    select: { id: true, workspaceId: true, url: true },
  });

  jobLogger.info({ frequency, sourcesCount: sources.length }, 'Processing scheduled fetch');

  let processed = 0;
  let failed = 0;

  for (const source of sources) {
    try {
      const fetchJob = await import('./jobs/fetch-rss.js');
      await fetchJob.handleFetchRss(
        {
          sourceId: source.id,
          workspaceId: source.workspaceId,
          url: source.url,
          forceRefresh: false,
        },
        jobLogger
      );
      processed++;
    } catch {
      failed++;
    }
  }

  return { frequency, processed, failed };
}

worker.on('completed', (job) => {
  logger.info({ jobId: job.id, name: job.name }, 'Job completed');
});

worker.on('failed', (job, err) => {
  logger.error({ jobId: job?.id, name: job?.name, error: err.message }, 'Job failed');
});

worker.on('error', (err) => {
  logger.error({ error: err.message }, 'Worker error');
});

async function start() {
  try {
    await connectDatabase();
    logger.info('Connected to database');

    const scheduler = await initScheduler({
      redis,
      workspaceId: process.env.WORKSPACE_ID,
    });

    if (process.env.SCHEDULE_ALL_SOURCES === 'true') {
      await scheduler.scheduleAllSources();
    }

    if (process.env.ENABLE_RECURRING_JOBS === 'true') {
      await scheduler.scheduleRecurring();
    }

    logger.info('Worker started, waiting for jobs...');

    const shutdown = async (signal: string) => {
      logger.info({ signal }, 'Shutting down worker');
      await worker.close();
      await scheduler.close();
      await disconnectDatabase();
      process.exit(0);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (err) {
    logger.error({ error: String(err) }, 'Failed to start worker');
    process.exit(1);
  }
}

start();

export { worker };
