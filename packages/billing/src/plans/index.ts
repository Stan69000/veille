import type { PlanType, BillingInterval } from '../types/index.js';

export interface PlanLimits {
  itemsPerMonth: number;
  storiesPerMonth: number;
  sources: number;
  teamMembers: number;
  exportsPerMonth: number;
  aiRequestsPerDay: number;
  storageGb: number;
  rssFeeds: number;
  emailSources: number;
  apiCallsPerDay: number;
  customDomains: number;
  sso: boolean;
  advancedFilters: boolean;
  prioritySupport: boolean;
  customBranding: boolean;
  analytics: boolean;
  webhookEvents: number;
}

export interface Plan {
  type: PlanType;
  name: string;
  description: string;
  limits: PlanLimits;
  stripePriceId?: {
    monthly: string;
    yearly: string;
  };
  trialDays: number;
  popular?: boolean;
}

export const PLANS: Record<PlanType, Plan> = {
  FREE: {
    type: 'FREE',
    name: 'Gratuit',
    description: 'Pour découvrir la plateforme',
    limits: {
      itemsPerMonth: 500,
      storiesPerMonth: 50,
      sources: 5,
      teamMembers: 1,
      exportsPerMonth: 10,
      aiRequestsPerDay: 20,
      storageGb: 1,
      rssFeeds: 5,
      emailSources: 0,
      apiCallsPerDay: 100,
      customDomains: 0,
      sso: false,
      advancedFilters: false,
      prioritySupport: false,
      customBranding: false,
      analytics: false,
      webhookEvents: 0,
    },
    trialDays: 0,
  },

  STARTER: {
    type: 'STARTER',
    name: 'Starter',
    description: 'Pour les petites équipes',
    limits: {
      itemsPerMonth: 5000,
      storiesPerMonth: 500,
      sources: 25,
      teamMembers: 5,
      exportsPerMonth: 100,
      aiRequestsPerDay: 100,
      storageGb: 10,
      rssFeeds: 25,
      emailSources: 5,
      apiCallsPerDay: 1000,
      customDomains: 0,
      sso: false,
      advancedFilters: true,
      prioritySupport: false,
      customBranding: false,
      analytics: true,
      webhookEvents: 5,
    },
    stripePriceId: {
      monthly: 'price_starter_monthly',
      yearly: 'price_starter_yearly',
    },
    trialDays: 14,
  },

  PRO: {
    type: 'PRO',
    name: 'Professionnel',
    description: 'Pour les équipes exigeantes',
    popular: true,
    limits: {
      itemsPerMonth: 25000,
      storiesPerMonth: 2500,
      sources: 100,
      teamMembers: 20,
      exportsPerMonth: 500,
      aiRequestsPerDay: 500,
      storageGb: 50,
      rssFeeds: 100,
      emailSources: 25,
      apiCallsPerDay: 5000,
      customDomains: 1,
      sso: false,
      advancedFilters: true,
      prioritySupport: true,
      customBranding: true,
      analytics: true,
      webhookEvents: 25,
    },
    stripePriceId: {
      monthly: 'price_pro_monthly',
      yearly: 'price_pro_yearly',
    },
    trialDays: 14,
  },

  ENTERPRISE: {
    type: 'ENTERPRISE',
    name: 'Entreprise',
    description: 'Pour les grandes organisations',
    limits: {
      itemsPerMonth: -1,
      storiesPerMonth: -1,
      sources: -1,
      teamMembers: -1,
      exportsPerMonth: -1,
      aiRequestsPerDay: 2000,
      storageGb: 500,
      rssFeeds: -1,
      emailSources: -1,
      apiCallsPerDay: -1,
      customDomains: -1,
      sso: true,
      advancedFilters: true,
      prioritySupport: true,
      customBranding: true,
      analytics: true,
      webhookEvents: -1,
    },
    stripePriceId: {
      monthly: 'price_enterprise_monthly',
      yearly: 'price_enterprise_yearly',
    },
    trialDays: 30,
  },
};

export function getPlan(type: PlanType): Plan {
  return PLANS[type];
}

export function getPlanLimits(type: PlanType): PlanLimits {
  return PLANS[type].limits;
}

export function formatPrice(cents: number, interval: BillingInterval): string {
  const amount = cents / 100;
  const period = interval === 'MONTHLY' ? '/mois' : '/an';
  return `${amount.toFixed(2)} €${period}`;
}

export function getYearlyDiscount(interval: BillingInterval): number {
  return interval === 'YEARLY' ? 0.2 : 0;
}
