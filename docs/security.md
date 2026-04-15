# Documentation de Sécurité

## Vue d'ensemble

La plateforme Veille Platform intègre la sécurité dès la conception (Security by Design) avec plusieurs couches de protection.

## Architecture de Sécurité

### Séparation des composants

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Admin)                     │
│              Next.js - Zone protégée                     │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS + JWT
                         ▼
┌─────────────────────────────────────────────────────────┐
│                   API Interne (Fastify)                 │
│              Zones: auth, items, stories                │
│         Rate limiting, validation, audit logs            │
└───────────┬─────────────────────────────────┬────────────┘
            │                                 │
            ▼                                 ▼
┌───────────────────────┐       ┌─────────────────────────┐
│   Public API (lecture) │       │   Worker (jobs async)    │
│   Endpoints publics    │       │   BullMQ + Redis        │
│   Rate limiting strict │       │   Validation SSRF       │
└───────────────────────┘       └─────────────────────────┘
            │                                 │
            ▼                                 ▼
┌─────────────────────────────────────────────────────────┐
│                  Base de données                         │
│              PostgreSQL avec RLS (optionnel)             │
└─────────────────────────────────────────────────────────┘
```

### Zones de confiance

| Zone | Accès | Protection |
|------|-------|------------|
| Admin | Utilisateurs authentifiés | JWT, rôles, audit |
| API Interne | Services internes + Admin | JWT, rate limiting |
| Public API | Tout le monde | Rate limiting, validation |
| Worker | Services internes uniquement | Validation, sandbox |

## Risques couverts

### 1. Injection SQL

**Protection**: Prisma ORM avec requêtes paramétrées

```typescript
// ✅ Sécurisé - Paramètres liés
const user = await prisma.user.findUnique({
  where: { id: userId }
});

// ❌ Non sécurisé - Jamais fait dans le codebase
const user = await prisma.$queryRaw`SELECT * FROM users WHERE id = ${id}`;
```

### 2. XSS (Cross-Site Scripting)

**Protection**:
- Échappement automatique par React
- CSP headers stricts
- Validation Zod sur les entrées

### 3. CSRF (Cross-Site Request Forgery)

**Protection**:
- JWT dans headers Authorization (pas de cookies)
- CORS configuré avec origines explicites
- SameSite cookies si utilisés

### 4. SSRF (Server-Side Request Forgery)

**Protection**:
```typescript
// Dans packages/security/src/ssrf.ts
const BLOCKED_IP_RANGES = [
  /^127\./,           // localhost
  /^10\./,            // Private
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,  // Private
  /^192\.168\./,       // Private
  /^169\.254\./,       // AWS metadata
  /^::1$/,            // IPv6 localhost
];

export async function checkSSRF(url: string, options: SSRFCheckOptions) {
  // Validation du hostname
  // Vérification DNS reverse
  // Contrôle du port
  // Whitelist de domaines optionnelle
}
```

### 5. Upload de fichiers malveillants

**Protection**:
```typescript
// Validation stricte
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function validateFile(file: File) {
  // Type MIME vérifié
  // Taille vérifiée
  // Extension vérifiée
  // Scan de contenu (futur)
}
```

### 6. Rate Limiting

**Protection**:
```typescript
// Configuration par endpoint
const RATE_LIMITS = {
  DEFAULT: { window: 60, max: 100 },
  API_KEY: { window: 60, max: 1000 },
  AUTH: { window: 900, max: 5 },  // 5 tentatives / 15min
  IMPORT: { window: 3600, max: 10 },
};
```

### 7. Énumération d'identifiants

**Protection**:
- UUIDs non-devinables pour les ressources
- Messages d'erreur génériques
- Rate limiting sur les authentifications

### 8. Exposition de données sensibles

**Protection**:
- Public API: Uniquement contenus publiés
-过滤 des champs internes (passwordHash, tokens, etc.)
- Audit logs de tous les accès

## Gestions des secrets

### Variables d'environnement

```bash
# .env (jamais commité)
DATABASE_URL="postgresql://..."
AUTH_SECRET="min-32-chars-secret"
OPENAI_API_KEY="sk-..."

# Ne JAMAIS faire
git add .env
```

### Rotation des secrets

- JWT secrets: Rotation possible via admin
- API keys: Régénération dans settings
- Database: Rotation via admin PostgreSQL

## Authentification

### JWT

```typescript
interface JWTPayload {
  sub: string;        // User ID
  email: string;
  workspaceId: string;
  role: UserRole;
  iat: number;         // Issued at
  exp: number;         // Expiration
}
```

### Rôles et permissions

| Rôle | CRUD Items | CRUD Stories | Manage Sources | Admin |
|------|------------|--------------|----------------|-------|
| VIEWER | Read | Read | - | - |
| CURATOR | Read, Update | Read | - | - |
| EDITOR | Full | Full | - | - |
| ADMIN | Full | Full | Full | Partial |
| OWNER | Full | Full | Full | Full |

## Audit Logging

Toutes les actions sensibles sont journalisées:

```typescript
await prisma.auditLog.create({
  data: {
    userId: user.id,
    action: 'DELETE',
    targetType: 'item',
    targetId: item.id,
    workspaceId: workspace.id,
    metadata: { reason: 'spam' },
    ipAddress: request.ip,
    userAgent: request.headers['user-agent'],
  },
});
```

## Limites et recommandations

### Limites actuelles

1. **Pas de 2FA obligatoire** - Recommandé pour production
2. **Pas de WAF** - À ajouter (Cloudflare, etc.)
3. **Pas de Encryption at Rest** - À configurer PostgreSQL
4. **Pas de Backup automatisé** - À mettre en place

### Recommandations pour la production

1. **Infrastructure**
   - Utiliser un managed PostgreSQL (Neon, Supabase, etc.)
   - Redis managé pour le worker
   - CDN pour les assets statiques
   - WAF (Cloudflare, AWS WAF)

2. **Monitoring**
   - Logs centralisés (Datadog, Sentry)
   - Alertes de sécurité
   - Dashboard de monitoring

3. **Compliance**
   - RGPD: Data retention policy
   - Cookies consent
   - Privacy policy

## Déclarations de vulnérabilités

Pour signaler une vulnérabilité: security@platform.io

## Références

- [OWASP Top 10](https://owasp.org/Top10/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Prisma Security](https://www.prisma.io/docs/guides/database/troubleshooting-orm/help-articles/understanding-exposing-ssrf-on-admin-server)
