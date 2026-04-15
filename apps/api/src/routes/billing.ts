import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { createBillingService } from '@billing/service';
import { getPlan, PLANS } from '@billing/plans';
import { getEnabledFeatureKeys, getDisabledFeatureKeys } from '@billing/features';
import { getEntitlements, checkBulkEntitlements } from '@billing/entitlements';
import { createCheckoutSession, createCustomerPortalSession } from '../plugins/stripe.js';
import type { PlanType, BillingInterval } from '@billing/types';

export async function billingRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', async (request) => {
    if (!request.billing) {
      throw fastify.httpErrors.unauthorized('Workspace required');
    }
  });

  fastify.get('/info', async (request: FastifyRequest, reply: FastifyReply) => {
    const info = await request.billing.service.getBillingInfo();
    return reply.send(info);
  });

  fastify.get('/plans', async (request: FastifyRequest, reply: FastifyReply) => {
    const plans = Object.entries(PLANS).map(([type, plan]) => ({
      type,
      name: plan.name,
      description: plan.description,
      popular: plan.popular || false,
      limits: plan.limits,
      features: getEnabledFeatureKeys(type as PlanType),
    }));
    return reply.send({ plans });
  });

  fastify.get('/current-plan', async (request: FastifyRequest, reply: FastifyReply) => {
    const plan = getPlan(request.billing.planType);
    return reply.send({
      plan: {
        type: request.billing.planType,
        name: plan.name,
        description: plan.description,
        limits: plan.limits,
      },
    });
  });

  fastify.get('/entitlements', async (request: FastifyRequest, reply: FastifyReply) => {
    const service = await createBillingService(request.billing.workspaceId);
    const info = await service.getBillingInfo();
    
    const entitlements = getEntitlements({
      workspaceId: request.billing.workspaceId,
      planType: request.billing.planType,
      usage: {
        itemsPerMonth: info.usage.itemsThisMonth,
        storiesPerMonth: info.usage.storiesThisMonth,
        sources: info.usage.sourcesCount,
        teamMembers: info.usage.teamMembers,
        exportsPerMonth: info.usage.exportsThisMonth,
        aiRequestsPerDay: info.usage.aiRequestsToday,
        storageGb: info.usage.storageUsedGb,
      },
    });

    return reply.send({ entitlements });
  });

  fastify.get('/features', async (request: FastifyRequest, reply: FastifyReply) => {
    const enabled = getEnabledFeatureKeys(request.billing.planType);
    const disabled = getDisabledFeatureKeys(request.billing.planType);

    return reply.send({
      enabled,
      disabled,
      planType: request.billing.planType,
    });
  });

  fastify.post<{ Body: { planType: PlanType; interval: BillingInterval } }>(
    '/checkout',
    {
      schema: {
        body: {
          type: 'object',
          required: ['planType', 'interval'],
          properties: {
            planType: { type: 'string', enum: ['FREE', 'STARTER', 'PRO', 'ENTERPRISE'] },
            interval: { type: 'string', enum: ['MONTHLY', 'YEARLY'] },
          },
        },
      },
    },
    async (request, reply) => {
      const { planType, interval } = request.body;
      
      try {
        const session = await createCheckoutSession(
          request.billing.workspaceId,
          planType,
          interval
        );
        return reply.send(session);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Checkout failed';
        return reply.status(400).send({ error: message });
      }
    }
  );

  fastify.post('/portal', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const session = await createCustomerPortalSession(request.billing.workspaceId);
      return reply.send(session);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Portal session failed';
      return reply.status(400).send({ error: message });
    }
  });

  fastify.get<{ Querystring: { features?: string } }>(
    '/check',
    {
      schema: {
        querystring: {
          type: 'object',
          properties: {
            features: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      const features = request.query.features?.split(',') || [];
      
      const service = await createBillingService(request.billing.workspaceId);
      const info = await service.getBillingInfo();
      
      const results: Record<string, { allowed: boolean; remaining?: number }> = {};
      
      for (const feature of features) {
        const allowed = await service.checkFeatureAccess(feature.trim());
        results[feature.trim()] = { allowed };
      }

      return reply.send({
        results,
        planType: request.billing.planType,
      });
    }
  );
}
