import { api, type ApiEnvelope, type PaginatedResponse } from './api';

export interface Item {
  id: string;
  title: string;
  source: string;
  publishedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
  importanceScore: number;
  canonicalUrl?: string;
  author?: string;
  excerpt?: string;
  category?: string;
  tags: string[];
}

export interface Story {
  id: string;
  title: string;
  status: 'draft' | 'in_progress' | 'ready' | 'published';
  audience: string;
  itemsCount: number;
  importanceScore: number;
  createdAt: string;
  updatedAt: string;
  summaryPublic?: string;
  whyItMatters?: string;
  whatToDo?: string;
  whoIsConcerned?: string;
}

export interface Source {
  id: string;
  name: string;
  url: string;
  type: 'RSS' | 'EMAIL' | 'SMS' | 'MANUAL' | 'WEB';
  status: 'ACTIVE' | 'DISABLED' | 'ERROR' | 'PENDING';
  itemsCount: number;
  lastFetchedAt?: string;
  errorCount: number;
  fetchFrequency: 'MANUAL' | 'EVERY_15M' | 'HOURLY' | 'EVERY_6H' | 'DAILY' | 'CUSTOM';
}

export interface WorkspaceStats {
  itemsThisMonth: number;
  itemsLimit: number;
  storiesActive: number;
  sourcesActive: number;
  sourcesError: number;
  publishedThisMonth: number;
  pendingItems: number;
}

export interface WorkspaceInfo {
  id: string;
  name: string;
  planType: string;
  subscriptionStatus: string;
  stats: WorkspaceStats;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface ApiItemsData {
  items: Item[];
  pagination: PaginationMeta;
}

interface ApiStoriesData {
  stories: Story[];
  pagination: PaginationMeta;
}

interface ApiSourcesData {
  sources: Source[];
  pagination: PaginationMeta;
}

function toPaginatedResponse<T>(
  list: T[],
  pagination: PaginationMeta
): PaginatedResponse<T> {
  return {
    data: list,
    total: pagination.total,
    page: pagination.page,
    pageSize: pagination.limit,
    totalPages: pagination.totalPages,
  };
}

export async function getItems(params?: {
  page?: number;
  pageSize?: number;
  status?: string;
  search?: string;
}): Promise<PaginatedResponse<Item>> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.pageSize) searchParams.set('limit', String(params.pageSize));
  if (params?.status) searchParams.set('status', params.status);
  if (params?.search) searchParams.set('search', params.search);

  const payload = await api.get<ApiEnvelope<ApiItemsData>>(
    `/api/items?${searchParams.toString()}`
  );
  return toPaginatedResponse(payload.data.items, payload.data.pagination);
}

export async function getItem(id: string): Promise<Item> {
  const payload = await api.get<ApiEnvelope<Item>>(`/api/items/${id}`);
  return payload.data;
}

export async function approveItem(id: string): Promise<Item> {
  const payload = await api.post<ApiEnvelope<Item>>(`/api/items/${id}/approve`);
  return payload.data;
}

export async function rejectItem(id: string): Promise<Item> {
  const payload = await api.post<ApiEnvelope<Item>>(`/api/items/${id}/reject`);
  return payload.data;
}

export async function deleteItem(id: string): Promise<void> {
  await api.delete<void>(`/api/items/${id}`);
}

export async function getStories(params?: {
  page?: number;
  pageSize?: number;
  status?: string;
}): Promise<PaginatedResponse<Story>> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.pageSize) searchParams.set('limit', String(params.pageSize));
  if (params?.status) searchParams.set('status', params.status);

  const payload = await api.get<ApiEnvelope<ApiStoriesData>>(
    `/api/stories?${searchParams.toString()}`
  );
  return toPaginatedResponse(payload.data.stories, payload.data.pagination);
}

export async function getStory(id: string): Promise<Story> {
  const payload = await api.get<ApiEnvelope<Story>>(`/api/stories/${id}`);
  return payload.data;
}

export async function publishStory(id: string): Promise<Story> {
  const payload = await api.post<ApiEnvelope<Story>>(`/api/stories/${id}/publish`);
  return payload.data;
}

export async function getSources(): Promise<Source[]> {
  const payload = await api.get<ApiEnvelope<ApiSourcesData>>('/api/sources');
  return payload.data.sources;
}

export async function createSource(data: {
  name: string;
  url: string;
  type: string;
  fetchFrequency: string;
}): Promise<Source> {
  const payload = await api.post<ApiEnvelope<Source>>('/api/sources', {
    name: data.name,
    url: data.url,
    type: data.type,
    frequency: data.fetchFrequency,
  });
  return payload.data;
}

export async function updateSource(id: string, data: Partial<Source>): Promise<Source> {
  const payload = await api.patch<ApiEnvelope<Source>>(`/api/sources/${id}`, data);
  return payload.data;
}

export async function deleteSource(id: string): Promise<void> {
  await api.delete<void>(`/api/sources/${id}`);
}

export async function syncSource(id: string): Promise<void> {
  await api.post(`/api/sources/${id}/test`);
}

export async function getWorkspaceInfo(): Promise<WorkspaceInfo> {
  const payload = await api.get<
    ApiEnvelope<{
      id: string;
      email: string;
      name: string;
      role: string;
      workspace: { id: string; name: string; plan: string };
    }>
  >('/api/auth/me');

  return {
    id: payload.data.workspace.id,
    name: payload.data.workspace.name,
    planType: payload.data.workspace.plan,
    subscriptionStatus: 'ACTIVE',
    stats: {
      itemsThisMonth: 0,
      itemsLimit: 0,
      storiesActive: 0,
      sourcesActive: 0,
      sourcesError: 0,
      publishedThisMonth: 0,
      pendingItems: 0,
    },
  };
}

export async function getDashboardStats(): Promise<WorkspaceStats> {
  const [items, stories, sources] = await Promise.all([
    api.get<ApiEnvelope<ApiItemsData>>('/api/items?page=1&limit=1'),
    api.get<ApiEnvelope<ApiStoriesData>>('/api/stories?page=1&limit=1'),
    api.get<ApiEnvelope<ApiSourcesData>>('/api/sources?page=1&limit=1'),
  ]);

  const sourceList = sources.data.sources;
  return {
    itemsThisMonth: items.data.pagination.total,
    itemsLimit: 0,
    storiesActive: stories.data.pagination.total,
    sourcesActive: sourceList.filter((s) => s.status === 'ACTIVE').length,
    sourcesError: sourceList.filter((s) => s.status === 'ERROR').length,
    publishedThisMonth: 0,
    pendingItems: 0,
  };
}
