import { prisma } from '@database/client';
import { createProvider, type AiProvider } from '@ai/providers';
import { AiTaskExecutor } from '@ai/tasks';
import {
  getPolicy,
  getModeForTask,
  checkUsageLimits,
  shouldRequireReview,
  type WorkspaceAiConfig,
} from '@ai/policies';
import { getActivePrompt, buildMessages } from '@ai/prompts';
import { logger } from '../../utils/logger.js';
import type { AiMode, AiTaskType } from '@ai/types';

export interface AiPipelineConfig {
  workspaceId: string;
  providerType?: 'OPENAI' | 'ANTHROPIC';
  policyId?: string;
}

export interface AiPipelineContext {
  provider: AiProvider;
  executor: AiTaskExecutor;
  config: WorkspaceAiConfig;
  logger: ReturnType<typeof logger>;
}

export class AiPipeline {
  private config: AiPipelineConfig;
  private context: AiPipelineContext | null = null;

  constructor(config: AiPipelineConfig) {
    this.config = config;
  }

  async initialize(): Promise<AiPipelineContext> {
    const workspace = await prisma.workspace.findUnique({
      where: { id: this.config.workspaceId },
      select: {
        aiConfig: true,
        aiPolicyId: true,
        aiMode: true,
      },
    });

    if (!workspace) {
      throw new Error(`Workspace ${this.config.workspaceId} not found`);
    }

    const policy = getPolicy(workspace.aiPolicyId || 'default-free');
    const mode = workspace.aiMode as AiMode || policy.defaultMode;

    const providerType = this.config.providerType || 'OPENAI';
    const apiKey = process.env[`${providerType}_API_KEY`];

    if (!apiKey && providerType !== 'LOCAL') {
      throw new Error(`API key not configured for ${providerType}`);
    }

    const provider = createProvider(providerType, {
      apiKey,
      baseUrl: process.env[`${providerType}_BASE_URL`],
      defaultModel: process.env[`${providerType}_MODEL`] || 'gpt-4o-mini',
    });

    const isAvailable = await provider.isAvailable();
    if (!isAvailable) {
      throw new Error(`AI provider ${providerType} is not available`);
    }

    const usageLimits = this.loadUsageLimits();

    const fullConfig: WorkspaceAiConfig = {
      workspaceId: this.config.workspaceId,
      policyId: workspace.aiPolicyId || 'default-free',
      enabled: mode !== 'OFF',
      defaultMode: mode,
      providerConfigs: [{
        type: providerType,
        enabled: true,
        defaultModel: provider.defaultModel,
        fallbackOrder: 0,
      }],
      usageLimits,
      allowedTasks: policy.allowedTasks,
    };

    const executor = new AiTaskExecutor({
      provider,
      mode,
    });

    const pipelineLogger = logger.child({ workspaceId: this.config.workspaceId, aiMode: mode });

    this.context = {
      provider,
      executor,
      config: fullConfig,
      logger: pipelineLogger,
    };

    return this.context;
  }

  async executeTask<T>(
    taskType: AiTaskType,
    input: Record<string, unknown>,
    options?: { forceMode?: AiMode }
  ): Promise<{ result?: T; applied: boolean; mode: AiMode; requiresReview: boolean }> {
    if (!this.context) {
      await this.initialize();
    }

    const ctx = this.context!;
    const mode = options?.forceMode || ctx.config.defaultMode;

    if (mode === 'OFF') {
      return { applied: false, mode: 'OFF', requiresReview: false };
    }

    const taskMode = getModeForTask(
      getPolicy(ctx.config.policyId),
      taskType,
      mode
    );

    if (taskMode === 'OFF') {
      return { applied: false, mode: 'OFF', requiresReview: false };
    }

    const canExecute = checkUsageLimits(ctx.config.usageLimits, 1000);
    if (!canExecute.allowed) {
      ctx.logger.warn({ reason: canExecute.reason }, 'Usage limit reached, skipping AI task');
      return { applied: false, mode: taskMode, requiresReview: false };
    }

    try {
      const prompt = getActivePrompt(taskType);
      const messages = buildMessages(prompt, input);

      ctx.logger.info({ taskType, mode: taskMode, promptVersion: prompt.version }, 'Executing AI task');

      const result = await ctx.executor.execute<T>(taskType, input);

      await this.updateUsageLimits(result.tokens || 0);
      await this.logAudit(taskType, mode, result);

      if (result.success) {
        ctx.logger.info({ taskType, tokens: result.tokens }, 'AI task completed');
        return {
          result: result.data,
          applied: true,
          mode: taskMode,
          requiresReview: shouldRequireReview(taskMode),
        };
      } else {
        ctx.logger.error({ taskType, error: result.error }, 'AI task failed');
        return { applied: false, mode: taskMode, requiresReview: false };
      }
    } catch (error) {
      ctx.logger.error({ taskType, error: String(error) }, 'AI task exception');
      return { applied: false, mode: taskMode, requiresReview: false };
    }
  }

  private loadUsageLimits() {
    return {
      workspaceId: this.config.workspaceId,
      maxRequestsPerDay: 100,
      maxTokensPerDay: 50000,
      maxCostPerMonth: 100,
      currentPeriodStart: new Date().toISOString(),
      currentRequests: 0,
      currentTokens: 0,
      currentCost: 0,
    };
  }

  private async updateUsageLimits(tokensUsed: number) {
    if (!this.context) return;

    this.context.config.usageLimits.currentRequests++;
    this.context.config.usageLimits.currentTokens += tokensUsed;
  }

  private async logAudit(
    taskType: AiTaskType,
    mode: AiMode,
    result: { success: boolean; tokens?: number; error?: string }
  ) {
    await prisma.auditLog.create({
      data: {
        workspaceId: this.config.workspaceId,
        userId: 'SYSTEM',
        action: 'AI_TASK_EXECUTED',
        resource: 'AiTask',
        metadata: {
          taskType,
          mode,
          success: result.success,
          tokens: result.tokens,
          error: result.error,
        },
      },
    });
  }
}

export async function createAiPipeline(config: AiPipelineConfig): Promise<AiPipeline> {
  const pipeline = new AiPipeline(config);
  await pipeline.initialize();
  return pipeline;
}
