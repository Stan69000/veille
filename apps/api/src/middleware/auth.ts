import type { FastifyRequest, FastifyReply } from 'fastify';
import { UnauthorizedError, ForbiddenError } from '@core/errors';
import type { AuthContext, UserRole } from '@core/types';

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthContext;
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: {
      sub: string;
      email: string;
      workspaceId: string;
      role: UserRole;
    };
    user: AuthContext;
  }
}

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    await request.jwtVerify();

    request.user = {
      userId: request.user.sub,
      email: request.user.email,
      workspaceId: request.user.workspaceId,
      role: request.user.role,
    };
  } catch (err) {
    throw new UnauthorizedError('Invalid or expired token');
  }
}

export function requireRole(role: UserRole) {
  return async function (
    request: FastifyRequest,
    _reply: FastifyReply
  ): Promise<void> {
    if (!request.user) {
      throw new UnauthorizedError();
    }

    const hierarchy: Record<UserRole, number> = {
      VIEWER: 1,
      CURATOR: 2,
      EDITOR: 3,
      ADMIN: 4,
      OWNER: 5,
    };

    if (hierarchy[request.user.role] < hierarchy[role]) {
      throw new ForbiddenError(`Role '${role}' or higher required`);
    }
  };
}

export function requireWorkspace(workspaceId: string) {
  return async function (
    request: FastifyRequest,
    _reply: FastifyReply
  ): Promise<void> {
    if (!request.user) {
      throw new UnauthorizedError();
    }

    if (request.user.workspaceId !== workspaceId) {
      throw new ForbiddenError('Access to this workspace is not allowed');
    }
  };
}

export function requireAnyRole(...roles: UserRole[]) {
  return async function (
    request: FastifyRequest,
    _reply: FastifyReply
  ): Promise<void> {
    if (!request.user) {
      throw new UnauthorizedError();
    }

    if (!roles.includes(request.user.role)) {
      throw new ForbiddenError(`One of roles [${roles.join(', ')}] required`);
    }
  };
}
