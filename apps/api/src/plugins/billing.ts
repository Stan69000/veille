import type { FastifyRequest, FastifyReply } from 'fastify';
import { createBillingService } from '@billing/service';
import type { PlanType } from '@billing/types';

declare module 'fastify' {
  interface FastifyRequest {
    billing: {
      workspaceId: string;
      planType: PlanType;
      service: ReturnType<typeof createBillingService> extends Promise<infer T> ? T : never;
      canCreateItem: () => Promise<boolean>;
      canCreateStory: () => Promise<boolean>;
      canCreateSource: () => Promise<boolean>;
      canInviteMember: () => Promise<boolean>;
      canUseAi: () => Promise<boolean>;
      checkFeature: (feature: string) => Promise<boolean>;
      checkAction: (action: string) => Promise<{ allowed: boolean; reason?: string }>;
    };
  }
}

export async function billingMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const workspaceId = request.headers['x-workspace-id'] as string;
  
  if (!workspaceId) {
    return;
  }

  const billingService = await createBillingService(workspaceId);

  request.billing = {
    workspaceId,
    planType: billingService.planType,
    service: billingService,
    canCreateItem: () => billingService.canCreateItem(),
    canCreateStory: () => billingService.canCreateStory(),
    canCreateSource: () => billingService.canCreateSource(),
    canInviteMember: () => billingService.canInviteTeamMember(),
    canUseAi: () => billingService.canUseAi(),
    checkFeature: (feature: string) => billingService.checkFeatureAccess(feature),
    checkAction: async (action: string) => {
      const allowed = await billingService.canCreateItem();
      return { allowed };
    },
  };
}

export function requireFeature(feature: string) {
  return async function (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    if (!request.billing) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const hasAccess = await request.billing.checkFeature(feature);
    
    if (!hasAccess) {
      return reply.status(403).send({
        error: 'Feature not available',
        feature,
        upgradeRequired: true,
      });
    }
  };
}

export function requireAction(action: string) {
  return async function (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    if (!request.billing) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const { allowed, reason } = await request.billing.checkAction(action);
    
    if (!allowed) {
      return reply.status(402).send({
        error: 'Action not allowed',
        reason,
        action,
        upgradeRequired: true,
      });
    }
  };
}

export function requirePlan(plans: PlanType[]) {
  return async function (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    if (!request.billing) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    if (!plans.includes(request.billing.planType)) {
      return reply.status(403).send({
        error: 'Plan required',
        requiredPlans: plans,
        currentPlan: request.billing.planType,
        upgradeRequired: true,
      });
    }
  };
}
