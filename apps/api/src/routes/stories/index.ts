import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '@database/client';
import { authenticate } from '../../middleware/auth.js';
import { NotFoundError } from '@core/errors';
import { normalizePagination, slugify } from '@core/utils';

const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  search: z.string().optional(),
});

export async function storiesRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authenticate);

  fastify.get(
    '/',
    {
      schema: {
        description: 'List all stories',
        tags: ['Stories'],
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      const query = listQuerySchema.parse(request.query);
      const { page, limit, offset } = normalizePagination(query);

      const where: Record<string, unknown> = {
        workspaceId: request.user!.workspaceId,
      };

      if (query.search) {
        where.OR = [
          { title: { contains: query.search, mode: 'insensitive' } },
          { summary: { contains: query.search, mode: 'insensitive' } },
        ];
      }

      const [stories, total] = await Promise.all([
        prisma.story.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: offset,
          take: limit,
        }),
        prisma.story.count({ where }),
      ]);

      return {
        success: true,
        data: {
          stories,
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
        description: 'Create a new story',
        tags: ['Stories'],
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      const data = request.body as { title: string; summary?: string; content?: string };

      const baseSlug = slugify(data.title);
      let slug = baseSlug;
      let counter = 0;

      while (await prisma.story.findUnique({ where: { slug } })) {
        counter++;
        slug = `${baseSlug}-${counter}`;
      }

      const story = await prisma.story.create({
        data: {
          title: data.title,
          slug,
          summary: data.summary,
          content: data.content,
          workspaceId: request.user!.workspaceId,
        },
      });

      return reply.status(201).send({ success: true, data: story });
    }
  );

  fastify.get(
    '/:id',
    {
      schema: {
        description: 'Get story by ID',
        tags: ['Stories'],
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      const story = await prisma.story.findFirst({
        where: { id, workspaceId: request.user!.workspaceId },
      });

      if (!story) {
        throw new NotFoundError('Story', id);
      }

      return { success: true, data: story };
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        description: 'Update story',
        tags: ['Stories'],
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const data = request.body as Record<string, unknown>;

      const existing = await prisma.story.findFirst({
        where: { id, workspaceId: request.user!.workspaceId },
      });

      if (!existing) {
        throw new NotFoundError('Story', id);
      }

      const story = await prisma.story.update({
        where: { id },
        data,
      });

      return { success: true, data: story };
    }
  );

  fastify.post(
    '/:id/publish',
    {
      schema: {
        description: 'Publish story',
        tags: ['Stories'],
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      const story = await prisma.story.findFirst({
        where: { id, workspaceId: request.user!.workspaceId },
      });

      if (!story) {
        throw new NotFoundError('Story', id);
      }

      const updated = await prisma.story.update({
        where: { id },
        data: {
          isPublished: true,
          publishedAt: story.publishedAt || new Date(),
        },
      });

      return { success: true, data: updated };
    }
  );
}
