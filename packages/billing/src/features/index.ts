import type { PlanType, FeatureFlag } from '../types/index.js';

export const FEATURE_FLAGS: Record<string, FeatureFlag> = {
  AI_SUMMARIES: {
    key: 'AI_SUMMARIES',
    enabled: true,
    metadata: { plans: ['STARTER', 'PRO', 'ENTERPRISE'] },
  },
  AI_CLUSTERING: {
    key: 'AI_CLUSTERING',
    enabled: true,
    metadata: { plans: ['PRO', 'ENTERPRISE'] },
  },
  ADVANCED_ANALYTICS: {
    key: 'ADVANCED_ANALYTICS',
    enabled: true,
    metadata: { plans: ['PRO', 'ENTERPRISE'] },
  },
  CUSTOM_BRANDING: {
    key: 'CUSTOM_BRANDING',
    enabled: true,
    metadata: { plans: ['PRO', 'ENTERPRISE'] },
  },
  SSO: {
    key: 'SSO',
    enabled: true,
    metadata: { plans: ['ENTERPRISE'] },
  },
  API_ACCESS: {
    key: 'API_ACCESS',
    enabled: true,
    metadata: { plans: ['STARTER', 'PRO', 'ENTERPRISE'] },
  },
  WEBHOOKS: {
    key: 'WEBHOOKS',
    enabled: true,
    metadata: { plans: ['STARTER', 'PRO', 'ENTERPRISE'] },
  },
  EMAIL_DIGESTS: {
    key: 'EMAIL_DIGESTS',
    enabled: true,
    metadata: { plans: ['FREE', 'STARTER', 'PRO', 'ENTERPRISE'] },
  },
  EXPORT_PDF: {
    key: 'EXPORT_PDF',
    enabled: true,
    metadata: { plans: ['PRO', 'ENTERPRISE'] },
  },
  MULTI_LANGUAGE: {
    key: 'MULTI_LANGUAGE',
    enabled: true,
    metadata: { plans: ['PRO', 'ENTERPRISE'] },
  },
  TEAM_ROLES: {
    key: 'TEAM_ROLES',
    enabled: true,
    metadata: { plans: ['STARTER', 'PRO', 'ENTERPRISE'] },
  },
  AUDIT_LOGS: {
    key: 'AUDIT_LOGS',
    enabled: true,
    metadata: { plans: ['PRO', 'ENTERPRISE'] },
  },
  PRIORITY_SUPPORT: {
    key: 'PRIORITY_SUPPORT',
    enabled: true,
    metadata: { plans: ['PRO', 'ENTERPRISE'] },
  },
  CUSTOM_DOMAINS: {
    key: 'CUSTOM_DOMAINS',
    enabled: true,
    metadata: { plans: ['PRO', 'ENTERPRISE'] },
  },
  AI_PHISHING_DETECTION: {
    key: 'AI_PHISHING_DETECTION',
    enabled: true,
    metadata: { plans: ['FREE', 'STARTER', 'PRO', 'ENTERPRISE'] },
  },
  BULK_IMPORT: {
    key: 'BULK_IMPORT',
    enabled: true,
    metadata: { plans: ['STARTER', 'PRO', 'ENTERPRISE'] },
  },
  SCHEDULED_REPORTS: {
    key: 'SCHEDULED_REPORTS',
    enabled: true,
    metadata: { plans: ['STARTER', 'PRO', 'ENTERPRISE'] },
  },
  RSS_PREMIUM: {
    key: 'RSS_PREMIUM',
    enabled: true,
    metadata: { plans: ['PRO', 'ENTERPRISE'] },
  },
};

export function isFeatureEnabled(
  featureKey: string,
  planType: PlanType
): boolean {
  const flag = FEATURE_FLAGS[featureKey];
  if (!flag) return false;
  if (!flag.enabled) return false;

  const allowedPlans = flag.metadata?.plans as PlanType[] | undefined;
  if (!allowedPlans) return true;

  return allowedPlans.includes(planType);
}

export function getFeatureFlagsForPlan(planType: PlanType): FeatureFlag[] {
  return Object.values(FEATURE_FLAGS).filter((flag) =>
    isFeatureEnabled(flag.key, planType)
  );
}

export function getEnabledFeatureKeys(planType: PlanType): string[] {
  return Object.values(FEATURE_FLAGS)
    .filter((flag) => isFeatureEnabled(flag.key, planType))
    .map((flag) => flag.key);
}

export function getDisabledFeatureKeys(planType: PlanType): string[] {
  return Object.values(FEATURE_FLAGS)
    .filter((flag) => !isFeatureEnabled(flag.key, planType))
    .map((flag) => flag.key);
}

export function canUseFeature(
  featureKey: string,
  planType: PlanType,
  workspaceOverrides?: Record<string, boolean>
): boolean {
  if (workspaceOverrides && workspaceOverrides[featureKey] !== undefined) {
    return workspaceOverrides[featureKey];
  }
  return isFeatureEnabled(featureKey, planType);
}
