import { load } from 'cheerio';
import type { FetchResult, RssFeed, RssItem } from '../types/index.js';
import { parseRssItem, normalizeRssItem, generateFingerprint } from './parser.js';

export interface FetchRssOptions {
  timeout?: number;
  maxRedirects?: number;
  userAgent?: string;
}

export interface FetchRssResult {
  feed: RssFeed;
  items: RssItem[];
  normalizedItems: ReturnType<typeof normalizeRssItem>[];
  fingerprints: string[];
}

export async function fetchRssFeed(url: string, options: FetchRssOptions = {}): Promise<FetchResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeout || 30000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': options.userAgent || 'VeillePlatform/1.0 RSS Fetcher',
        'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*',
      },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const body = await response.text();
    const contentType = response.headers.get('content-type') || '';

    return {
      url,
      statusCode: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      body,
      contentType,
    };
  } catch (error) {
    clearTimeout(timeout);
    throw error;
  }
}

export function parseRssFeed(xml: string): RssFeed {
  const $ = load(xml, { xmlMode: true });

  const isAtom = $('feed').length > 0;
  const isRss = $('rss, channel').length > 0;

  if (isAtom) {
    return parseAtomFeed($);
  }

  if (isRss) {
    return parseRss2Feed($);
  }

  throw new Error('Unknown feed format: not RSS or Atom');
}

function parseRss2Feed($: ReturnType<typeof load>): RssFeed {
  const channel = $('channel');

  const items: RssItem[] = [];
  channel.find('item').each((_, el) => {
    const item: Record<string, unknown> = {};

    $(el).children().each((__, child) => {
      const name = String(child.tagName || '');
      const text = $(child).text();
      const attr = (tag: string) => $(child).attr(tag);

      item[name] = text;
      if (name === 'enclosure') {
        item.enclosure = {
          url: attr('url'),
          type: attr('type'),
          length: parseInt(attr('length') || '0', 10) || null,
        };
      }
    });

    items.push(parseRssItem(item));
  });

  return {
    title: channel.find('title').first().text() || 'Untitled Feed',
    link: channel.find('link').first().text() || null,
    description: channel.find('description').first().text() || null,
    language: channel.find('language').first().text() || null,
    lastBuildDate: channel.find('lastBuildDate, pubDate').first().text() || null,
    items,
  };
}

function parseAtomFeed($: ReturnType<typeof load>): RssFeed {
  const feed = $('feed');

  const items: RssItem[] = [];
  feed.find('entry').each((_, el) => {
    const item: Record<string, unknown> = {};

    $(el).children().each((__, child) => {
      const name = String(child.tagName || '');
      const text = $(child).text();
      const attr = (tag: string) => $(child).attr(tag);

      item[name] = text;
      if (name === 'link') {
        const rel = attr('rel') || 'alternate';
        if (rel === 'alternate' || !item.link) {
          item.link = attr('href');
        }
        if (rel === 'enclosure') {
          item.enclosure = {
            url: attr('href'),
            type: attr('type'),
            length: null,
          };
        }
      }
    });

    items.push(parseRssItem(item));
  });

  return {
    title: feed.find('title').first().text() || 'Untitled Feed',
    link: feed.find('link[rel="alternate"]').attr('href') || feed.find('link').first().attr('href') || null,
    description: feed.find('subtitle').first().text() || null,
    language: feed.find('language').first().text() || feed.attr('xml:lang') || null,
    lastBuildDate: feed.find('updated, published').first().text() || null,
    items,
  };
}

export async function fetchAndParseRss(
  url: string,
  options: FetchRssOptions = {}
): Promise<FetchRssResult> {
  const fetchResult = await fetchRssFeed(url, options);
  const feed = parseRssFeed(fetchResult.body);
  const normalizedItems = feed.items.map((item) => normalizeRssItem(item, url));
  const fingerprints = feed.items.map((item) => generateFingerprint(item, url));

  return {
    feed,
    items: feed.items,
    normalizedItems,
    fingerprints,
  };
}
