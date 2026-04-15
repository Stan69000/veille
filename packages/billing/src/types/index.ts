import { z } from 'zod';

export const PlanTypeSchema = z.enum(['FREE', 'STARTER', 'PRO', 'ENTERPRISE']);
export type PlanType = z.infer<typeof PlanTypeSchema>;

export const SubscriptionStatusSchema = z.enum([
  'ACTIVE',
  'PAST_DUE',
  'CANCELED',
  'TRIALING',
  'PAUSED',
]);
export type SubscriptionStatus = z.infer<typeof SubscriptionStatusSchema>;

export const BillingIntervalSchema = z.enum(['MONTHLY', 'YEARLY']);
export type BillingInterval = z.infer<typeof BillingIntervalSchema>;

export const FeatureFlagSchema = z.object({
  key: z.string(),
  enabled: z.boolean(),
  metadata: z.record(z.unknown()).optional(),
});

export type FeatureFlag = z.infer<typeof FeatureFlagSchema>;

export const EntitlementSchema = z.object({
  feature: z.string(),
  limit: z.number().nullable(),
  used: z.number(),
  resetAt: z.string().datetime().nullable(),
});

export type Entitlement = z.infer<typeof EntitlementSchema>;

export const UsageMetricsSchema = z.object({
  itemsPerMonth: z.number(),
  storiesPerMonth: z.number(),
  sources: z.number(),
  teamMembers: z.number(),
  exportsPerMonth: z.number(),
  aiRequestsPerDay: z.number(),
  storageGb: z.number(),
});

export type UsageMetrics = z.infer<typeof UsageMetricsSchema>;
