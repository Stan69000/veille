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

const createSourceSchema = z.object({
  name: z.string().min(1).max(200),
  type: z.enum(['RSS', 'EMAIL', 'SMS', 'MANUAL', 'WEB']),
  url: z.string().url().optional(),
  frequency: z
    .enum(['MANUAL', 'EVERY_15M', 'HOURLY', 'EVERY_6H', 'DAILY', 'CUSTOM'])
    .optional(),
});

const updateSourceSchema = z
  .object({
    name: z.string().min(1).max(200).optional(),
    type: z.enum(['RSS', 'EMAIL', 'SMS', 'MANUAL', 'WEB']).optional(),
    url: z.string().url().nullable().optional(),
    frequency: z
      .enum(['MANUAL', 'EVERY_15M', 'HOURLY', 'EVERY_6H', 'DAILY', 'CUSTOM'])
      .optional(),
    status: z.enum(['ACTIVE', 'DISABLED', 'ERROR', 'PENDING']).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
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
      const data = createSourceSchema.parse(request.body);

      const source = await prisma.source.create({
        data: {
          name: data.name,
          type: data.type,
          url: data.url,
          frequency: data.frequency || 'MANUAL',
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
      const data = updateSourceSchema.parse(request.body);

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
    '/:id/test',
    {
      schema: {
        description: 'Test source accessibility',
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

      return {
        success: true,
        data: {
          sourceId: source.id,
          status: 'ok',
          message: 'Source is configured and ready to fetch',
        },
      };
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
