import type { ExportOptions, ExportResult, ItemExport, StoryExport, RSSChannel, RSSItem } from './types';

function escapeXml(text: string | undefined): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function generateRSSItem(item: ItemExport, options: ExportOptions = {}): RSSItem {
  const {
    includeSummary = true,
    includeTags = true,
    includeAudience = false,
  } = options;

  let description = '';

  if (includeSummary) {
    const parts: string[] = [];

    if (item.summaryPublic) {
      parts.push(`<p>${escapeXml(item.summaryPublic)}</p>`);
    }

    if (item.summaryShort) {
      parts.push(`<p><strong>En bref:</strong> ${escapeXml(item.summaryShort)}</p>`);
    }

    if (item.whyItMatters) {
      parts.push(`<p><strong>Pourquoi c'est important:</strong> ${escapeXml(item.whyItMatters)}</p>`);
    }

    if (item.whatToDo) {
      parts.push(`<p><strong>Ce qu'il faut faire:</strong> ${escapeXml(item.whatToDo)}</p>`);
    }

    if (parts.length > 0) {
      description += `<div class="summary">${parts.join('')}</div>`;
    }
  }

  if (includeTags && item.tags.length > 0) {
    description += `<p><strong>Tags:</strong> ${item.tags.map((t) => `<a href="/?tag=${encodeURIComponent(t)}">${escapeXml(t)}</a>`).join(', ')}</p>`;
  }

  if (includeAudience && item.audience.length > 0) {
    description += `<p><strong>Audience:</strong> ${item.audience.map((a) => escapeXml(a)).join(', ')}</p>`;
  }

  description += `<p><a href="${escapeXml(item.url)}">Lire l'article sur ${escapeXml(item.source)}</a></p>`;

  return {
    title: item.title,
    link: item.url,
    description,
    author: item.source,
    category: item.categories[0] || item.tags[0],
    pubDate: new Date(item.publishedAt).toUTCString(),
    guid: item.id,
  };
}

function generateRSSChannel(
  title: string,
  link: string,
  description: string,
  items: RSSItem[],
  options: {
    language?: string;
    copyright?: string;
    managingEditor?: string;
    pubDate?: string;
    categories?: string[];
  } = {}
): RSSChannel {
  const now = new Date().toUTCString();

  return {
    title,
    link,
    description,
    language: options.language || 'fr',
    copyright: options.copyright,
    managingEditor: options.managingEditor,
    pubDate: options.pubDate || now,
    lastBuildDate: now,
    categories: (options.categories || []).map((name) => ({ name })),
    items,
  };
}

function renderRSS(channel: RSSChannel): string {
  const lines: string[] = [];

  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push('<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/">');
  lines.push('  <channel>');

  lines.push(`    <title>${escapeXml(channel.title)}</title>`);
  lines.push(`    <link>${escapeXml(channel.link)}</link>`);
  lines.push(`    <description>${escapeXml(channel.description)}</description>`);
  lines.push(`    <language>${escapeXml(channel.language)}</language>`);

  if (channel.copyright) {
    lines.push(`    <copyright>${escapeXml(channel.copyright)}</copyright>`);
  }

  if (channel.managingEditor) {
    lines.push(`    <managingEditor>${escapeXml(channel.managingEditor)}</managingEditor>`);
  }

  if (channel.webMaster) {
    lines.push(`    <webMaster>${escapeXml(channel.webMaster)}</webMaster>`);
  }

  if (channel.pubDate) {
    lines.push(`    <pubDate>${channel.pubDate}</pubDate>`);
  }

  if (channel.lastBuildDate) {
    lines.push(`    <lastBuildDate>${channel.lastBuildDate}</lastBuildDate>`);
  }

  lines.push(`    <generator>Veille Platform RSS Generator</generator>`);
  lines.push(`    <ttl>60</ttl>`);

  lines.push(`    <atom:link href="${escapeXml(channel.link)}/feed.xml" rel="self" type="application/rss+xml" />`);

  channel.categories.forEach((cat) => {
    lines.push(`    <category${cat.domain ? ` domain="${escapeXml(cat.domain)}"` : ''}>${escapeXml(cat.name)}</category>`);
  });

  channel.items.forEach((item) => {
    lines.push('    <item>');
    lines.push(`      <title>${escapeXml(item.title)}</title>`);
    lines.push(`      <link>${escapeXml(item.link)}</link>`);
    lines.push(`      <guid isPermaLink="false">${escapeXml(item.guid || item.link)}</guid>`);
    lines.push(`      <pubDate>${item.pubDate}</pubDate>`);

    if (item.author) {
      lines.push(`      <dc:creator>${escapeXml(item.author)}</dc:creator>`);
    }

    if (item.category) {
      lines.push(`      <category>${escapeXml(item.category)}</category>`);
    }

    if (item.description) {
      lines.push(`      <description><![CDATA[${item.description}]]></description>`);
      lines.push(`      <content:encoded><![CDATA[${item.description}]]></content:encoded>`);
    }

    if (item.enclosure) {
      lines.push(`      <enclosure url="${escapeXml(item.enclosure.url)}" type="${escapeXml(item.enclosure.type)}" length="${item.enclosure.length}" />`);
    }

    lines.push('    </item>');
  });

  lines.push('  </channel>');
  lines.push('</rss>');

  return lines.join('\n');
}

export function exportItemsToRSS(
  items: ItemExport[],
  channelInfo: {
    title: string;
    link: string;
    description: string;
  },
  options: ExportOptions = {}
): ExportResult {
  const { maxItems = 50, includeTags = true, includeAudience = false } = options;

  const processedItems = items.slice(0, maxItems);
  const rssItems = processedItems.map((item) => generateRSSItem(item, { includeTags, includeAudience }));

  const channel = generateRSSChannel(
    channelInfo.title,
    channelInfo.link,
    channelInfo.description,
    rssItems,
    {
      language: 'fr',
      pubDate: items.length > 0 ? new Date(items[0].publishedAt).toUTCString() : undefined,
    }
  );

  const content = renderRSS(channel);
  const filename = `feed-${new Date().toISOString().split('T')[0]}.rss`;

  return {
    format: 'rss',
    content,
    filename,
    mimeType: 'application/rss+xml',
    itemCount: processedItems.length,
    generatedAt: new Date().toISOString(),
  };
}

export function exportStoryToRSS(
  story: StoryExport,
  channelInfo: {
    title: string;
    link: string;
    description: string;
  },
  options: ExportOptions = {}
): ExportResult {
  const { includeTags = true, includeAudience = false } = options;

  const rssItems = story.items.map((item) => generateRSSItem(item, { includeTags, includeAudience }));

  const channel = generateRSSChannel(
    `${channelInfo.title} - ${story.title}`,
    `${channelInfo.link}/stories/${story.id}`,
    story.description || story.summary || channelInfo.description,
    rssItems,
    {
      language: 'fr',
      pubDate: story.publishedAt ? new Date(story.publishedAt).toUTCString() : undefined,
      categories: story.tags,
    }
  );

  const content = renderRSS(channel);
  const filename = `story-${story.id}.rss`;

  return {
    format: 'rss',
    content,
    filename,
    mimeType: 'application/rss+xml',
    itemCount: story.items.length,
    generatedAt: new Date().toISOString(),
  };
}

export function exportSourceToRSS(
  sourceId: string,
  sourceName: string,
  items: ItemExport[],
  options: ExportOptions = {}
): ExportResult {
  return exportItemsToRSS(
    items,
    {
      title: `${sourceName} - Veille`,
      link: `https://veille.example.com/sources/${sourceId}`,
      description: `Flux RSS de ${sourceName}`,
    },
    options
  );
}

export function exportAudienceToRSS(
  audience: string,
  items: ItemExport[],
  options: ExportOptions = {}
): ExportResult {
  const filteredItems = items.filter((item) => item.audience.includes(audience));

  return exportItemsToRSS(
    filteredItems,
    {
      title: `Veille - ${audience}`,
      link: `https://veille.example.com/audiences/${encodeURIComponent(audience)}`,
      description: `Articles destinés à ${audience}`,
    },
    options
  );
}

export function generateOPML(
  sources: Array<{
    id: string;
    name: string;
    url: string;
    feedUrl?: string;
    category?: string;
  }>
): ExportResult {
  const now = new Date().toISOString();

  const outlines = sources.map((source) => {
    const attrs: string[] = [
      `type="rss"`,
      `text="${escapeXml(source.name)}"`,
      `title="${escapeXml(source.name)}"`,
      `xmlUrl="${escapeXml(source.feedUrl || source.url)}"`,
      `htmlUrl="${escapeXml(source.url)}"`,
    ];

    if (source.category) {
      attrs.push(`category="${escapeXml(source.category)}"`);
    }

    return `    <outline ${attrs.join(' ')} />`;
  });

  const content = `<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head>
    <title>Veille Platform - Sources RSS</title>
    <dateCreated>${now}</dateCreated>
    <dateModified>${now}</dateModified>
  </head>
  <body>
    <outline text="Sources" title="Sources">
${outlines.join('\n')}
    </outline>
  </body>
</opml>`;

  const filename = `sources-${new Date().toISOString().split('T')[0]}.opml`;

  return {
    format: 'json',
    content,
    filename,
    mimeType: 'application/xml',
    itemCount: sources.length,
    generatedAt: now,
  };
}
