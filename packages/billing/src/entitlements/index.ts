import type { PlanType, Entitlement, UsageMetrics } from '../types/index.js';
import { getPlanLimits } from '../plans/index.js';

export interface EntitlementsContext {
  workspaceId: string;
  planType: PlanType;
  overrides?: Record<string, { limit: number | null; enabled: boolean }>;
  usage?: UsageMetrics;
}

export interface EntitlementCheck {
  allowed: boolean;
  limit: number | null;
  used: number;
  remaining: number | null;
  exceeded: boolean;
}

export interface BulkEntitlementCheck {
  results: Record<string, EntitlementCheck>;
  allAllowed: boolean;
  exceededFeatures: string[];
}

export function checkEntitlement(
  feature: string,
  context: EntitlementsContext
): EntitlementCheck {
  const limits = getPlanLimits(context.planType);
  const override = context.overrides?.[feature];

  let limit: number | null;
  if (override?.limit !== undefined) {
    limit = override.limit;
  } else if (feature in limits) {
    const value = limits[feature as keyof typeof limits];
    limit = typeof value === 'number' ? value : null;
  } else {
    limit = null;
  }

  const used = context.usage?.[feature as keyof UsageMetrics] ?? 0;

  if (limit === null) {
    return {
      allowed: true,
      limit: null,
      used,
      remaining: null,
      exceeded: false,
    };
  }

  if (limit === -1) {
    return {
      allowed: true,
      limit: -1,
      used,
      remaining: null,
      exceeded: false,
    };
  }

  const remaining = limit - used;
  const exceeded = used >= limit;

  return {
    allowed: !exceeded,
    limit,
    used,
    remaining: Math.max(0, remaining),
    exceeded,
  };
}

export function checkBulkEntitlements(
  features: string[],
  context: EntitlementsContext
): BulkEntitlementCheck {
  const results: Record<string, EntitlementCheck> = {};
  const exceededFeatures: string[] = [];

  for (const feature of features) {
    const check = checkEntitlement(feature, context);
    results[feature] = check;
    if (check.exceeded) {
      exceededFeatures.push(feature);
    }
  }

  return {
    results,
    allAllowed: exceededFeatures.length === 0,
    exceededFeatures,
  };
}

export function getEntitlements(context: EntitlementsContext): Entitlement[] {
  const limits = getPlanLimits(context.planType);
  const entitlements: Entitlement[] = [];

  const featureMap: Record<string, keyof typeof limits> = {
    itemsPerMonth: 'itemsPerMonth',
    storiesPerMonth: 'storiesPerMonth',
    sources: 'sources',
    teamMembers: 'teamMembers',
    exportsPerMonth: 'exportsPerMonth',
    aiRequestsPerDay: 'aiRequestsPerDay',
    storageGb: 'storageGb',
  };

  for (const [feature, limitKey] of Object.entries(featureMap)) {
    const limit = limits[limitKey] as number;
    const usage = context.usage?.[feature as keyof UsageMetrics] ?? 0;

    entitlements.push({
      feature,
      limit: limit === -1 ? null : limit,
      used: usage,
      resetAt: getNextResetDate(),
    });
  }

  return entitlements;
}

function getNextResetDate(): Date {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return nextMonth;
}

export function formatEntitlementMessage(check: EntitlementCheck, feature: string): string {
  if (check.limit === null) {
    return `${feature}: accès illimité`;
  }

  if (check.limit === -1) {
    return `${feature}: illimité sur votre plan`;
  }

  if (check.exceeded) {
    return `${feature}: limite atteinte (${check.used}/${check.limit})`;
  }

  if (check.remaining === 0) {
    return `${feature}: dernière utilisation`;
  }

  return `${feature}: ${check.remaining} restant (${check.used}/${check.limit})`;
}

export function canPerformAction(
  action: string,
  context: EntitlementsContext
): { allowed: boolean; reason?: string } {
  const limits = getPlanLimits(context.planType);

  const actionMappings: Record<string, { feature: string; type: 'count' | 'boolean' }> = {
    'items.create': { feature: 'itemsPerMonth', type: 'count' },
    'stories.create': { feature: 'storiesPerMonth', type: 'count' },
    'sources.create': { feature: 'sources', type: 'count' },
    'team.invite': { feature: 'teamMembers', type: 'count' },
    'exports.create': { feature: 'exportsPerMonth', type: 'count' },
    'ai.request': { feature: 'aiRequestsPerDay', type: 'count' },
    'storage.upload': { feature: 'storageGb', type: 'count' },
    'rss.add': { feature: 'rssFeeds', type: 'count' },
    'email.add': { feature: 'emailSources', type: 'count' },
    'api.call': { feature: 'apiCallsPerDay', type: 'count' },
    'custom.domain': { feature: 'customDomains', type: 'boolean' },
    'sso.configure': { feature: 'sso', type: 'boolean' },
    'filters.advanced': { feature: 'advancedFilters', type: 'boolean' },
    'support.priority': { feature: 'prioritySupport', type: 'boolean' },
    'branding.custom': { feature: 'customBranding', type: 'boolean' },
    'analytics.advanced': { feature: 'analytics', type: 'boolean' },
    'webhooks.create': { feature: 'webhookEvents', type: 'boolean' },
  };

  const mapping = actionMappings[action];
  if (!mapping) {
    return { allowed: true };
  }

  if (mapping.type === 'boolean') {
    const enabled = limits[mapping.feature as keyof typeof limits] as boolean;
    return enabled
      ? { allowed: true }
      : { allowed: false, reason: `Fonctionnalité ${mapping.feature} non incluse dans votre plan` };
  }

  const check = checkEntitlement(mapping.feature, context);
  return check.allowed
    ? { allowed: true }
    : { allowed: false, reason: `Limite ${mapping.feature} atteinte` };
}
