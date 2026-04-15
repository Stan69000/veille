import { auth } from './auth';
import { NextResponse } from 'next/server';

export async function getSession() {
  const session = await auth();
  return session;
}

export async function requireAuth() {
  const session = await getSession();
  
  if (!session?.user) {
    throw new Error('Unauthorized');
  }
  
  return session;
}

export async function requireRole(roles: string[]) {
  const session = await requireAuth();
  
  if (!roles.includes(session.user.role)) {
    throw new Error('Forbidden');
  }
  
  return session;
}

export function unauthorized() {
  return NextResponse.json(
    { error: 'Unauthorized' },
    { status: 401 }
  );
}

export function forbidden() {
  return NextResponse.json(
    { error: 'Forbidden' },
    { status: 403 }
  );
}
