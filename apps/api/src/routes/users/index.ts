import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '@database/client';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/auth.js';
import { NotFoundError, ValidationError } from '@core/errors';
import { normalizePagination } from '@core/utils';
import bcrypt from 'bcrypt';

const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  role: z.enum(['OWNER', 'ADMIN', 'EDITOR', 'CURATOR', 'VIEWER']).optional(),
});

const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  role: z.enum(['ADMIN', 'EDITOR', 'CURATOR', 'VIEWER']),
  password: z.string().min(8).max(128).optional(),
});

const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  role: z.enum(['OWNER', 'ADMIN', 'EDITOR', 'CURATOR', 'VIEWER']).optional(),
});

export async function usersRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authenticate);

  fastify.get(
    '/',
    {
      preHandler: requireRole('ADMIN'),
      schema: {
        description: 'List workspace users',
        tags: ['Users'],
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      const query = listQuerySchema.parse(request.query);
      const { page, limit, offset } = normalizePagination(query);

      const where: Record<string, unknown> = {
        workspaceId: request.user!.workspaceId,
      };

      if (query.role) where.role = query.role;

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            isActive: true,
            lastLoginAt: true,
            createdAt: true,
          },
          orderBy: { name: 'asc' },
          skip: offset,
          take: limit,
        }),
        prisma.user.count({ where }),
      ]);

      return {
        success: true,
        data: {
          users,
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
        description: 'Get user by ID',
        tags: ['Users'],
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      const user = await prisma.user.findFirst({
        where: { id, workspaceId: request.user!.workspaceId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
        },
      });

      if (!user) {
        throw new NotFoundError('User', id);
      }

      return { success: true, data: user };
    }
  );

  fastify.post(
    '/',
    {
      preHandler: requireRole('OWNER'),
      schema: {
        description: 'Create user',
        tags: ['Users'],
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      const data = createUserSchema.parse(request.body);

      const existing = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existing) {
        throw new ValidationError('Email already registered');
      }

      const passwordHash = data.password
        ? await bcrypt.hash(data.password, 12)
        : await bcrypt.hash(crypto.randomUUID(), 12);

      const user = await prisma.user.create({
        data: {
          email: data.email,
          passwordHash,
          name: data.name,
          role: data.role,
          workspaceId: request.user!.workspaceId,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      });

      return reply.status(201).send({ success: true, data: user });
    }
  );

  fastify.patch(
    '/:id',
    {
      preHandler: requireRole('ADMIN'),
      schema: {
        description: 'Update user',
        tags: ['Users'],
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const data = updateUserSchema.parse(request.body);

      const existing = await prisma.user.findFirst({
        where: { id, workspaceId: request.user!.workspaceId },
      });

      if (!existing) {
        throw new NotFoundError('User', id);
      }

      if (existing.role === 'OWNER' && request.user!.role !== 'OWNER') {
        throw new ValidationError('Cannot modify owner');
      }

      const user = await prisma.user.update({
        where: { id },
        data,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          updatedAt: true,
        },
      });

      return { success: true, data: user };
    }
  );

  fastify.delete(
    '/:id',
    {
      preHandler: requireRole('OWNER'),
      schema: {
        description: 'Delete user',
        tags: ['Users'],
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      const user = await prisma.user.findFirst({
        where: { id, workspaceId: request.user!.workspaceId },
      });

      if (!user) {
        throw new NotFoundError('User', id);
      }

      if (user.role === 'OWNER') {
        throw new ValidationError('Cannot delete owner');
      }

      if (user.id === request.user!.userId) {
        throw new ValidationError('Cannot delete yourself');
      }

      await prisma.user.delete({ where: { id } });

      return { success: true };
    }
  );
}
