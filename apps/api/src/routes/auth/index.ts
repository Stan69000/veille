import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '@database/client';
import { authenticate } from '../../middleware/auth.js';
import { UnauthorizedError, ForbiddenError, ValidationError } from '@core/errors';
import { DEFAULT_PAGINATION } from '@core/constants';
import bcrypt from 'bcrypt';

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password cannot exceed 128 characters'),
  name: z.string().min(1, 'Name is required').max(100),
  workspaceName: z.string().min(1, 'Workspace name is required').max(100),
});

const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  avatarUrl: z.string().url().optional().nullable(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z
    .string()
    .min(8)
    .max(128)
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
});

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post(
    '/register',
    {
      schema: {
        description: 'Register a new user and workspace',
        tags: ['Auth'],
        body: {
          type: 'object',
          required: ['email', 'password', 'name', 'workspaceName'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 8, maxLength: 128 },
            name: { type: 'string', minLength: 1, maxLength: 100 },
            workspaceName: { type: 'string', minLength: 1, maxLength: 100 },
          },
        },
      },
    },
    async (request, reply) => {
      const data = registerSchema.parse(request.body);

      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        throw new ValidationError('Email already registered');
      }

      const passwordHash = await bcrypt.hash(data.password, 12);

      const result = await prisma.$transaction(async (tx) => {
        const workspace = await tx.workspace.create({
          data: {
            name: data.workspaceName,
            slug: data.workspaceName
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-+|-+$/g, ''),
          },
        });

        const user = await tx.user.create({
          data: {
            email: data.email,
            passwordHash,
            name: data.name,
            role: 'OWNER',
            workspaceId: workspace.id,
          },
        });

        return { workspace, user };
      });

      const token = fastify.jwt.sign({
        sub: result.user.id,
        email: result.user.email,
        workspaceId: result.user.workspaceId,
        role: result.user.role,
      });

      return reply.status(201).send({
        success: true,
        data: {
          token,
          user: {
            id: result.user.id,
            email: result.user.email,
            name: result.user.name,
            role: result.user.role,
            workspaceId: result.user.workspaceId,
          },
        },
      });
    }
  );

  fastify.post(
    '/login',
    {
      schema: {
        description: 'Login with email and password',
        tags: ['Auth'],
        body: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 1 },
          },
        },
      },
    },
    async (request, reply) => {
      const { email, password } = loginSchema.parse(request.body);

      const user = await prisma.user.findUnique({
        where: { email },
        include: { workspace: true },
      });

      if (!user) {
        throw new UnauthorizedError('Invalid email or password');
      }

      if (!user.isActive) {
        throw new ForbiddenError('Account is not active');
      }

      const validPassword = await bcrypt.compare(password, user.passwordHash || '');
      if (!validPassword) {
        throw new UnauthorizedError('Invalid email or password');
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          lastLoginAt: new Date(),
        },
      });

      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'LOGIN',
          targetType: 'User',
          targetId: user.id,
          workspaceId: user.workspaceId,
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'],
        },
      });

      const token = fastify.jwt.sign({
        sub: user.id,
        email: user.email,
        workspaceId: user.workspaceId,
        role: user.role,
      });

      return {
        success: true,
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            workspaceId: user.workspaceId,
          },
        },
      };
    }
  );

  fastify.post(
    '/logout',
    {
      preHandler: [authenticate],
      schema: {
        description: 'Logout current user',
        tags: ['Auth'],
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      if (request.user) {
        await prisma.auditLog.create({
          data: {
            userId: request.user.userId,
            action: 'LOGOUT',
            targetType: 'User',
            targetId: request.user.userId,
            workspaceId: request.user.workspaceId,
            ipAddress: request.ip,
            userAgent: request.headers['user-agent'],
          },
        });
      }

      return { success: true };
    }
  );

  fastify.get(
    '/me',
    {
      preHandler: [authenticate],
      schema: {
        description: 'Get current user profile',
        tags: ['Auth'],
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      const user = await prisma.user.findUnique({
        where: { id: request.user!.userId },
        include: {
          workspace: {
            select: { id: true, name: true, planType: true },
          },
        },
      });

      if (!user) {
        throw new UnauthorizedError();
      }

      return {
        success: true,
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          workspace: {
            id: user.workspace.id,
            name: user.workspace.name,
            plan: user.workspace.planType,
          },
        },
      };
    }
  );
}
