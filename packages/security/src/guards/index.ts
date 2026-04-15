import type { UserRole } from '@core/types';
import { ForbiddenError, UnauthorizedError } from '@core/errors';

export interface AuthContext {
  userId: string;
  workspaceId: string;
  role: UserRole;
  email: string;
}

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  VIEWER: 1,
  CURATOR: 2,
  EDITOR: 3,
  ADMIN: 4,
  OWNER: 5,
};

export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

export function requireRole(user: AuthContext, requiredRole: UserRole): void {
  if (!hasRole(user.role, requiredRole)) {
    throw new ForbiddenError(`Role '${requiredRole}' requis`);
  }
}

export function requireAuth(user?: AuthContext | null): asserts user is AuthContext {
  if (!user) {
    throw new UnauthorizedError();
  }
}

export function requireWorkspace(user: AuthContext, workspaceId: string): void {
  if (user.workspaceId !== workspaceId) {
    throw new ForbiddenError('Accès workspace non autorisé');
  }
}

export function requireOwner(user: AuthContext): void {
  requireRole(user, 'OWNER');
}

export function requireAdmin(user: AuthContext): void {
  requireRole(user, 'ADMIN');
}

export function requireEditor(user: AuthContext): void {
  requireRole(user, 'EDITOR');
}

export function requireCurator(user: AuthContext): void {
  requireRole(user, 'CURATOR');
}

export interface Permission {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'publish';
}

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  OWNER: [
    { resource: '*', action: 'create' },
    { resource: '*', action: 'read' },
    { resource: '*', action: 'update' },
    { resource: '*', action: 'delete' },
    { resource: '*', action: 'publish' },
  ],
  ADMIN: [
    { resource: '*', action: 'create' },
    { resource: '*', action: 'read' },
    { resource: '*', action: 'update' },
    { resource: '*', action: 'delete' },
    { resource: '*', action: 'publish' },
  ],
  EDITOR: [
    { resource: 'items', action: 'create' },
    { resource: 'items', action: 'read' },
    { resource: 'items', action: 'update' },
    { resource: 'stories', action: 'create' },
    { resource: 'stories', action: 'read' },
    { resource: 'stories', action: 'update' },
    { resource: 'stories', action: 'publish' },
    { resource: 'sources', action: 'read' },
    { resource: 'media', action: 'create' },
    { resource: 'media', action: 'read' },
  ],
  CURATOR: [
    { resource: 'items', action: 'read' },
    { resource: 'items', action: 'update' },
    { resource: 'stories', action: 'read' },
    { resource: 'sources', action: 'read' },
  ],
  VIEWER: [
    { resource: 'items', action: 'read' },
    { resource: 'stories', action: 'read' },
    { resource: 'sources', action: 'read' },
  ],
};

export function canPerform(
  user: AuthContext,
  resource: string,
  action: Permission['action']
): boolean {
  const permissions = ROLE_PERMISSIONS[user.role];
  
  const hasWildcard = permissions.some(
    (p) => p.resource === '*' && p.action === action
  );
  
  if (hasWildcard) return true;
  
  return permissions.some(
    (p) => (p.resource === resource || p.resource === '*') && p.action === action
  );
}

export function requirePermission(
  user: AuthContext,
  resource: string,
  action: Permission['action']
): void {
  if (!canPerform(user, resource, action)) {
    throw new ForbiddenError(`Permission '${action}' sur '${resource}' non accordée`);
  }
}

export function createGuard(role: UserRole) {
  return function guard(user: AuthContext): void {
    requireRole(user, role);
  };
}
