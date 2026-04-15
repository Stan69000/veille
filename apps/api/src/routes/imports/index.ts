import type { FastifyInstance } from 'fastify';
import { prisma } from '@database/client';
import { authenticate } from '../../middleware/auth.js';
import { NotFoundError } from '@core/errors';

export async function importsRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authenticate);

  fastify.post(
    '/rss/fetch',
    {
      schema: {
        description: 'Fetch RSS feed',
        tags: ['Imports'],
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      const { sourceId, url } = request.body as { sourceId: string; url: string };

      const source = await prisma.source.findFirst({
        where: { id: sourceId, workspaceId: request.user!.workspaceId },
      });

      if (!source) {
        throw new NotFoundError('Source', sourceId);
      }

      const ingestion = await prisma.rawIngestion.create({
        data: {
          sourceId,
          content: JSON.stringify({ url }),
          status: 'pending',
        },
      });

      return {
        success: true,
        data: {
          ingestionId: ingestion.id,
          message: 'RSS fetch scheduled',
        },
      };
    }
  );

  fastify.post(
    '/manual',
    {
      schema: {
        description: 'Manual content import',
        tags: ['Imports'],
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      const data = request.body as {
        title: string;
        content: string;
        url?: string;
        author?: string;
        publishedAt?: string;
        category?: string;
        tags?: string[];
      };

      const item = await prisma.item.create({
        data: {
          title: data.title,
          content: data.content,
          url: data.url,
          author: data.author,
          publishedAt: data.publishedAt ? new Date(data.publishedAt) : new Date(),
          categories: data.category ? [data.category] : [],
          tags: data.tags || [],
          status: 'RAW',
          workspaceId: request.user!.workspaceId,
        },
      });

      return reply.status(201).send({ success: true, data: { itemId: item.id } });
    }
  );
}
