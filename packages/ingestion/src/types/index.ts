import { z } from 'zod';

export const sourceTypeSchema = z.enum([
  'RSS',
  'ATOM',
  'NEWSLETTER',
  'EMAIL',
  'SMS',
  'MANUAL',
  'WEBHOOK',
  'API',
]);

export const processingStatusSchema = z.enum([
  'PENDING',
  'PROCESSING',
  'COMPLETED',
  'FAILED',
  'QUARANTINED',
]);

export const parsedItemSchema = z.object({
  title: z.string(),
  url: z.string().url().nullable(),
  publishedAt: z.string().datetime().nullable(),
  author: z.string().nullable(),
  content: z.string(),
  excerpt: z.string().nullable(),
  image: z.string().url().nullable(),
  categories: z.array(z.string()),
  tags: z.array(z.string()),
});

export const rawIngestionSchema = z.object({
  id: z.string().uuid(),
  sourceId: z.string().uuid(),
  channel: z.string(),
  rawPayload: z.string().nullable(),
  rawText: z.string().nullable(),
  rawHtml: z.string().nullable(),
  receivedAt: z.string().datetime(),
  processingStatus: processingStatusSchema,
  contentHash: z.string().nullable(),
  fingerprint: z.string().nullable(),
});

export const fetchOptionsSchema = z.object({
  timeout: z.number().int().positive().optional().default(30000),
  maxRedirects: z.number().int().min(0).max(10).optional().default(5),
  userAgent: z.string().optional(),
  headers: z.record(z.string()).optional(),
});

export const fetchResultSchema = z.object({
  url: z.string().url(),
  statusCode: z.number(),
  headers: z.record(z.string()),
  body: z.string(),
  contentType: z.string().nullable(),
});

export const rssItemSchema = z.object({
  title: z.string(),
  link: z.string().url().nullable(),
  guid: z.string().nullable(),
  pubDate: z.string().nullable(),
  author: z.string().nullable(),
  description: z.string().nullable(),
  content: z.string().nullable(),
  categories: z.array(z.string()).default([]),
  enclosure: z.object({
    url: z.string().url().nullable(),
    type: z.string().nullable(),
    length: z.number().nullable(),
  }).optional(),
});

export const rssFeedSchema = z.object({
  title: z.string(),
  link: z.string().url().nullable(),
  description: z.string().nullable(),
  language: z.string().nullable(),
  lastBuildDate: z.string().datetime().nullable(),
  items: z.array(rssItemSchema),
});

export type ParsedItem = z.infer<typeof parsedItemSchema>;
export type RawIngestion = z.infer<typeof rawIngestionSchema>;
export type FetchOptions = z.infer<typeof fetchOptionsSchema>;
export type FetchResult = z.infer<typeof fetchResultSchema>;
export type RssItem = z.infer<typeof rssItemSchema>;
export type RssFeed = z.infer<typeof rssFeedSchema>;
