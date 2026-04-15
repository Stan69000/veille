import type { UserRole, Severity, ItemStatus, SourceStatus, EditorialStatus, SourceType, AiTaskType, PlanType, Audience } from '@prisma/client';

export const APP_NAME = 'Veille Platform';
export const APP_VERSION = '0.1.0';
export const APP_DESCRIPTION = 'Plateforme professionnelle de veille éditoriale multi-sources';
export const APP_URL = process.env.APP_URL || 'http://localhost:3000';
export const APP_API_URL = process.env.API_URL || 'http://localhost:3001';
export const APP_ADMIN_URL = process.env.ADMIN_URL || 'http://localhost:3000';

export const DEFAULT_PAGINATION = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

export const ERROR_CODES = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  DUPLICATE_ERROR: 'DUPLICATE_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  ENTITLEMENT_REQUIRED: 'ENTITLEMENT_REQUIRED',
  SSRF_DETECTED: 'SSRF_DETECTED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  ACCOUNT_DISABLED: 'ACCOUNT_DISABLED',
} as const;

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  OWNER: 'Propriétaire',
  ADMIN: 'Administrateur',
  EDITOR: 'Éditeur',
  CURATOR: 'Curateur',
  VIEWER: 'Lecteur',
} as const;

export const USER_ROLE_HIERARCHY: Record<UserRole, number> = {
  VIEWER: 1,
  CURATOR: 2,
  EDITOR: 3,
  ADMIN: 4,
  OWNER: 5,
} as const;

export const SEVERITY_LABELS: Record<Severity, string> = {
  INFO: 'Information',
  LOW: 'Faible',
  MEDIUM: 'Moyen',
  HIGH: 'Élevé',
  CRITICAL: 'Critique',
} as const;

export const SEVERITY_COLORS: Record<Severity, string> = {
  INFO: 'gray',
  LOW: 'blue',
  MEDIUM: 'yellow',
  HIGH: 'orange',
  CRITICAL: 'red',
} as const;

export const ITEM_STATUS_LABELS: Record<ItemStatus, string> = {
  RAW: 'Brut',
  PARSED: 'Analysé',
  DEDUPLICATED: 'Dédoublonné',
  ENRICHED: 'Enrichi',
  PENDING_REVIEW: 'En attente de review',
  APPROVED: 'Approuvé',
  REJECTED: 'Rejeté',
  QUARANTINED: 'En quarantaine',
  PUBLISHED: 'Publié',
  ARCHIVED: 'Archivé',
} as const;

export const SOURCE_STATUS_LABELS: Record<SourceStatus, string> = {
  ACTIVE: 'Actif',
  PAUSED: 'En pause',
  ERROR: 'En erreur',
  DISABLED: 'Désactivé',
  PENDING: 'En attente',
} as const;

export const SOURCE_TYPE_LABELS: Record<SourceType, string> = {
  RSS: 'Flux RSS',
  ATOM: 'Flux Atom',
  NEWSLETTER: 'Newsletter',
  EMAIL: 'Email',
  SMS: 'SMS',
  MANUAL: 'Manuel',
  WEBHOOK: 'Webhook',
  API: 'API',
} as const;

export const EDITORIAL_STATUS_LABELS: Record<EditorialStatus, string> = {
  DRAFT: 'Brouillon',
  IN_PROGRESS: 'En cours',
  READY: 'Prêt à publier',
  PUBLISHED: 'Publié',
  ARCHIVED: 'Archivé',
} as const;

export const AUDIENCE_LABELS: Record<Audience, string> = {
  GENERAL: 'Grand public',
  PROFESSIONNELS: 'Professionnels',
  ASSOCIATIONS: 'Associations',
  PARTICULIERS: 'Particuliers',
  SENIORS: 'Seniors',
  JEUNES: 'Jeunes',
  ENTREPRISES: 'Entreprises',
  INSTITUTIONS: 'Institutions',
} as const;

export const AI_TASK_LABELS: Record<AiTaskType, string> = {
  SUMMARIZE_ITEM: 'Résumé d\'article',
  SUMMARIZE_STORY: 'Résumé de story',
  CLASSIFY_CATEGORY: 'Classification catégorie',
  CLASSIFY_AUDIENCE: 'Classification audience',
  CLASSIFY_SEVERITY: 'Classification sévérité',
  DEDUPE_HINT: 'Suggestion dédoublonnage',
  CLUSTER_HINT: 'Suggestion regroupement',
  EXTRACT_ACTIONS: 'Extraction actions',
  REWRITE_PUBLIC: 'Réécriture grand public',
  REWRITE_ASSOCIATION: 'Réécriture associations',
  GENERATE_SEO: 'Génération SEO',
  DETECT_PHISHING: 'Détection phishing',
  SUGGEST_TAGS: 'Suggestion de tags',
} as const;

export const AI_MODE_LABELS: Record<string, string> = {
  OFF: 'Désactivé',
  SUGGEST: 'Suggestion',
  ASSIST: 'Assistance',
  AUTO_REVIEW_REQUIRED: 'Auto + validation requise',
  AUTO: 'Automatique',
} as const;

export const PLAN_TYPE_LABELS: Record<PlanType, string> = {
  FREE: 'Gratuit',
  PREMIUM: 'Premium',
  ASSOCIATION: 'Association',
  PRO: 'Professionnel',
  TEAM: 'Équipe',
  ENTERPRISE: 'Entreprise',
} as const;

export const FETCH_FREQUENCY_OPTIONS: Array<{
  value: string;
  label: string;
  cron?: string;
  description?: string;
}> = [
  { value: 'MANUAL', label: 'Manuel', description: 'Import manuel uniquement' },
  { value: 'EVERY_15M', label: '15 min', cron: '*/15 * * * *', description: 'Toutes les 15 minutes' },
  { value: 'HOURLY', label: 'Horaire', cron: '0 * * * *', description: 'Toutes les heures' },
  { value: 'EVERY_6H', label: '6 heures', cron: '0 */6 * * *', description: 'Toutes les 6 heures' },
  { value: 'EVERY_12H', label: '12 heures', cron: '0 */12 * * *', description: 'Toutes les 12 heures' },
  { value: 'DAILY', label: 'Quotidien', cron: '0 0 * * *', description: 'Une fois par jour' },
  { value: 'WEEKLY', label: 'Hebdomadaire', cron: '0 0 * * 0', description: 'Une fois par semaine' },
  { value: 'CUSTOM', label: 'Personnalisé', description: 'Expression cron personnalisée' },
] as const;

export const TRUST_LEVEL_LABELS: Record<string, string> = {
  TRUSTED: 'Approuvé',
  VERIFIED: 'Vérifié',
  UNVERIFIED: 'Non vérifié',
  FLAGGED: 'Signalé',
  BLOCKED: 'Bloqué',
} as const;

export const CONTENT_SECURITY_POLICY = {
  DEFAULT_SRC: ["'self'"],
  SCRIPT_SRC: ["'self'", "'unsafe-inline'"],
  STYLE_SRC: ["'self'", "'unsafe-inline'"],
  IMG_SRC: ["'self'", 'data:', 'https:'],
  FONT_SRC: ["'self'", 'data:'],
  CONNECT_SRC: ["'self'"],
  MEDIA_SRC: ["'self'"],
  OBJECT_SRC: ["'none'"],
  FRAME_SRC: ["'none'"],
  FORM_ACTION: ["'self'"],
  BASE_URI: ["'self'"],
} as const;

export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
] as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024;

export const RATE_LIMITS = {
  DEFAULT: { window: 60, max: 100 },
  API_KEY: { window: 60, max: 1000 },
  AUTH: { window: 900, max: 5 },
  IMPORT: { window: 3600, max: 10 },
  WEBHOOK: { window: 60, max: 30 },
} as const;

export const DEFAULT_TIMEOUT_MS = 30000;
export const MAX_REDIRECTS = 5;
export const USER_AGENT = 'VeillePlatform/1.0 (+https://veille.platform)';

export const REGEX = {
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  URL: /^https?:\/\/.+/,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  ISO_DATE: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/,
} as const;
