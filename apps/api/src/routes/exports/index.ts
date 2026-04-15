import type { FastifyInstance } from 'fastify';
import { prisma } from '@database/client';
import { authenticate } from '../../middleware/auth.js';
import { NotFoundError } from '@core/errors';
import { normalizePagination } from '@core/utils';

export async function exportsRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authenticate);

  fastify.get(
    '/targets',
    {
      schema: {
        description: 'List publication targets',
        tags: ['Exports'],
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      const targets = await prisma.publicationTarget.findMany({
        where: { source: { workspaceId: request.user!.workspaceId } },
        orderBy: { name: 'asc' },
      });

      return { success: true, data: targets };
    }
  );

  fastify.post(
    '/targets',
    {
      schema: {
        description: 'Create publication target',
        tags: ['Exports'],
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      const data = request.body as {
        name: string;
        type: string;
        config?: Record<string, unknown>;
        sourceId?: string;
      };

      if (!data.sourceId) {
        return reply.status(400).send({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'sourceId is required' },
        });
      }

      const target = await prisma.publicationTarget.create({
        data: {
          name: data.name,
          type: data.type,
          config: data.config || {},
          sourceId: data.sourceId,
        },
      });

      return reply.status(201).send({ success: true, data: target });
    }
  );

  fastify.get(
    '/build',
    {
      schema: {
        description: 'Build export',
        tags: ['Exports'],
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      const { targetId } = request.query as { targetId?: string };

      const stories = await prisma.story.findMany({
        where: {
          workspaceId: request.user!.workspaceId,
          isPublished: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      return {
        success: true,
        data: {
          storyCount: stories.length,
          stories: stories.map((s) => ({ id: s.id, title: s.title, slug: s.slug })),
        },
      };
    }
  );
}
