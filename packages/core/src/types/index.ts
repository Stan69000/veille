import type {
  User,
  UserRole,
  UserStatus,
  Source,
  SourceType,
  SourceStatus,
  SourceTrustLevel,
  FetchFrequencyMode,
  Item,
  ItemType,
  ItemStatus,
  Severity,
  Story,
  EditorialStatus,
  Audience,
  PublicationTarget,
  PublicationTargetType,
  PublicationJob,
  PublicationJobStatus,
  MediaAsset,
  MediaAssetStatus,
  Workspace,
  Plan,
  PlanType,
  Subscription,
  SubscriptionStatus,
  FeatureFlag,
  AiProvider,
  AiProviderType,
  AiTask,
  AiTaskType,
  AiMode,
  AiPrompt,
  AiPolicy,
  AiLog,
  AuditLog,
  AuditAction,
  StoryItem,
  StoryItemRole,
  AudienceVariant,
  VariantStatus,
  RawIngestion,
  ProcessingStatus,
  Newsletter,
  Submission,
  Category,
  AudienceConfig,
  PlanFeature,
  Session,
} from '@prisma/client';

export type {
  User,
  UserRole,
  UserStatus,
  Source,
  SourceType,
  SourceStatus,
  SourceTrustLevel,
  FetchFrequencyMode,
  Item,
  ItemType,
  ItemStatus,
  Severity,
  Story,
  EditorialStatus,
  Audience,
  PublicationTarget,
  PublicationTargetType,
  PublicationJob,
  PublicationJobStatus,
  MediaAsset,
  MediaAssetStatus,
  Workspace,
  Plan,
  PlanType,
  Subscription,
  SubscriptionStatus,
  FeatureFlag,
  AiProvider,
  AiProviderType,
  AiTask,
  AiTaskType,
  AiMode,
  AiPrompt,
  AiPolicy,
  AiLog,
  AuditLog,
  AuditAction,
  StoryItem,
  StoryItemRole,
  AudienceVariant,
  VariantStatus,
  RawIngestion,
  ProcessingStatus,
  Newsletter,
  Submission,
  Category,
  AudienceConfig,
  PlanFeature,
  Session,
};

export interface AuthContext {
  userId: string;
  email: string;
  workspaceId: string;
  role: UserRole;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationInfo;
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiSuccess<T> {
  data: T;
  meta?: {
    timestamp: string;
    requestId?: string;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | { success: false; error: ApiError };

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  services: {
    database: boolean;
    storage?: boolean;
    redis?: boolean;
  };
}

export type ItemWithSource = Item & {
  source: Pick<Source, 'id' | 'name' | 'type' | 'domain'>;
};

export type ItemFull = Item & {
  source: Source;
  ingestion: RawIngestion | null;
  story: Pick<Story, 'id' | 'title' | 'slug'> | null;
  images: MediaAsset[];
};

export type StoryWithItems = Story & {
  items: (StoryItem & {
    item: Item;
  })[];
  variants: AudienceVariant[];
};

export type StorySummary = Pick<Story, 'id' | 'title' | 'slug' | 'strapline' | 'summary' | 'editorialStatus' | 'severity' | 'publishedAt'> & {
  _count: { items: number };
  items: Array<{
    order: number;
    role: StoryItemRole;
    item: Pick<Item, 'id' | 'title' | 'canonicalUrl' | 'publishedAt'>;
  }>;
};

export interface ItemFilters {
  status?: ItemStatus | ItemStatus[];
  sourceId?: string;
  category?: string;
  severity?: Severity;
  audiences?: Audience[];
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

export interface StoryFilters {
  status?: EditorialStatus | EditorialStatus[];
  category?: string;
  severity?: Severity;
  audiences?: Audience[];
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

export interface SourceFilters {
  status?: SourceStatus | SourceStatus[];
  type?: SourceType | SourceType[];
  trustLevel?: SourceTrustLevel;
  search?: string;
}

export interface ParsedItem {
  title: string;
  url: string | null;
  publishedAt: Date | null;
  author: string | null;
  content: string;
  excerpt: string | null;
  image: string | null;
  categories: string[];
  tags: string[];
}

export interface DedupeResult {
  isDuplicate: boolean;
  originalId: string | null;
  similarity: number;
  reason: string;
}

export interface EnrichmentResult {
  summary: string | null;
  summaryShort: string | null;
  category: string | null;
  tags: string[];
  audiences: Audience[];
  severity: Severity;
  importanceScore: number;
}

export interface PublishResult {
  success: boolean;
  target: string;
  outputPath?: string;
  url?: string;
  error?: string;
}

export interface AuditLogEntry {
  action: AuditAction;
  targetType: string;
  targetId: string;
  userId?: string;
  workspaceId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export interface RateLimitInfo {
  remaining: number;
  limit: number;
  reset: Date;
}

export interface FeatureEntitlement {
  enabled: boolean;
  limit?: number;
  used?: number;
  overageAllowed?: boolean;
}

export interface WorkspaceEntitlements {
  plan: PlanType;
  features: Map<string, FeatureEntitlement>;
  limits: Map<string, number>;
}

export interface PublicStory {
  id: string;
  slug: string;
  title: string;
  strapline: string | null;
  summary: string | null;
  summaryPublic: string | null;
  whyItMatters: string | null;
  whatToDo: string | null;
  whoIsConcerned: string | null;
  category: string | null;
  tags: string[];
  severity: Severity;
  publishedAt: string | null;
  items: PublicStoryItem[];
}

export interface PublicStoryItem {
  id: string;
  title: string;
  url: string | null;
  sourceName: string | null;
  publishedAt: string | null;
  summary: string | null;
}

export interface PublicNews {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  category: string | null;
  severity: Severity;
  publishedAt: string;
  sourceName: string | null;
  sourceUrl: string | null;
}
