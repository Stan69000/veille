import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '@database/client';
import { authenticate } from '../../middleware/auth.js';
import { NotFoundError } from '@core/errors';
import { normalizePagination } from '@core/utils';

const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  status: z.string().optional(),
  type: z.string().optional(),
  search: z.string().optional(),
});

export async function sourcesRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authenticate);

  fastify.get(
    '/',
    {
      schema: {
        description: 'List all sources',
        tags: ['Sources'],
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      const query = listQuerySchema.parse(request.query);
      const { page, limit, offset } = normalizePagination(query);

      const where: Record<string, unknown> = {
        workspaceId: request.user!.workspaceId,
      };

      if (query.status) where.status = query.status;
      if (query.type) where.type = query.type;

      const [sources, total] = await Promise.all([
        prisma.source.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: offset,
          take: limit,
        }),
        prisma.source.count({ where }),
      ]);

      return {
        success: true,
        data: {
          sources,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            hasNext: page * limit < total,
            hasPrev: page > 1,
          },
        },
      };
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        description: 'Create a new source',
        tags: ['Sources'],
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      const data = request.body as {
        name: string;
        type: string;
        url?: string;
        frequency?: string;
      };

      const source = await prisma.source.create({
        data: {
          name: data.name,
          type: data.type as any,
          url: data.url,
          frequency: data.frequency as any || 'MANUAL',
          workspaceId: request.user!.workspaceId,
          status: 'PENDING',
        },
      });

      return reply.status(201).send({ success: true, data: source });
    }
  );

  fastify.get(
    '/:id',
    {
      schema: {
        description: 'Get source by ID',
        tags: ['Sources'],
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      const source = await prisma.source.findFirst({
        where: { id, workspaceId: request.user!.workspaceId },
      });

      if (!source) {
        throw new NotFoundError('Source', id);
      }

      return { success: true, data: source };
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        description: 'Update source',
        tags: ['Sources'],
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const data = request.body as Record<string, unknown>;

      const existing = await prisma.source.findFirst({
        where: { id, workspaceId: request.user!.workspaceId },
      });

      if (!existing) {
        throw new NotFoundError('Source', id);
      }

      const source = await prisma.source.update({
        where: { id },
        data,
      });

      return { success: true, data: source };
    }
  );

  fastify.post(
    '/:id/enable',
    {
      schema: {
        description: 'Enable source',
        tags: ['Sources'],
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      const source = await prisma.source.findFirst({
        where: { id, workspaceId: request.user!.workspaceId },
      });

      if (!source) {
        throw new NotFoundError('Source', id);
      }

      const updated = await prisma.source.update({
        where: { id },
        data: { status: 'ACTIVE' },
      });

      return { success: true, data: updated };
    }
  );

  fastify.post(
    '/:id/disable',
    {
      schema: {
        description: 'Disable source',
        tags: ['Sources'],
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      const source = await prisma.source.findFirst({
        where: { id, workspaceId: request.user!.workspaceId },
      });

      if (!source) {
        throw new NotFoundError('Source', id);
      }

      const updated = await prisma.source.update({
        where: { id },
        data: { status: 'DISABLED' },
      });

      return { success: true, data: updated };
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        description: 'Delete source',
        tags: ['Sources'],
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      const source = await prisma.source.findFirst({
        where: { id, workspaceId: request.user!.workspaceId },
      });

      if (!source) {
        throw new NotFoundError('Source', id);
      }

      await prisma.source.delete({ where: { id } });

      return { success: true };
    }
  );
}
