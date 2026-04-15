import { createHash } from 'crypto';

export interface FingerprintOptions {
  url?: string;
  title?: string;
  author?: string;
  publishedAt?: Date | string;
  content?: string;
}

export function generateFingerprint(data: FingerprintOptions): string {
  const parts: string[] = [];

  if (data.url) {
    const normalizedUrl = normalizeUrl(data.url);
    if (normalizedUrl) parts.push(normalizedUrl);
  }

  if (data.title) {
    parts.push(normalizeText(data.title));
  }

  if (data.author) {
    parts.push(normalizeText(data.author));
  }

  if (data.publishedAt) {
    const date = typeof data.publishedAt === 'string'
      ? new Date(data.publishedAt)
      : data.publishedAt;
    if (!isNaN(date.getTime())) {
      parts.push(date.toISOString().slice(0, 10));
    }
  }

  const combined = parts.join('|') || 'anonymous';

  return createHash('sha256')
    .update(combined)
    .digest('hex')
    .slice(0, 32);
}

export function generateUrlFingerprint(url: string): string {
  const normalized = normalizeUrl(url);
  if (!normalized) return '';

  return createHash('sha256')
    .update(normalized)
    .digest('hex')
    .slice(0, 32);
}

export function generateTitleFingerprint(title: string): string {
  const normalized = normalizeText(title);

  return createHash('sha256')
    .update(normalized)
    .digest('hex')
    .slice(0, 32);
}

function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.hash = '';
    parsed.search = parsed.search.split('&').sort().join('&');
    return parsed.toString().toLowerCase().trim();
  } catch {
    return url.toLowerCase().trim();
  }
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .slice(0, 500);
}

export function extractKeywords(title: string, content?: string): string[] {
  const text = `${title} ${content || ''}`.toLowerCase();
  const words = text
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 3);

  const stopWords = new Set([
    'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can',
    'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has',
    'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see',
    'les', 'des', 'une', 'est', 'que', 'qui', 'dans', 'pour',
    'avec', 'sur', 'this', 'that', 'with', 'from', 'they', 'will',
  ]);

  const counts = new Map<string, number>();
  for (const word of words) {
    if (!stopWords.has(word)) {
      counts.set(word, (counts.get(word) || 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
}
