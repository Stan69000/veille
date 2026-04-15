export interface EditorialSummary {
  summaryShort: string;
  summaryPublic: string;
  whyItMatters: string;
  whatToDo: string;
  whoIsConcerned: string;
}

export interface EditorialContext {
  title: string;
  content: string;
  excerpt?: string | null;
  author?: string | null;
  sourceName?: string;
  category?: string | null;
  tags?: string[];
}

export type SummaryLength = 'short' | 'medium' | 'long';

export interface GenerateOptions {
  length?: SummaryLength;
  tone?: 'professional' | 'journalistic' | 'accessible';
  maxChars?: Partial<Record<keyof EditorialSummary, number>>;
}

export const DEFAULT_MAX_CHARS: Record<keyof EditorialSummary, number> = {
  summaryShort: 150,
  summaryPublic: 300,
  whyItMatters: 200,
  whatToDo: 250,
  whoIsConcerned: 200,
};
