import { z } from 'zod';
import { createHash } from 'crypto';
import type { RssFeed, RssItem, ParsedItem } from '../types/index.js';

const RSS_ITEM_SELECTORS = [
  'item',
  'entry',
];

const FIELD_MAPPINGS = {
  title: ['title', 'dc:title', 'media:title'],
  link: ['link', 'guid', 'id'],
  pubDate: ['pubDate', 'published', 'updated', 'dc:date', 'dc:date.'],
  author: ['author', 'dc:creator', 'dc:creator.'],
  content: ['content:encoded', 'content', 'description', 'summary'],
  categories: ['category', 'keywords'],
};

export function parseDate(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null;
  try {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date.toISOString();
  } catch {
    return null;
  }
}

export function extractTextContent(html: string | null | undefined): string {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 5000);
}

export function extractExcerpt(content: string, maxLength = 300): string | null {
  const text = extractTextContent(content);
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

export function extractCategories(categories: unknown[]): string[] {
  return categories
    .filter((c) => typeof c === 'string')
    .flatMap((c) => c.split(',').map((s) => s.trim()))
    .filter(Boolean);
}

export function extractImage(item: Record<string, unknown>): string | null {
  const enclosure = item['enclosure'] as Record<string, string> | undefined;
  if (enclosure?.url && enclosure.type?.startsWith('image/')) {
    return enclosure.url;
  }

  const mediaContent = item['media:content'] as Record<string, string> | undefined;
  if (mediaContent?.url) {
    return mediaContent.url;
  }

  const content = (item['content:encoded'] || item['content'] || item['description']) as string | undefined;
  if (content) {
    const match = content.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (match) return match[1];
  }

  return null;
}

export function generateFingerprint(item: RssItem, sourceUrl: string): string {
  const data = [
    item.link || item.guid || '',
    sourceUrl,
    item.title || '',
  ].join('|');

  return createHash('sha256').update(data).digest('hex').slice(0, 32);
}

export function parseRssItem(item: Record<string, unknown>): RssItem {
  const getField = (field: string[]): unknown => {
    for (const f of field) {
      if (item[f] !== undefined && item[f] !== null) {
        return item[f];
      }
    }
    return null;
  };

  const title = String(getField(FIELD_MAPPINGS.title) || '');
  const link = getField(FIELD_MAPPINGS.link);
  const guid = item['guid'] || item['id'] || link || title;
  const pubDate = getField(FIELD_MAPPINGS.pubDate);
  const author = getField(FIELD_MAPPINGS.author);
  const content = getField(FIELD_MAPPINGS.content);
  const description = item['description'] || item['summary'] || '';
  const categories = getField(FIELD_MAPPINGS.categories);
  const enclosure = item['enclosure'] as Record<string, unknown> | undefined;

  return {
    title,
    link: typeof link === 'string' && link.startsWith('http') ? link : null,
    guid: typeof guid === 'string' ? guid : null,
    pubDate: typeof pubDate === 'string' ? pubDate : null,
    author: typeof author === 'string' ? author : null,
    description: typeof description === 'string' ? description : null,
    content: typeof content === 'string' ? content : null,
    categories: Array.isArray(categories) ? extractCategories(categories) : [],
    enclosure: enclosure ? {
      url: (enclosure.url as string) || null,
      type: (enclosure.type as string) || null,
      length: typeof enclosure.length === 'number' ? enclosure.length : null,
    } : undefined,
  };
}

export function normalizeRssItem(item: RssItem, sourceUrl: string): ParsedItem {
  return {
    title: item.title || 'Untitled',
    url: item.link || item.guid || null,
    publishedAt: parseDate(item.pubDate),
    author: item.author || null,
    content: item.content || item.description || '',
    excerpt: extractExcerpt(item.content || item.description || ''),
    image: extractImage(item as unknown as Record<string, unknown>),
    categories: item.categories,
    tags: [],
  };
}
