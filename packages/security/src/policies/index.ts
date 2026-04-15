import type { PlanType } from '@core/types';

export interface RateLimitConfig {
  windowMs: number;
  max: number;
  message?: string;
}

export interface QuotaConfig {
  type: 'count' | 'size';
  limit: number;
  window?: 'day' | 'month' | 'unlimited';
}

export interface PolicyContext {
  workspaceId: string;
  plan: PlanType;
  userId: string;
}

const PLAN_LIMITS: Record<PlanType, {
  sources: number;
  items: number;
  stories: number;
  users: number;
  exports: number;
  storage: number;
  aiRequests: number;
  apiCalls: number;
}> = {
  FREE: {
    sources: 5,
    items: 1000,
    stories: 100,
    users: 1,
    exports: 10,
    storage: 100 * 1024 * 1024,
    aiRequests: 50,
    apiCalls: 1000,
  },
  PREMIUM: {
    sources: 25,
    items: 10000,
    stories: 1000,
    users: 3,
    exports: 100,
    storage: 1024 * 1024 * 1024,
    aiRequests: 500,
    apiCalls: 10000,
  },
  ASSOCIATION: {
    sources: 15,
    items: 5000,
    stories: 500,
    users: 2,
    exports: 50,
    storage: 512 * 1024 * 1024,
    aiRequests: 200,
    apiCalls: 5000,
  },
  PRO: {
    sources: 50,
    items: 50000,
    stories: 5000,
    users: 5,
    exports: 500,
    storage: 5 * 1024 * 1024 * 1024,
    aiRequests: 2000,
    apiCalls: 50000,
  },
  TEAM: {
    sources: 100,
    items: 100000,
    stories: 10000,
    users: 20,
    exports: 1000,
    storage: 20 * 1024 * 1024 * 1024,
    aiRequests: 5000,
    apiCalls: 100000,
  },
  ENTERPRISE: {
    sources: -1,
    items: -1,
    stories: -1,
    users: -1,
    exports: -1,
    storage: -1,
    aiRequests: -1,
    apiCalls: -1,
  },
};

export function getPlanLimits(plan: PlanType) {
  return PLAN_LIMITS[plan];
}

export function checkLimit(
  plan: PlanType,
  resource: keyof typeof PLAN_LIMITS[FREE],
  current: number
): { allowed: boolean; remaining: number } {
  const limit = PLAN_LIMITS[plan][resource];
  
  if (limit === -1) {
    return { allowed: true, remaining: -1 };
  }
  
  return {
    allowed: current < limit,
    remaining: Math.max(0, limit - current),
  };
}

export function getRateLimit(plan: PlanType): RateLimitConfig {
  const limits: Record<PlanType, RateLimitConfig> = {
    FREE: { windowMs: 60000, max: 60 },
    PREMIUM: { windowMs: 60000, max: 300 },
    ASSOCIATION: { windowMs: 60000, max: 200 },
    PRO: { windowMs: 60000, max: 1000 },
    TEAM: { windowMs: 60000, max: 2000 },
    ENTERPRISE: { windowMs: 60000, max: 10000 },
  };
  
  return limits[plan];
}

export function isFeatureEnabled(plan: PlanType, feature: string): boolean {
  const features: Record<PlanType, string[]> = {
    FREE: ['basic_search', 'rss_feeds', 'manual_import', 'basic_export'],
    PREMIUM: ['basic_search', 'rss_feeds', 'manual_import', 'basic_export', 'ai_summaries', 'advanced_filters', 'priority_support'],
    ASSOCIATION: ['basic_search', 'rss_feeds', 'manual_import', 'basic_export', 'ai_summaries', 'association_templates'],
    PRO: ['basic_search', 'rss_feeds', 'manual_import', 'advanced_export', 'ai_summaries', 'ai_classification', 'advanced_filters', 'api_access', 'priority_support'],
    TEAM: ['basic_search', 'rss_feeds', 'manual_import', 'advanced_export', 'ai_summaries', 'ai_classification', 'advanced_filters', 'api_access', 'team_collaboration', 'priority_support'],
    ENTERPRISE: ['*'],
  };
  
  const planFeatures = features[plan];
  return planFeatures.includes('*') || planFeatures.includes(feature);
}

export function getFeatureList(plan: PlanType): string[] {
  const allFeatures = [
    'basic_search',
    'rss_feeds',
    'manual_import',
    'basic_export',
    'advanced_export',
    'ai_summaries',
    'ai_classification',
    'advanced_filters',
    'api_access',
    'association_templates',
    'team_collaboration',
    'priority_support',
    'custom_branding',
    'sso',
    'audit_logs',
  ];
  
  if (plan === 'ENTERPRISE') return allFeatures;
  
  return allFeatures.filter((f) => isFeatureEnabled(plan, f));
}
