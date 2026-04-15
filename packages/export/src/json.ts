import type { ExportOptions, ExportResult, ItemExport, StoryExport } from './types';

export function exportItemsToJSON(
  items: ItemExport[],
  options: ExportOptions = {}
): ExportResult {
  const {
    includeMetadata = true,
    includeContent = false,
    includeSummary = true,
    includeTags = true,
    includeAudience = true,
    maxItems,
  } = options;

  let processedItems = items;
  if (maxItems && maxItems > 0) {
    processedItems = items.slice(0, maxItems);
  }

  const exportItems = processedItems.map((item) => {
    const exportItem: Record<string, unknown> = {
      id: item.id,
      title: item.title,
      url: item.url,
      source: item.source,
      publishedAt: item.publishedAt,
    };

    if (includeSummary) {
      exportItem.summary = item.summary;
      exportItem.summaryShort = item.summaryShort;
      exportItem.summaryPublic = item.summaryPublic;
      exportItem.whyItMatters = item.whyItMatters;
      exportItem.whatToDo = item.whatToDo;
      exportItem.whoIsConcerned = item.whoIsConcerned;
    }

    if (includeTags) {
      exportItem.tags = item.tags;
      exportItem.categories = item.categories;
    }

    if (includeAudience) {
      exportItem.audience = item.audience;
    }

    if (includeMetadata) {
      exportItem.score = item.score;
      exportItem.status = item.status;
    }

    if (includeContent && item.metadata) {
      exportItem.metadata = item.metadata;
    }

    return exportItem;
  });

  const content = JSON.stringify(
    {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      itemCount: exportItems.length,
      items: exportItems,
    },
    null,
    2
  );

  const filename = `items-export-${new Date().toISOString().split('T')[0]}.json`;

  return {
    format: 'json',
    content,
    filename,
    mimeType: 'application/json',
    itemCount: exportItems.length,
    generatedAt: new Date().toISOString(),
  };
}

export function exportStoriesToJSON(
  stories: StoryExport[],
  options: ExportOptions = {}
): ExportResult {
  const {
    includeMetadata = true,
    includeContent = false,
    includeSummary = true,
    includeTags = true,
    includeAudience = true,
    maxItems,
  } = options;

  let processedStories = stories;
  if (maxItems && maxItems > 0) {
    processedStories = stories.slice(0, maxItems);
  }

  const exportStories = processedStories.map((story) => {
    const exportStory: Record<string, unknown> = {
      id: story.id,
      title: story.title,
      description: story.description,
      status: story.status,
      publishedAt: story.publishedAt,
      items: story.items.map((item) => {
        const exportItem: Record<string, unknown> = {
          id: item.id,
          title: item.title,
          url: item.url,
          source: item.source,
          publishedAt: item.publishedAt,
        };

        if (includeSummary) {
          exportItem.summaryShort = item.summaryShort;
          exportItem.summaryPublic = item.summaryPublic;
        }

        if (includeTags) {
          exportItem.tags = item.tags;
        }

        if (includeAudience) {
          exportItem.audience = item.audience;
        }

        return exportItem;
      }),
      tags: includeTags ? story.tags : undefined,
      audience: includeAudience ? story.audience : undefined,
      summary: includeSummary ? story.summary : undefined,
      createdAt: story.createdAt,
      updatedAt: story.updatedAt,
    };

    if (includeMetadata) {
      exportStory.itemCount = story.items.length;
    }

    if (includeContent && story.items.length > 0) {
      exportStory.items = story.items.map((item) => ({
        ...exportStory.items.find((i: unknown) => (i as { id: string }).id === item.id),
        ...(includeSummary ? { summary: item.summary } : {}),
      }));
    }

    return exportStory;
  });

  const content = JSON.stringify(
    {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      storyCount: exportStories.length,
      totalItems: exportStories.reduce((sum, s) => sum + s.items.length, 0),
      stories: exportStories,
    },
    null,
    2
  );

  const filename = `stories-export-${new Date().toISOString().split('T')[0]}.json`;

  return {
    format: 'json',
    content,
    filename,
    mimeType: 'application/json',
    itemCount: exportStories.length,
    generatedAt: new Date().toISOString(),
  };
}

export function exportAuditLogToJSON(
  logs: Array<{
    id: string;
    action: string;
    userId: string;
    resourceType: string;
    resourceId: string;
    metadata?: Record<string, unknown>;
    timestamp: string;
  }>,
  options: { maxEntries?: number } = {}
): ExportResult {
  const { maxEntries = 1000 } = options;

  const exportLogs = logs.slice(0, maxEntries).map((log) => ({
    id: log.id,
    action: log.action,
    userId: log.userId,
    resourceType: log.resourceType,
    resourceId: log.resourceId,
    metadata: log.metadata,
    timestamp: log.timestamp,
    date: new Date(log.timestamp).toISOString(),
  }));

  const content = JSON.stringify(
    {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      logCount: exportLogs.length,
      logs: exportLogs,
    },
    null,
    2
  );

  const filename = `audit-log-${new Date().toISOString().split('T')[0]}.json`;

  return {
    format: 'json',
    content,
    filename,
    mimeType: 'application/json',
    itemCount: exportLogs.length,
    generatedAt: new Date().toISOString(),
  };
}
