import { prisma } from '@database/client';

export async function createAuditLog(data: {
  userId?: string;
  action: string;
  targetType: string;
  targetId: string;
  workspaceId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}) {
  return prisma.auditLog.create({
    data: {
      userId: data.userId,
      action: data.action as any,
      targetType: data.targetType,
      targetId: data.targetId,
      workspaceId: data.workspaceId,
      metadata: data.metadata || {},
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    },
  });
}

export async function getWorkspaceStats(workspaceId: string) {
  const [
    users,
    sources,
    items,
    stories,
  ] = await Promise.all([
    prisma.user.count({ where: { workspaceId } }),
    prisma.source.count({ where: { workspaceId } }),
    prisma.item.count({ where: { workspaceId } }),
    prisma.story.count({ where: { workspaceId } }),
  ]);

  return { users, sources, items, stories };
}

export async function getContentStats(workspaceId: string) {
  const now = new Date();
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    last24hItems,
    last7dItems,
    last30dItems,
    pendingReview,
    publishedStories,
    quarantined,
  ] = await Promise.all([
    prisma.item.count({ where: { workspaceId, createdAt: { gte: dayAgo } } }),
    prisma.item.count({ where: { workspaceId, createdAt: { gte: weekAgo } } }),
    prisma.item.count({ where: { workspaceId, createdAt: { gte: monthAgo } } }),
    prisma.item.count({ where: { workspaceId, status: 'PENDING_REVIEW' } }),
    prisma.story.count({ where: { workspaceId, editorialStatus: 'PUBLISHED' } }),
    prisma.item.count({ where: { workspaceId, status: 'QUARANTINED' } }),
  ]);

  return {
    items: {
      last24h: last24hItems,
      last7d: last7dItems,
      last30d: last30dItems,
    },
    pendingReview,
    publishedStories,
    quarantined,
  };
}
