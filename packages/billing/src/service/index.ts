import { prisma } from '@database/client';
import type { PlanType, SubscriptionStatus } from '../types/index.js';
import { getPlan } from '../plans/index.js';
import { canUpgrade, canDowngrade } from '../subscriptions/index.js';

export interface WorkspaceBillingInfo {
  workspaceId: string;
  planType: PlanType;
  subscriptionStatus: SubscriptionStatus;
  isActive: boolean;
  entitlements: ReturnType<typeof getPlan>['limits'];
  usage: {
    itemsThisMonth: number;
    storiesThisMonth: number;
    sourcesCount: number;
    teamMembers: number;
    exportsThisMonth: number;
    aiRequestsToday: number;
    storageUsedGb: number;
  };
}

export class BillingService {
  workspaceId: string;
  planType: PlanType = 'FREE';
  subscriptionStatus: SubscriptionStatus = 'ACTIVE';

  constructor(workspaceId: string) {
    this.workspaceId = workspaceId;
  }

  async initialize(): Promise<void> {
    const workspace = await prisma.workspace.findUnique({
      where: { id: this.workspaceId },
      select: { planType: true, subscriptionStatus: true },
    });

    if (workspace) {
      this.planType = workspace.planType as PlanType;
      this.subscriptionStatus = workspace.subscriptionStatus as SubscriptionStatus;
    }
  }

  async getBillingInfo(): Promise<WorkspaceBillingInfo> {
    await this.initialize();

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));

    const [itemsCount, storiesCount, sourcesCount, teamCount, exportsCount, aiCount, storage] = await Promise.all([
      prisma.item.count({
        where: {
          workspaceId: this.workspaceId,
          createdAt: { gte: startOfMonth },
        },
      }),
      prisma.story.count({
        where: {
          workspaceId: this.workspaceId,
          createdAt: { gte: startOfMonth },
        },
      }),
      prisma.source.count({
        where: { workspaceId: this.workspaceId },
      }),
      prisma.workspaceMember.count({
        where: { workspaceId: this.workspaceId },
      }),
      prisma.publicationJob.count({
        where: {
          workspaceId: this.workspaceId,
          createdAt: { gte: startOfMonth },
        },
      }),
      prisma.auditLog.count({
        where: {
          workspaceId: this.workspaceId,
          action: 'AI_TASK_EXECUTED',
          createdAt: { gte: startOfDay },
        },
      }),
      prisma.mediaAsset.aggregate({
        where: { workspaceId: this.workspaceId },
        _sum: { sizeBytes: true },
      }),
    ]);

    const plan = getPlan(this.planType);

    return {
      workspaceId: this.workspaceId,
      planType: this.planType,
      subscriptionStatus: this.subscriptionStatus,
      isActive: this.subscriptionStatus === 'ACTIVE',
      entitlements: plan.limits,
      usage: {
        itemsThisMonth: itemsCount,
        storiesThisMonth: storiesCount,
        sourcesCount,
        teamMembers: teamCount,
        exportsThisMonth: exportsCount,
        aiRequestsToday: aiCount,
        storageUsedGb: Math.round((storage._sum.sizeBytes || 0) / (1024 * 1024 * 1024) * 100) / 100,
      },
    };
  }

  async canCreateItem(): Promise<boolean> {
    const info = await this.getBillingInfo();
    return info.usage.itemsThisMonth < info.entitlements.itemsPerMonth;
  }

  async canCreateStory(): Promise<boolean> {
    const info = await this.getBillingInfo();
    return info.usage.storiesThisMonth < info.entitlements.storiesPerMonth;
  }

  async canCreateSource(): Promise<boolean> {
    const info = await this.getBillingInfo();
    return info.usage.sourcesCount < info.entitlements.sources;
  }

  async canInviteTeamMember(): Promise<boolean> {
    const info = await this.getBillingInfo();
    return info.usage.teamMembers < info.entitlements.teamMembers;
  }

  async canUseAi(): Promise<boolean> {
    const info = await this.getBillingInfo();
    return info.usage.aiRequestsToday < info.entitlements.aiRequestsPerDay;
  }

  async checkFeatureAccess(feature: string): Promise<boolean> {
    const plan = getPlan(this.planType);
    const limits = plan.limits;

    const featureMap: Record<string, keyof typeof limits> = {
      'ai_summaries': 'aiRequestsPerDay',
      'rss_feeds': 'rssFeeds',
      'email_sources': 'emailSources',
      'api_access': 'apiCallsPerDay',
      'custom_domains': 'customDomains',
      'sso': 'sso',
      'advanced_filters': 'advancedFilters',
      'priority_support': 'prioritySupport',
      'custom_branding': 'customBranding',
      'advanced_analytics': 'analytics',
      'webhooks': 'webhookEvents',
    };

    const limitKey = featureMap[feature];
    if (!limitKey) return true;

    const value = limits[limitKey];
    if (typeof value === 'boolean') return value;
    if (value === -1) return true;

    return true;
  }

  async updatePlan(newPlan: PlanType): Promise<void> {
    if (!canUpgrade(this.planType, newPlan) && !canDowngrade(this.planType, newPlan)) {
      throw new Error('Invalid plan transition');
    }

    await prisma.workspace.update({
      where: { id: this.workspaceId },
      data: {
        planType: newPlan,
        updatedAt: new Date(),
      },
    });

    await prisma.auditLog.create({
      data: {
        workspaceId: this.workspaceId,
        userId: 'SYSTEM',
        action: 'PLAN_CHANGED',
        resource: 'Workspace',
        resourceId: this.workspaceId,
        metadata: {
          from: this.planType,
          to: newPlan,
        },
      },
    });

    this.planType = newPlan;
  }
}

export async function createBillingService(workspaceId: string): Promise<BillingService> {
  const service = new BillingService(workspaceId);
  await service.initialize();
  return service;
}
