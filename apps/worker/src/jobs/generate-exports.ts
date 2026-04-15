import { createHash } from 'crypto';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { prisma } from '@database/client';
import { createJobLogger } from '../../utils/logger.js';
import type { GenerateExportsJob } from '../../types/jobs.js';
import type { Logger } from 'pino';

export interface GenerateExportsResult {
  workspaceId: string;
  format: string;
  storyIds: string[];
  outputPath: string;
  recordsCount: number;
  duration: number;
}

export async function handleGenerateExports(
  payload: GenerateExportsJob,
  logger: Logger
): Promise<GenerateExportsResult> {
  const { workspaceId, storyIds, format, since } = payload;
  const startTime = Date.now();

  const jobLogger = createJobLogger('generate-exports');
  jobLogger.info({ workspaceId, format }, 'Starting export generation');

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
  });

  if (!workspace) {
    throw new Error(`Workspace ${workspaceId} not found`);
  }

  const whereClause: { story?: { id: { in: string[] } }; createdAt?: { gte: Date } } = {};
  if (storyIds?.length) {
    whereClause.story = { id: { in: storyIds } };
  }
  if (since) {
    whereClause.createdAt = { gte: new Date(since) };
  }

  const stories = await prisma.story.findMany({
    where: whereClause,
    include: {
      items: {
        include: {
          item: {
            include: { source: true, tags: true },
          },
        },
        orderBy: { item: { importanceScore: 'desc' } },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  let output: string;
  let extension: string;

  switch (format) {
    case 'JSON':
      output = generateJsonExport(stories, workspace.name);
      extension = 'json';
      break;
    case 'CSV':
      output = generateCsvExport(stories);
      extension = 'csv';
      break;
    case 'RSS':
    case 'RSS_PREMIUM':
      output = generateRssExport(stories, workspace.name, format === 'RSS_PREMIUM');
      extension = 'xml';
      break;
    default:
      output = generateJsonExport(stories, workspace.name);
      extension = 'json';
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const hash = createHash('sha256').update(`${workspaceId}-${timestamp}`).digest('hex').slice(0, 8);
  const filename = `export-${workspace.slug}-${timestamp}-${hash}.${extension}`;
  
  const exportPath = join(process.env.STORAGE_EXPORTS_PATH || './storage/exports', filename);
  await mkdir(join(process.env.STORAGE_EXPORTS_PATH || './storage/exports'), { recursive: true });
  await writeFile(exportPath, output, 'utf-8');

  await prisma.publicationJob.create({
    data: {
      targetId: 'EXPORT',
      workspaceId,
      status: 'COMPLETED',
      startedAt: new Date(startTime),
      finishedAt: new Date(),
      outputPath: exportPath,
      recordsCount: stories.length,
    },
  });

  await prisma.auditLog.create({
    data: {
      workspaceId,
      userId: 'SYSTEM',
      action: 'EXPORT_GENERATED',
      resource: 'Export',
      metadata: {
        format,
        storiesCount: stories.length,
        filename,
        duration: Date.now() - startTime,
      },
    },
  });

  const duration = Date.now() - startTime;
  jobLogger.info(
    { format, storiesCount: stories.length, duration, filename },
    'Export completed'
  );

  return {
    workspaceId,
    format,
    storyIds: stories.map((s) => s.id),
    outputPath: exportPath,
    recordsCount: stories.length,
    duration,
  };
}

function generateJsonExport(stories: Awaited<ReturnType<typeof prisma.story.findMany>>, workspaceName: string): string {
  const data = {
    exportedAt: new Date().toISOString(),
    workspace: workspaceName,
    stories: stories.map((story) => ({
      id: story.id,
      title: story.title,
      status: story.editorialStatus,
      createdAt: story.createdAt.toISOString(),
      items: story.items.map((si) => ({
        id: si.item.id,
        title: si.item.title,
        url: si.item.canonicalUrl,
        author: si.item.author,
        publishedAt: si.item.publishedAt?.toISOString(),
        source: si.item.source.name,
        importanceScore: si.item.importanceScore,
      })),
    })),
  };

  return JSON.stringify(data, null, 2);
}

function generateCsvExport(stories: Awaited<ReturnType<typeof prisma.story.findMany>>): string {
  const headers = ['story_id', 'story_title', 'story_status', 'item_id', 'item_title', 'item_url', 'item_author', 'published_at', 'source', 'score'];
  const rows: string[] = [headers.join(',')];

  for (const story of stories) {
    for (const si of story.items) {
      const row = [
        story.id,
        escapeCsv(story.title),
        story.editorialStatus,
        si.item.id,
        escapeCsv(si.item.title),
        si.item.canonicalUrl || '',
        escapeCsv(si.item.author || ''),
        si.item.publishedAt?.toISOString() || '',
        escapeCsv(si.item.source.name),
        si.item.importanceScore.toString(),
      ];
      rows.push(row.join(','));
    }
  }

  return rows.join('\n');
}

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function generateRssExport(
  stories: Awaited<ReturnType<typeof prisma.story.findMany>>,
  workspaceName: string,
  premium: boolean
): string {
  const itemsXml = stories
    .map((story) => {
      const itemElements = story.items.map((si) => {
        const pubDate = si.item.publishedAt?.toUTCString() || '';
        const description = premium
          ? si.item.extractedText?.slice(0, 1000) || ''
          : si.item.excerpt || '';

        return `
    <item>
      <title><![CDATA[${si.item.title}]]></title>
      <link>${si.item.canonicalUrl || ''}</link>
      <guid isPermaLink="false">${si.item.id}</guid>
      <pubDate>${pubDate}</pubDate>
      <author><![CDATA[${si.item.author || ''}]]></author>
      <description><![CDATA[${description}]]></description>
      <source url="${si.item.source.websiteUrl || ''}"><![CDATA[${si.item.source.name}]]></source>
    </item>`;
      });

      return `  <channel>
    <title><![CDATA[${story.title}]]></title>
    <link></link>
    <description><![CDATA[]]></description>
    <language>fr</language>
    ${itemElements.join('\n')}
  </channel>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title><![CDATA[${workspaceName} - Veille]]></title>
    <link></link>
    <description><![CDATA[Flux RSS généré par Veille Platform]]></description>
    <language>fr</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${premium ? '<atom:link href="" rel="self" type="application/rss+xml"/>' : ''}
    ${itemsXml}
  </channel>
</rss>`;
}
