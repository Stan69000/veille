import type { FastifyInstance } from 'fastify';
import { prisma } from '@database/client';
import { authenticate } from '../../middleware/auth.js';

export async function settingsRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authenticate);

  fastify.get(
    '/workspace',
    {
      schema: {
        description: 'Get workspace settings',
        tags: ['Settings'],
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      const workspace = await prisma.workspace.findUnique({
        where: { id: request.user!.workspaceId },
        include: {
          _count: {
            select: {
              users: true,
              sources: true,
              items: true,
              stories: true,
            },
          },
        },
      });

      if (!workspace) {
        return reply.status(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Workspace not found' },
        });
      }

      return { success: true, data: workspace };
    }
  );

  fastify.patch(
    '/workspace',
    {
      schema: {
        description: 'Update workspace settings',
        tags: ['Settings'],
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      const data = request.body as Record<string, unknown>;

      const workspace = await prisma.workspace.update({
        where: { id: request.user!.workspaceId },
        data,
      });

      return { success: true, data: workspace };
    }
  );

  fastify.get(
    '/stats',
    {
      schema: {
        description: 'Get workspace statistics',
        tags: ['Settings'],
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      const workspaceId = request.user!.workspaceId;

      const [
        sourcesCount,
        itemsCount,
        storiesCount,
        publishedCount,
        usersCount,
      ] = await Promise.all([
        prisma.source.count({ where: { workspaceId } }),
        prisma.item.count({ where: { workspaceId } }),
        prisma.story.count({ where: { workspaceId } }),
        prisma.story.count({ where: { workspaceId, isPublished: true } }),
        prisma.user.count({ where: { workspaceId } }),
      ]);

      return {
        success: true,
        data: {
          sources: sourcesCount,
          items: itemsCount,
          stories: storiesCount,
          published: publishedCount,
          users: usersCount,
        },
      };
    }
  );

  fastify.get(
    '/limits',
    {
      schema: {
        description: 'Get workspace limits based on plan',
        tags: ['Settings'],
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      const workspace = await prisma.workspace.findUnique({
        where: { id: request.user!.workspaceId },
      });

      if (!workspace) {
        return reply.status(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Workspace not found' },
        });
      }

      const defaultLimits = {
        sources: 5,
        items: 1000,
        stories: 100,
        users: 1,
        aiRequests: 50,
      };

      return {
        success: true,
        data: {
          plan: workspace.planType,
          limits: defaultLimits,
        },
      };
    }
  );
}
