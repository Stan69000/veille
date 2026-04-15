import { z } from 'zod';
import { uuidSchema, paginationSchema, emailSchema } from './index.js';

export const userRoleSchema = z.enum(['OWNER', 'ADMIN', 'EDITOR', 'CURATOR', 'VIEWER']);

export const userStatusSchema = z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION']);

export const listUsersQuerySchema = paginationSchema.extend({
  role: userRoleSchema.optional(),
  status: userStatusSchema.optional(),
});

export const createUserSchema = z.object({
  email: emailSchema,
  name: z.string().min(1).max(100),
  role: userRoleSchema,
  password: z.string().min(8).max(128).optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  role: userRoleSchema.optional(),
  status: userStatusSchema.optional(),
  avatarUrl: z.string().url().nullable().optional(),
});

export const userResponseSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  role: userRoleSchema,
  status: userStatusSchema,
  avatarUrl: z.string().nullable(),
  lastLoginAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const usersListResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    users: z.array(userResponseSchema),
    pagination: z.object({
      total: z.number(),
      page: z.number(),
      limit: z.number(),
      totalPages: z.number(),
      hasNext: z.boolean(),
      hasPrev: z.boolean(),
    }),
  }),
});

export const userResponseWrapperSchema = z.object({
  success: z.literal(true),
  data: userResponseSchema,
});

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
