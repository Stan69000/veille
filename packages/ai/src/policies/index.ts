import type { AiMode, AiTaskType } from '../types/index.js';

export interface AiPolicy {
  id: string;
  name: string;
  description: string;
  defaultMode: AiMode;
  allowedModes: AiMode[];
  allowedTasks: AiTaskType[];
  restrictions: AiPolicyRestriction[];
  createdAt: string;
}

export interface AiPolicyRestriction {
  type: 'max_tokens' | 'max_requests_per_day' | 'max_cost' | 'blocked_topics' | 'require_review';
  value: number | string | string[];
  message?: string;
}

export interface WorkspaceAiConfig {
  workspaceId: string;
  policyId: string;
  enabled: boolean;
  defaultMode: AiMode;
  providerConfigs: ProviderConfig[];
  usageLimits: UsageLimits;
  allowedTasks: AiTaskType[];
  customPrompts?: Record<AiTaskType, string>;
}

export interface ProviderConfig {
  type: 'OPENAI' | 'ANTHROPIC' | 'LOCAL' | 'OLLAMA';
  enabled: boolean;
  apiKey?: string;
  baseUrl?: string;
  defaultModel: string;
  fallbackOrder: number;
}

export interface UsageLimits {
  maxRequestsPerDay: number;
  maxTokensPerDay: number;
  maxCostPerMonth: number;
  currentPeriodStart: string;
  currentRequests: number;
  currentTokens: number;
  currentCost: number;
}

export const DEFAULT_POLICIES: Record<string, AiPolicy> = {
  'default-free': {
    id: 'default-free',
    name: 'Politique gratuite',
    description: 'Politique par défaut pour les espaces gratuits',
    defaultMode: 'SUGGEST',
    allowedModes: ['OFF', 'SUGGEST'],
    allowedTasks: ['SUMMARIZE_ITEM', 'SUMMARIZE_STORY', 'CLASSIFY_CATEGORY'],
    restrictions: [
      { type: 'max_requests_per_day', value: 50, message: 'Limite de 50 requêtes/jour atteinte' },
      { type: 'max_tokens', value: 500, message: 'Résumé limité à 500 tokens' },
    ],
    createdAt: '2024-01-01',
  },

  'default-pro': {
    id: 'default-pro',
    name: 'Politique professionnelle',
    description: 'Politique pour les espaces professionnels',
    defaultMode: 'ASSIST',
    allowedModes: ['OFF', 'SUGGEST', 'ASSIST', 'AUTO_REVIEW_REQUIRED'],
    allowedTasks: [
      'SUMMARIZE_ITEM',
      'SUMMARIZE_STORY',
      'CLASSIFY_CATEGORY',
      'CLASSIFY_AUDIENCE',
      'EXTRACT_ACTIONS',
      'REWRITE_PUBLIC',
      'GENERATE_SEO',
      'GENERATE_EDITORIAL',
    ],
    restrictions: [
      { type: 'max_requests_per_day', value: 500, message: 'Limite de 500 requêtes/jour atteinte' },
      { type: 'max_tokens', value: 2000, message: 'Résumé limité à 2000 tokens' },
    ],
    createdAt: '2024-01-01',
  },

  'default-enterprise': {
    id: 'default-enterprise',
    name: 'Politique entreprise',
    description: 'Politique pour les espaces entreprise avec revue automatique',
    defaultMode: 'AUTO_REVIEW_REQUIRED',
    allowedModes: ['OFF', 'SUGGEST', 'ASSIST', 'AUTO_REVIEW_REQUIRED', 'AUTO'],
    allowedTasks: [
      'SUMMARIZE_ITEM',
      'SUMMARIZE_STORY',
      'CLASSIFY_CATEGORY',
      'CLASSIFY_AUDIENCE',
      'DEDUPE_HINT',
      'CLUSTER_HINT',
      'EXTRACT_ACTIONS',
      'REWRITE_PUBLIC',
      'REWRITE_ASSOCIATION',
      'GENERATE_SEO',
      'DETECT_PHISHING',
      'GENERATE_EDITORIAL',
    ],
    restrictions: [
      { type: 'max_requests_per_day', value: 5000, message: 'Limite de 5000 requêtes/jour atteinte' },
      { type: 'require_review', value: 1, message: 'Revue requise pour le mode AUTO' },
    ],
    createdAt: '2024-01-01',
  },

  'security-only': {
    id: 'security-only',
    name: 'Politique sécurité',
    description: 'Limité à la détection de phishing',
    defaultMode: 'AUTO',
    allowedModes: ['OFF', 'ASSIST', 'AUTO'],
    allowedTasks: ['DETECT_PHISHING'],
    restrictions: [
      { type: 'blocked_topics', value: ['politique', 'religion', 'finance_perso'], message: 'Topics non autorisés' },
    ],
    createdAt: '2024-01-01',
  },
};

export function getPolicy(policyId: string): AiPolicy {
  return DEFAULT_POLICIES[policyId] || DEFAULT_POLICIES['default-free'];
}

export function getModeForTask(
  policy: AiPolicy,
  task: AiTaskType,
  workspaceMode?: AiMode
): AiMode {
  if (!policy.allowedTasks.includes(task)) {
    return 'OFF';
  }

  if (workspaceMode && policy.allowedModes.includes(workspaceMode)) {
    return workspaceMode;
  }

  return policy.defaultMode;
}

export function canExecuteTask(
  policy: AiPolicy,
  task: AiTaskType
): boolean {
  return policy.allowedTasks.includes(task);
}

export function getTaskRestrictions(
  policy: AiPolicy,
  task: AiTaskType
): AiPolicyRestriction[] {
  return policy.restrictions.filter((r) => {
    if (task === 'SUMMARIZE_ITEM' || task === 'SUMMARIZE_STORY') {
      return r.type === 'max_tokens';
    }
    return true;
  });
}

export function checkUsageLimits(
  limits: UsageLimits,
  tokensToUse: number
): { allowed: boolean; reason?: string } {
  if (limits.currentRequests >= limits.maxRequestsPerDay) {
    return { allowed: false, reason: 'Limite de requêtes quotidiennes atteinte' };
  }

  if (limits.currentTokens + tokensToUse > limits.maxTokensPerDay) {
    return { allowed: false, reason: 'Limite de tokens quotidiens atteinte' };
  }

  return { allowed: true };
}

export function shouldRequireReview(mode: AiMode): boolean {
  return mode === 'SUGGEST' || mode === 'AUTO_REVIEW_REQUIRED';
}

export function isAutomatic(mode: AiMode): boolean {
  return mode === 'AUTO';
}

export function isEnabled(mode: AiMode): boolean {
  return mode !== 'OFF';
}
