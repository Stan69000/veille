import { api, type PaginatedResponse } from './api';

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
  type: 'RSS' | 'ATOM' | 'NEWSLETTER' | 'EMAIL';
  status: 'active' | 'paused' | 'error';
  itemsCount: number;
  lastFetchedAt?: string;
  errorCount: number;
  fetchFrequency: 'REAL_TIME' | 'HOURLY' | 'DAILY' | 'WEEKLY';
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

export async function getItems(params?: {
  page?: number;
  pageSize?: number;
  status?: string;
  search?: string;
}): Promise<PaginatedResponse<Item>> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));
  if (params?.status) searchParams.set('status', params.status);
  if (params?.search) searchParams.set('search', params.search);

  return api.get<PaginatedResponse<Item>>(`/items?${searchParams.toString()}`);
}

export async function getItem(id: string): Promise<Item> {
  return api.get<Item>(`/items/${id}`);
}

export async function approveItem(id: string): Promise<Item> {
  return api.post<Item>(`/items/${id}/approve`);
}

export async function rejectItem(id: string): Promise<Item> {
  return api.post<Item>(`/items/${id}/reject`);
}

export async function deleteItem(id: string): Promise<void> {
  return api.delete<void>(`/items/${id}`);
}

export async function getStories(params?: {
  page?: number;
  pageSize?: number;
  status?: string;
}): Promise<PaginatedResponse<Story>> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));
  if (params?.status) searchParams.set('status', params.status);

  return api.get<PaginatedResponse<Story>>(`/stories?${searchParams.toString()}`);
}

export async function getStory(id: string): Promise<Story> {
  return api.get<Story>(`/stories/${id}`);
}

export async function publishStory(id: string): Promise<Story> {
  return api.post<Story>(`/stories/${id}/publish`);
}

export async function getSources(): Promise<Source[]> {
  return api.get<Source[]>('/sources');
}

export async function createSource(data: {
  name: string;
  url: string;
  type: string;
  fetchFrequency: string;
}): Promise<Source> {
  return api.post<Source>('/sources', data);
}

export async function updateSource(id: string, data: Partial<Source>): Promise<Source> {
  return api.patch<Source>(`/sources/${id}`, data);
}

export async function deleteSource(id: string): Promise<void> {
  return api.delete<void>(`/sources/${id}`);
}

export async function syncSource(id: string): Promise<void> {
  return api.post<void>(`/sources/${id}/sync`);
}

export async function getWorkspaceInfo(): Promise<WorkspaceInfo> {
  return api.get<WorkspaceInfo>('/workspace/info');
}

export async function getDashboardStats(): Promise<WorkspaceStats> {
  return api.get<WorkspaceStats>('/workspace/stats');
}
