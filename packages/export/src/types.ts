export interface ExportOptions {
  includeMetadata?: boolean;
  includeContent?: boolean;
  includeSummary?: boolean;
  includeTags?: boolean;
  includeAudience?: boolean;
  maxItems?: number;
}

export interface ItemExport {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  summary?: string;
  summaryShort?: string;
  summaryPublic?: string;
  whyItMatters?: string;
  whatToDo?: string;
  whoIsConcerned?: string;
  tags: string[];
  audience: string[];
  categories: string[];
  score?: number;
  status: string;
  metadata?: Record<string, unknown>;
}

export interface StoryExport {
  id: string;
  title: string;
  description: string;
  status: string;
  publishedAt?: string;
  items: ItemExport[];
  tags: string[];
  audience: string[];
  summary?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExportResult {
  format: 'json' | 'mdx' | 'rss';
  content: string;
  filename: string;
  mimeType: string;
  itemCount: number;
  generatedAt: string;
}

export interface RSSChannel {
  title: string;
  link: string;
  description: string;
  language?: string;
  copyright?: string;
  managingEditor?: string;
  webMaster?: string;
  pubDate?: string;
  lastBuildDate?: string;
  categories: RSSCategory[];
  items: RSSItem[];
}

export interface RSSItem {
  title: string;
  link: string;
  description: string;
  author?: string;
  category?: string;
  pubDate: string;
  guid?: string;
  enclosure?: {
    url: string;
    type: string;
    length: number;
  };
}

export interface RSSCategory {
  name: string;
  domain?: string;
}

export interface MDXExportOptions extends ExportOptions {
  includeToc?: boolean;
  includeFrontmatter?: boolean;
  includeComments?: boolean;
  theme?: 'light' | 'dark';
}
