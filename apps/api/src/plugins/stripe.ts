import type { FastifyInstance } from 'fastify';
import { prisma } from '@database/client';
import { PLANS, getPlan } from '@billing/plans';
import type { PlanType, BillingInterval } from '@billing/types';
import { logger } from '../utils/logger.js';

export interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: {
      id: string;
      status?: string;
      items?: { data: Array<{ price: { id: string } }> };
      customer?: string;
      subscription?: string;
      customer_email?: string;
    };
  };
}

export function createStripeWebhookHandler(fastify: FastifyInstance) {
  return async function handleStripeWebhook(
    payload: StripeWebhookEvent,
    signature: string
  ): Promise<void> {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error('Stripe webhook secret not configured');
    }

    switch (payload.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(payload);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(payload);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(payload);
        break;
      case 'invoice.payment_failed':
        await handlePaymentFailed(payload);
        break;
      case 'invoice.paid':
        await handleInvoicePaid(payload);
        break;
      default:
        logger.debug({ eventType: payload.type }, 'Unhandled Stripe webhook event');
    }
  };
}

async function handleSubscriptionCreated(event: StripeWebhookEvent) {
  const { customer, subscription, items } = event.data.object;
  
  if (!customer || !subscription) return;

  const planType = mapPriceToPlan(items?.data[0]?.price?.id);

  await prisma.workspace.updateMany({
    where: { stripeCustomerId: customer },
    data: {
      planType,
      subscriptionStatus: 'ACTIVE',
      stripeSubscriptionId: subscription,
      updatedAt: new Date(),
    },
  });

  await prisma.auditLog.create({
    data: {
      workspaceId: (await prisma.workspace.findFirst({ where: { stripeCustomerId: customer } }))?.id || '',
      userId: 'SYSTEM',
      action: 'SUBSCRIPTION_CREATED',
      resource: 'Subscription',
      metadata: { planType, customer },
    },
  });

  logger.info({ customer, planType }, 'Subscription created');
}

async function handleSubscriptionUpdated(event: StripeWebhookEvent) {
  const { customer, subscription, items, status } = event.data.object;
  
  if (!customer) return;

  const workspace = await prisma.workspace.findFirst({
    where: { stripeCustomerId: customer },
  });

  if (!workspace) return;

  let newStatus: 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'TRIALING' | 'PAUSED' = 'ACTIVE';
  let planType = workspace.planType as PlanType;

  if (status === 'active') {
    newStatus = 'ACTIVE';
  } else if (status === 'past_due') {
    newStatus = 'PAST_DUE';
  } else if (status === 'canceled') {
    newStatus = 'CANCELED';
  } else if (status === 'trialing') {
    newStatus = 'TRIALING';
  }

  if (items?.data[0]?.price?.id) {
    planType = mapPriceToPlan(items.data[0].price.id);
  }

  await prisma.workspace.update({
    where: { id: workspace.id },
    data: {
      planType,
      subscriptionStatus: newStatus,
      stripeSubscriptionId: subscription || workspace.stripeSubscriptionId,
      updatedAt: new Date(),
    },
  });

  logger.info({ customer, newStatus, planType }, 'Subscription updated');
}

async function handleSubscriptionDeleted(event: StripeWebhookEvent) {
  const { customer } = event.data.object;
  
  if (!customer) return;

  await prisma.workspace.updateMany({
    where: { stripeCustomerId: customer },
    data: {
      planType: 'FREE',
      subscriptionStatus: 'CANCELED',
      updatedAt: new Date(),
    },
  });

  logger.info({ customer }, 'Subscription deleted');
}

async function handlePaymentFailed(event: StripeWebhookEvent) {
  const { customer } = event.data.object;
  
  if (!customer) return;

  const workspace = await prisma.workspace.findFirst({
    where: { stripeCustomerId: customer },
  });

  if (!workspace) return;

  await prisma.workspace.update({
    where: { id: workspace.id },
    data: {
      subscriptionStatus: 'PAST_DUE',
    },
  });

  await prisma.auditLog.create({
    data: {
      workspaceId: workspace.id,
      userId: 'SYSTEM',
      action: 'PAYMENT_FAILED',
      resource: 'Subscription',
      metadata: { customer },
    },
  });

  logger.warn({ customer }, 'Payment failed');
}

async function handleInvoicePaid(event: StripeWebhookEvent) {
  const { customer } = event.data.object;
  
  if (!customer) return;

  await prisma.workspace.updateMany({
    where: { stripeCustomerId: customer },
    data: {
      subscriptionStatus: 'ACTIVE',
    },
  });

  logger.info({ customer }, 'Invoice paid');
}

function mapPriceToPlan(priceId: string | undefined): PlanType {
  if (!priceId) return 'FREE';

  for (const [planType, plan] of Object.entries(PLANS)) {
    if (plan.stripePriceId?.monthly === priceId || plan.stripePriceId?.yearly === priceId) {
      return planType as PlanType;
    }
  }

  return 'FREE';
}

export async function createCheckoutSession(
  workspaceId: string,
  planType: PlanType,
  interval: BillingInterval
): Promise<{ sessionId: string; url: string }> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
  });

  if (!workspace) {
    throw new Error('Workspace not found');
  }

  const plan = getPlan(planType);
  const priceId = interval === 'MONTHLY' 
    ? plan.stripePriceId?.monthly 
    : plan.stripePriceId?.yearly;

  if (!priceId) {
    throw new Error('Plan not available for billing');
  }

  const stripeUrl = process.env.STRIPE_CHECKOUT_URL || 'https://checkout.stripe.com';
  
  const sessionId = `cs_${Date.now()}_${workspaceId}`;

  return {
    sessionId,
    url: `${stripeUrl}?price=${priceId}&customer=${workspace.stripeCustomerId || ''}&metadata[workspaceId]=${workspaceId}`,
  };
}

export async function createCustomerPortalSession(
  workspaceId: string
): Promise<{ url: string }> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
  });

  if (!workspace?.stripeCustomerId) {
    throw new Error('No billing account found');
  }

  const portalUrl = process.env.STRIPE_PORTAL_URL || 'https://billing.stripe.com';

  return {
    url: `${portalUrl}?customer=${workspace.stripeCustomerId}`,
  };
}
