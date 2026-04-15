import type { SubscriptionStatus, BillingInterval, PlanType } from '../types/index.js';

export interface Subscription {
  id: string;
  workspaceId: string;
  planType: PlanType;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  trialEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  billingInterval: BillingInterval;
  stripeSubscriptionId: string | null;
  stripeCustomerId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSubscriptionParams {
  workspaceId: string;
  planType: PlanType;
  billingInterval: BillingInterval;
  stripeCustomerId?: string;
  trialEnd?: Date;
}

export interface UpdateSubscriptionParams {
  planType?: PlanType;
  billingInterval?: BillingInterval;
}

export interface SubscriptionWithPlan extends Subscription {
  plan: {
    type: PlanType;
    name: string;
    limits: Record<string, number | boolean>;
  };
}

export function isSubscriptionActive(subscription: Subscription): boolean {
  if (subscription.status === 'CANCELED') {
    return subscription.currentPeriodEnd > new Date();
  }
  return subscription.status === 'ACTIVE' || subscription.status === 'TRIALING';
}

export function isInTrial(subscription: Subscription): boolean {
  if (!subscription.trialEnd) return false;
  return subscription.trialEnd > new Date() && subscription.status === 'TRIALING';
}

export function getDaysUntilRenewal(subscription: Subscription): number {
  const now = new Date();
  const end = new Date(subscription.currentPeriodEnd);
  const diff = end.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function isPaymentPastDue(subscription: Subscription): boolean {
  return subscription.status === 'PAST_DUE';
}

export function canUpgrade(workspacePlan: PlanType, targetPlan: PlanType): boolean {
  const order: PlanType[] = ['FREE', 'STARTER', 'PRO', 'ENTERPRISE'];
  return order.indexOf(targetPlan) > order.indexOf(workspacePlan);
}

export function canDowngrade(workspacePlan: PlanType, targetPlan: PlanType): boolean {
  const order: PlanType[] = ['FREE', 'STARTER', 'PRO', 'ENTERPRISE'];
  return order.indexOf(targetPlan) < order.indexOf(workspacePlan);
}

export function getNextBillingDate(subscription: Subscription): Date {
  if (subscription.cancelAtPeriodEnd) {
    return subscription.currentPeriodEnd;
  }
  return subscription.billingInterval === 'MONTHLY'
    ? new Date(new Date(subscription.currentPeriodEnd).setMonth(
        new Date(subscription.currentPeriodEnd).getMonth() + 1
      ))
    : new Date(new Date(subscription.currentPeriodEnd).setFullYear(
        new Date(subscription.currentPeriodEnd).getFullYear() + 1
      ));
}
