export function calculateSimilarity(a: string, b: string): number {
  if (!a || !b) return 0;
  if (a === b) return 1;

  const aLower = a.toLowerCase();
  const bLower = b.toLowerCase();

  const distance = levenshteinDistance(aLower, bLower);
  const maxLength = Math.max(aLower.length, bLower.length);

  return maxLength === 0 ? 1 : 1 - distance / maxLength;
}

export function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

export function calculateJaccardSimilarity(a: string[], b: string[]): number {
  if (!a.length && !b.length) return 0;

  const setA = new Set(a.map((w) => w.toLowerCase()));
  const setB = new Set(b.map((w) => w.toLowerCase()));

  const intersection = new Set([...setA].filter((x) => setB.has(x)));
  const union = new Set([...setA, ...setB]);

  return union.size === 0 ? 0 : intersection.size / union.size;
}

export function extractWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 3);
}

export function areSimilarByTitle(a: string, b: string, threshold = 0.75): boolean {
  return calculateSimilarity(a, b) >= threshold;
}

export function areSimilarByContent(a: string, b: string, threshold = 0.6): boolean {
  const wordsA = extractWords(a);
  const wordsB = extractWords(b);
  return calculateJaccardSimilarity(wordsA, wordsB) >= threshold;
}

export interface SimilarityResult {
  score: number;
  titleSimilarity: number;
  contentSimilarity: number;
  urlSimilarity: number;
}

export function calculateFullSimilarity(
  a: { title: string; content?: string; url?: string },
  b: { title: string; content?: string; url?: string }
): SimilarityResult {
  const titleSimilarity = calculateSimilarity(a.title, b.title);
  const contentSimilarity = a.content && b.content
    ? calculateJaccardSimilarity(extractWords(a.content), extractWords(b.content))
    : 0;
  const urlSimilarity = a.url && b.url
    ? calculateSimilarity(normalizeUrl(a.url), normalizeUrl(b.url))
    : 0;

  const score = titleSimilarity * 0.6 + contentSimilarity * 0.3 + urlSimilarity * 0.1;

  return {
    score,
    titleSimilarity,
    contentSimilarity,
    urlSimilarity,
  };
}

function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.hash = '';
    parsed.search = '';
    return parsed.toString().toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}
