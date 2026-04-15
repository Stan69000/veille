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
  sourceId: z.string().optional(),
  category: z.string().optional(),
  severity: z.string().optional(),
  search: z.string().optional(),
});

const updateItemSchema = z.object({
  status: z.string().optional(),
  severity: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  summary: z.string().optional(),
  storyId: z.string().optional().nullable(),
});

export async function itemsRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authenticate);

  fastify.get(
    '/',
    {
      schema: {
        description: 'List all items',
        tags: ['Items'],
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
      if (query.sourceId) where.sourceId = query.sourceId;
      if (query.category) where.categories = { has: query.category };
      if (query.severity) where.severity = query.severity;

      const [items, total] = await Promise.all([
        prisma.item.findMany({
          where,
          orderBy: { publishedAt: 'desc' },
          skip: offset,
          take: limit,
        }),
        prisma.item.count({ where }),
      ]);

      return {
        success: true,
        data: {
          items,
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

  fastify.get(
    '/:id',
    {
      schema: {
        description: 'Get item by ID',
        tags: ['Items'],
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      const item = await prisma.item.findFirst({
        where: {
          id,
          workspaceId: request.user!.workspaceId,
        },
      });

      if (!item) {
        throw new NotFoundError('Item', id);
      }

      return { success: true, data: item };
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        description: 'Update item',
        tags: ['Items'],
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const data = updateItemSchema.parse(request.body);

      const existing = await prisma.item.findFirst({
        where: { id, workspaceId: request.user!.workspaceId },
      });

      if (!existing) {
        throw new NotFoundError('Item', id);
      }

      const item = await prisma.item.update({
        where: { id },
        data,
      });

      return { success: true, data: item };
    }
  );

  fastify.post(
    '/:id/approve',
    {
      schema: {
        description: 'Approve item',
        tags: ['Items'],
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      const item = await prisma.item.findFirst({
        where: { id, workspaceId: request.user!.workspaceId },
      });

      if (!item) {
        throw new NotFoundError('Item', id);
      }

      const updated = await prisma.item.update({
        where: { id },
        data: { status: 'APPROVED' },
      });

      return { success: true, data: updated };
    }
  );

  fastify.post(
    '/:id/reject',
    {
      schema: {
        description: 'Reject item',
        tags: ['Items'],
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      const item = await prisma.item.findFirst({
        where: { id, workspaceId: request.user!.workspaceId },
      });

      if (!item) {
        throw new NotFoundError('Item', id);
      }

      const updated = await prisma.item.update({
        where: { id },
        data: { status: 'REJECTED' },
      });

      return { success: true, data: updated };
    }
  );
}
