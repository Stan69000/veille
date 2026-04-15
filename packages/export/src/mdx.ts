import type { ExportOptions, ExportResult, ItemExport, StoryExport, MDXExportOptions } from './types';

function escapeMdx(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}');
}

function generateFrontmatter(data: Record<string, unknown>): string {
  const lines = Object.entries(data)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => {
      if (typeof value === 'string') {
        return `${key}: "${value.replace(/"/g, '\\"')}"`;
      }
      if (Array.isArray(value)) {
        return `${key}: [${value.map((v) => `"${v}"`).join(', ')}]`;
      }
      return `${key}: ${JSON.stringify(value)}`;
    });

  return `---\n${lines.join('\n')}\n---`;
}

function generateTableOfContents(items: ItemExport[]): string {
  const toc = items.map((item, index) => `${index + 1}. [${item.title}](#${item.id})`).join('\n');
  return `## Table des matières\n\n${toc}\n`;
}

function generateItemSection(item: ItemExport, options: ExportOptions): string {
  const sections: string[] = [];

  sections.push(`### ${escapeMdx(item.title)}`);

  if (item.summaryPublic || item.summaryShort) {
    sections.push(`\n${item.summaryPublic || item.summaryShort}\n`);
  }

  if (item.whyItMatters) {
    sections.push(`#### Pourquoi c'est important\n\n${item.whyItMatters}\n`);
  }

  if (item.whatToDo) {
    sections.push(`#### Ce qu'il faut faire\n\n${item.whatToDo}\n`);
  }

  if (item.whoIsConcerned) {
    sections.push(`#### Qui est concerné\n\n${item.whoIsConcerned}\n`);
  }

  const meta: string[] = [];
  meta.push(`**Source:** [${item.source}](${item.url})`);
  meta.push(`**Date:** ${new Date(item.publishedAt).toLocaleDateString('fr-FR', { dateStyle: 'long' })}`);

  if (options.includeTags && item.tags.length > 0) {
    meta.push(`**Tags:** ${item.tags.map((t) => `\`${t}\``).join(', ')}`);
  }

  if (options.includeAudience && item.audience.length > 0) {
    meta.push(`**Audience:** ${item.audience.join(', ')}`);
  }

  if (options.includeMetadata && item.score !== undefined) {
    meta.push(`**Score:** ${(item.score * 100).toFixed(0)}%`);
  }

  sections.push(`\n> ${meta.join(' • ')}\n`);

  return sections.join('\n');
}

export function exportItemToMDX(
  item: ItemExport,
  options: MDXExportOptions = {}
): ExportResult {
  const {
    includeFrontmatter = true,
    includeToc = false,
    includeTags = true,
    includeAudience = true,
    includeSummary = true,
    includeMetadata = true,
    theme = 'light',
  } = options;

  const sections: string[] = [];

  if (includeFrontmatter) {
    const frontmatter: Record<string, unknown> = {
      title: item.title,
      source: item.source,
      url: item.url,
      date: item.publishedAt,
    };

    if (includeTags && item.tags.length > 0) {
      frontmatter.tags = item.tags;
    }

    if (includeAudience && item.audience.length > 0) {
      frontmatter.audience = item.audience;
    }

    if (includeSummary && item.summaryPublic) {
      frontmatter.description = item.summaryPublic;
    }

    if (includeMetadata) {
      frontmatter.score = item.score;
      frontmatter.status = item.status;
    }

    sections.push(generateFrontmatter(frontmatter));
    sections.push('\n');
  }

  if (theme === 'dark') {
    sections.push('{/* Dark mode styles would go here */}\n');
  }

  sections.push(`# ${escapeMdx(item.title)}\n`);

  if (includeSummary) {
    if (item.summaryPublic) {
      sections.push(`\n${item.summaryPublic}\n`);
    }

    if (item.summaryShort) {
      sections.push(`\n**En bref:** ${item.summaryShort}\n`);
    }

    if (item.whyItMatters) {
      sections.push(`\n## Pourquoi c'est important\n\n${item.whyItMatters}\n`);
    }

    if (item.whatToDo) {
      sections.push(`\n## Ce qu'il faut faire\n\n${item.whatToDo}\n`);
    }

    if (item.whoIsConcerned) {
      sections.push(`\n## Qui est concerné\n\n${item.whoIsConcerned}\n`);
    }
  }

  sections.push(`\n---\n`);
  sections.push(`\n**Source:** [${item.source}](${item.url})\n`);
  sections.push(`**Publié le:** ${new Date(item.publishedAt).toLocaleDateString('fr-FR', { dateStyle: 'full' })}\n`);

  if (includeTags && item.tags.length > 0) {
    sections.push(`\n**Tags:** ${item.tags.map((t) => `\`${t}\``).join(', ')}\n`);
  }

  if (includeAudience && item.audience.length > 0) {
    sections.push(`\n**Audience:** ${item.audience.join(', ')}\n`);
  }

  const filename = `${item.id}-${item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50)}.mdx`;

  return {
    format: 'mdx',
    content: sections.join('\n'),
    filename,
    mimeType: 'text/markdown',
    itemCount: 1,
    generatedAt: new Date().toISOString(),
  };
}

export function exportItemsToMDX(
  items: ItemExport[],
  options: MDXExportOptions = {}
): ExportResult {
  const {
    includeFrontmatter = true,
    includeToc = true,
    includeTags = true,
    includeAudience = true,
    includeSummary = true,
    maxItems,
  } = options;

  let processedItems = items;
  if (maxItems && maxItems > 0) {
    processedItems = items.slice(0, maxItems);
  }

  const sections: string[] = [];

  if (includeFrontmatter) {
    const frontmatter: Record<string, unknown> = {
      title: 'Veille éditoriale',
      date: new Date().toISOString(),
      itemCount: processedItems.length,
    };

    const allTags = [...new Set(processedItems.flatMap((i) => i.tags))];
    const allAudiences = [...new Set(processedItems.flatMap((i) => i.audience))];

    if (allTags.length > 0) {
      frontmatter.tags = allTags;
    }

    if (allAudiences.length > 0) {
      frontmatter.audience = allAudiences;
    }

    sections.push(generateFrontmatter(frontmatter));
    sections.push('\n');
  }

  sections.push(`# Veille éditoriale\n`);
  sections.push(`\n*Généré le ${new Date().toLocaleDateString('fr-FR', { dateStyle: 'full' })}*\n`);
  sections.push(`\n*${processedItems.length} articles*\n`);

  if (includeToc) {
    sections.push('\n' + generateTableOfContents(processedItems) + '\n');
  }

  sections.push('\n---\n');

  processedItems.forEach((item, index) => {
    sections.push(`\n${generateItemSection(item, { includeTags, includeAudience, includeSummary })}\n`);
    if (index < processedItems.length - 1) {
      sections.push('\n---\n');
    }
  });

  const filename = `veille-${new Date().toISOString().split('T')[0]}.mdx`;

  return {
    format: 'mdx',
    content: sections.join('\n'),
    filename,
    mimeType: 'text/markdown',
    itemCount: processedItems.length,
    generatedAt: new Date().toISOString(),
  };
}

export function exportStoryToMDX(
  story: StoryExport,
  options: MDXExportOptions = {}
): ExportResult {
  const {
    includeFrontmatter = true,
    includeToc = true,
    includeTags = true,
    includeAudience = true,
    includeSummary = true,
  } = options;

  const sections: string[] = [];

  if (includeFrontmatter) {
    const frontmatter: Record<string, unknown> = {
      title: story.title,
      description: story.description,
      date: story.publishedAt || story.createdAt,
      itemCount: story.items.length,
    };

    if (includeTags && story.tags.length > 0) {
      frontmatter.tags = story.tags;
    }

    if (includeAudience && story.audience.length > 0) {
      frontmatter.audience = story.audience;
    }

    sections.push(generateFrontmatter(frontmatter));
    sections.push('\n');
  }

  sections.push(`# ${escapeMdx(story.title)}\n`);

  if (story.description) {
    sections.push(`\n${story.description}\n`);
  }

  if (includeSummary && story.summary) {
    sections.push(`\n${story.summary}\n`);
  }

  if (includeToc && story.items.length > 0) {
    sections.push('\n' + generateTableOfContents(story.items) + '\n');
  }

  sections.push(`\n---\n`);
  sections.push(`\n## Articles (${story.items.length})\n`);

  story.items.forEach((item) => {
    sections.push(`\n${generateItemSection(item, { includeTags, includeAudience, includeSummary })}\n`);
  });

  sections.push('\n---\n');
  sections.push(`\n*Dernière mise à jour: ${new Date(story.updatedAt).toLocaleDateString('fr-FR', { dateStyle: 'long' })}*\n`);

  const filename = `${story.id}-${story.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50)}.mdx`;

  return {
    format: 'mdx',
    content: sections.join('\n'),
    filename,
    mimeType: 'text/markdown',
    itemCount: story.items.length,
    generatedAt: new Date().toISOString(),
  };
}
