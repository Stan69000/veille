import { load } from 'cheerio';
import type { ParsedItem } from '../types/index.js';

export interface HtmlMetadata {
  title: string | null;
  description: string | null;
  image: string | null;
  author: string | null;
  publishedAt: string | null;
  siteName: string | null;
  language: string | null;
}

export function extractMetadata(html: string, baseUrl?: string): HtmlMetadata {
  const $ = load(html);

  const getMetaContent = (property: string): string | null => {
    const el = $(`meta[property="${property}"], meta[name="${property}"]`);
    return el.attr('content') || null;
  };

  const getMetaName = (name: string): string | null => {
    return $(`meta[name="${name}"]`).attr('content') || null;
  };

  const title =
    getMetaContent('og:title') ||
    getMetaContent('twitter:title') ||
    $('title').text().trim() ||
    $('h1').first().text().trim() ||
    null;

  const description =
    getMetaContent('og:description') ||
    getMetaContent('twitter:description') ||
    getMetaName('description') ||
    null;

  const image =
    getMetaContent('og:image') ||
    getMetaContent('twitter:image') ||
    getMetaContent('twitter:image:src') ||
    null;

  const author =
    getMetaName('author') ||
    getMetaContent('article:author') ||
    $('[rel="author"]').attr('href') ||
    null;

  const publishedAt =
    getMetaContent('article:published_time') ||
    getMetaName('date') ||
    null;

  const siteName = getMetaContent('og:site_name');

  const language =
    getMetaContent('og:locale') ||
    $('html').attr('lang') ||
    null;

  return { title, description, image, author, publishedAt, siteName, language };
}

export function extractMainContent(html: string): string {
  const $ = load(html);

  $('script, style, nav, header, footer, aside, .sidebar, .navigation, .comments').remove();

  const article =
    $('article').first().html() ||
    $('[role="main"]').first().html() ||
    $('main').first().html() ||
    $.html();

  return extractText(article || '');
}

export function extractText(html: string): string {
  const $ = load(html);
  return $('body').text()
    .replace(/\s+/g, ' ')
    .trim();
}

export function extractLinks(html: string, baseUrl?: string): string[] {
  const $ = load(html);
  const links: string[] = [];

  $('a[href]').each((_, el) => {
    const href = $(el).attr('href');
    if (href && href.startsWith('http')) {
      links.push(href);
    }
  });

  return [...new Set(links)];
}

export function parseHtmlItem(html: string, url: string): ParsedItem {
  const metadata = extractMetadata(html, url);

  return {
    title: metadata.title || extractTitleFromUrl(url),
    url,
    publishedAt: metadata.publishedAt,
    author: metadata.author,
    content: extractMainContent(html),
    excerpt: metadata.description,
    image: metadata.image,
    categories: [],
    tags: [],
  };
}

function extractTitleFromUrl(url: string): string {
  try {
    const path = new URL(url).pathname;
    const segments = path.split('/').filter(Boolean);
    const last = segments[segments.length - 1] || '';
    return last
      .replace(/[-_]/g, ' ')
      .replace(/\.[^.]+$/, '')
      .replace(/\b\w/g, (c) => c.toUpperCase()) || 'Untitled';
  } catch {
    return 'Untitled';
  }
}
