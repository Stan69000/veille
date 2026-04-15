import { prisma } from '@database/client';
import { calculateFullSimilarity, type SimilarityResult } from '../similarity/index.js';
import { generateFingerprint, generateTitleFingerprint, extractKeywords } from '../fingerprint/index.js';
import { logger } from '../../utils/logger.js';

export interface ClusteringOptions {
  workspaceId: string;
  itemId: string;
  title: string;
  content?: string;
  url?: string;
  publishedAt?: Date;
  minSimilarity?: number;
}

export interface ClusteringResult {
  itemId: string;
  storyId: string | null;
  action: 'created' | 'joined' | 'standalone';
  similarity?: SimilarityResult;
}

const DEFAULT_MIN_SIMILARITY = 0.65;
const DEFAULT_TIME_WINDOW_HOURS = 72;

export async function clusterItem(options: ClusteringOptions): Promise<ClusteringResult> {
  const {
    workspaceId,
    itemId,
    title,
    content,
    url,
    publishedAt,
    minSimilarity = DEFAULT_MIN_SIMILARITY,
  } = options;

  const itemKeywords = extractKeywords(title, content);

  const candidateStories = await findCandidateStories(
    workspaceId,
    publishedAt,
    itemKeywords
  );

  if (candidateStories.length === 0) {
    const story = await prisma.story.create({
      data: {
        workspaceId,
        title: truncateTitle(title),
        editorialStatus: 'DRAFT',
      },
    });

    await prisma.storyItem.create({
      data: {
        storyId: story.id,
        itemId,
        relevanceScore: 1,
        isPrimary: true,
      },
    });

    await prisma.item.update({
      where: { id: itemId },
      data: { status: 'CLUSTERED' },
    });

    return {
      itemId,
      storyId: story.id,
      action: 'created',
    };
  }

  let bestMatch: { storyId: string; similarity: SimilarityResult } | null = null;
  let bestScore = 0;

  for (const story of candidateStories) {
    const existingItems = await prisma.storyItem.findMany({
      where: { storyId: story.id },
      include: { item: true },
      orderBy: { relevanceScore: 'desc' },
      take: 5,
    });

    for (const si of existingItems) {
      const similarity = calculateFullSimilarity(
        { title, content, url },
        {
          title: si.item.title,
          content: si.item.extractedText || undefined,
          url: si.item.canonicalUrl || undefined,
        }
      );

      if (similarity.score > bestScore) {
        bestScore = similarity.score;
        bestMatch = { storyId: story.id, similarity };
      }
    }
  }

  if (bestMatch && bestMatch.similarity.score >= minSimilarity) {
    const existingCount = await prisma.storyItem.count({
      where: { storyId: bestMatch.storyId },
    });

    await prisma.storyItem.create({
      data: {
        storyId: bestMatch.storyId,
        itemId,
        relevanceScore: bestMatch.similarity.score,
        isPrimary: existingCount === 0,
      },
    });

    await prisma.story.update({
      where: { id: bestMatch.storyId },
      data: { updatedAt: new Date() },
    });

    await prisma.item.update({
      where: { id: itemId },
      data: { status: 'CLUSTERED' },
    });

    return {
      itemId,
      storyId: bestMatch.storyId,
      action: 'joined',
      similarity: bestMatch.similarity,
    };
  }

  const story = await prisma.story.create({
    data: {
      workspaceId,
      title: truncateTitle(title),
      editorialStatus: 'DRAFT',
    },
  });

  await prisma.storyItem.create({
    data: {
      storyId: story.id,
      itemId,
      relevanceScore: 1,
      isPrimary: true,
    },
  });

  await prisma.item.update({
    where: { id: itemId },
    data: { status: 'CLUSTERED' },
  });

  return {
    itemId,
    storyId: story.id,
    action: 'created',
  };
}

async function findCandidateStories(
  workspaceId: string,
  itemDate: Date | undefined,
  itemKeywords: string[],
  limit = 20
): Promise<Array<{ id: string; keywords: string[] }>> {
  const timeWindow = new Date(
    Date.now() - DEFAULT_TIME_WINDOW_HOURS * 60 * 60 * 1000
  );

  const recentStories = await prisma.story.findMany({
    where: {
      workspaceId,
      createdAt: { gte: timeWindow },
    },
    select: {
      id: true,
      items: {
        where: { item: { publishedAt: { gte: timeWindow } } },
        include: { item: true },
        orderBy: { relevanceScore: 'desc' },
        take: 3,
      },
    },
    orderBy: { updatedAt: 'desc' },
    take: limit,
  });

  return recentStories
    .map((story) => ({
      id: story.id,
      keywords: story.items.flatMap((si) =>
        extractKeywords(si.item.title, si.item.extractedText || undefined)
      ),
    }))
    .filter((story) => {
      if (itemKeywords.length === 0) return false;
      const overlap = itemKeywords.filter((k) => story.keywords.includes(k)).length;
      return overlap >= 2;
    });
}

function truncateTitle(title: string, maxLength = 100): string {
  if (title.length <= maxLength) return title;
  return title.slice(0, maxLength - 3) + '...';
}

export async function reclusterStory(storyId: string): Promise<void> {
  const storyItems = await prisma.storyItem.findMany({
    where: { storyId },
    include: { item: true },
    orderBy: { relevanceScore: 'desc' },
  });

  if (storyItems.length < 2) return;

  const primary = storyItems[0];
  const updates: Promise<unknown>[] = [];

  for (let i = 1; i < storyItems.length; i++) {
    const similarity = calculateFullSimilarity(
      {
        title: primary.item.title,
        content: primary.item.extractedText || undefined,
        url: primary.item.canonicalUrl || undefined,
      },
      {
        title: storyItems[i].item.title,
        content: storyItems[i].item.extractedText || undefined,
        url: storyItems[i].item.canonicalUrl || undefined,
      }
    );

    updates.push(
      prisma.storyItem.update({
        where: { id: storyItems[i].id },
        data: { relevanceScore: similarity.score },
      })
    );
  }

  await Promise.all(updates);
}

export async function splitStory(storyId: string, itemIds: string[]): Promise<void> {
  const items = await prisma.item.findMany({
    where: { id: { in: itemIds } },
  });

  if (items.length === 0) return;

  const newStory = await prisma.story.create({
    data: {
      workspaceId: items[0].workspaceId,
      title: truncateTitle(items[0].title),
      editorialStatus: 'DRAFT',
    },
  });

  const updates = items.map((item) =>
    prisma.storyItem.updateMany({
      where: { storyId, itemId: item.id },
      data: { storyId: newStory.id, isPrimary: false, relevanceScore: 0.5 },
    })
  );

  await Promise.all(updates);
}
