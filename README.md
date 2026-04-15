# Veille Platform

Plateforme professionnelle de veille éditoriale multi-sources, pensées comme un vrai produit SaaS haut de gamme.

## Fonctionnalités

- **Agrégation multi-sources**: RSS, newsletters, emails, SMS, imports manuels
- **Traitement intelligent**: Parsing, nettoyage, dédoublonnage, clustering
- **Enrichissement IA**: Résumés, classifications, détection de phishing
- **Publication flexible**: JSON, MDX, RSS, API publique
- **Admin professionnelle**: Dashboard, gestion des sources, curation, stories
- **Multi-destinations**: Prête à alimenter plusieurs sites Astro
- **Sécurité**: Validation, rate limiting, audit logs, SSRF protection
- **Accessibilité**: Conforme RGAA, navigation clavier, lecteur d'écran

## Architecture

```
veille-platform/
├── apps/
│   ├── admin/          # Next.js App Router - Admin privée
│   ├── api/            # Fastify - API interne
│   ├── worker/         # BullMQ - Jobs asynchrones
│   └── public-api/     # Fastify - API publique lecture
├── packages/
│   ├── core/           # Types, erreurs, utilitaires
│   ├── database/       # Prisma client
│   ├── security/       # Validateurs, guards, policies
│   ├── ui/             # Design system React
│   ├── ai/             # Providers, prompts, tâches IA
│   ├── billing/        # Plans, abonnements, entitlements
│   ├── ingestion/      # RSS, email, SMS
│   ├── parsing/        # HTML, texte, métadonnées
│   ├── dedupe/         # Fingerprinting, clustering
│   ├── enrichment/     # Résumés, classifications
│   ├── publishing/     # JSON, MDX, RSS, targets
│   └── scoring/        # Importance, relevance
└── config/             # Audiences, catégories, plans
```

## Installation

### Prérequis

- Node.js >= 20.11.0
- pnpm >= 8.15.0
- PostgreSQL 15+
- Redis (pour le worker)

### Setup

```bash
# Cloner le repo
git clone <repo-url> veille-platform
cd veille-platform

# Installer les dépendances
pnpm install

# Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos valeurs

# Générer Prisma client
pnpm db:generate

# Créer la base de données
pnpm db:push

# Démarrer en développement
pnpm dev
```

### Services

| Service | URL | Description |
|---------|-----|-------------|
| Admin | http://localhost:3000 | Interface d'administration |
| API | http://localhost:3001 | API interne (swagger: /docs) |
| Public API | http://localhost:3002 | API publique lecture |
| Worker | Terminal séparé | Jobs asynchrones |

## Configuration

### Variables d'environnement

```bash
# Base de données
DATABASE_URL="postgresql://..."

# Authentification
AUTH_SECRET="your-secret-min-32-chars"

# IA (optionnel)
OPENAI_API_KEY=""
ANTHROPIC_API_KEY=""

# Stripe (optionnel)
STRIPE_SECRET_KEY=""
```

### Sources RSS

Les sources peuvent être configurées avec différentes fréquences:

- `MANUAL` - Import manuel
- `EVERY_15M` - Toutes les 15 minutes
- `HOURLY` - Toutes les heures
- `EVERY_6H` - Toutes les 6 heures
- `DAILY` - Une fois par jour
- `CUSTOM` - Cron personnalisé

### Audiences

- `GENERAL` - Grand public
- `PROFESSIONNELS` - Professionnels
- `ASSOCIATIONS` - Responsables d'associations
- `PARTICULIERS` - Particuliers
- `SENIORS` - Seniors
- `JEUNES` - Jeunes
- `ENTREPRISES` - Entreprises
- `INSTITUTIONS` - Institutions

## API

### API Interne (Fastify)

```bash
# Auth
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me

# Items
GET  /api/items
GET  /api/items/:id
PATCH /api/items/:id
POST /api/items/:id/approve
POST /api/items/:id/reject

# Stories
GET  /api/stories
POST /api/stories
GET  /api/stories/:id
PATCH /api/stories/:id
POST /api/stories/:id/publish

# Sources
GET  /api/sources
POST /api/sources
PATCH /api/sources/:id
POST /api/sources/:id/test
POST /api/sources/:id/enable
POST /api/sources/:id/disable

# Imports
POST /api/imports/rss/fetch
POST /api/imports/email
POST /api/imports/sms
POST /api/imports/manual

# Exports
GET  /api/exports/targets
POST /api/exports/build
```

### API Publique

```bash
GET /public/health
GET /public/news
GET /public/news/:slug
GET /public/categories
GET /public/tags
GET /public/alerts
GET /public/feed/rss
```

Filtres disponibles:
- `?audience=ASSOCIATIONS`
- `?category=arnaque`
- `?severity=HIGH`
- `?tag=cybersecurite`
- `?page=1&limit=20`

## Développement

```bash
# Lint
pnpm lint

# Typecheck
pnpm typecheck

# Build
pnpm build

# Database
pnpm db:generate    # Générer Prisma client
pnpm db:push        # Push schema
pnpm db:migrate     # Migrations
pnpm db:seed        # Seed data
pnpm db:studio      # Prisma Studio
```

## Structure de la base de données

### Entités principales

- **Workspace**: Espace de travail multi-tenant
- **User**: Utilisateurs avec rôles (OWNER, ADMIN, EDITOR, CURATOR, VIEWER)
- **Source**: Sources de contenu (RSS, email, etc.)
- **RawIngestion**: Contenus bruts ingérés
- **Item**: Articles unitaires traités
- **Story**: Stories consolidées multi-sources
- **PublicationTarget**: Cibles de publication (JSON, RSS, etc.)
- **MediaAsset**: Médias uploadés

### Entités IA

- **AiProvider**: Configuration des providers (OpenAI, Anthropic)
- **AiPrompt**: Prompts versionnés par tâche
- **AiTask**: Configuration des tâches (summarize, classify, etc.)
- **AiPolicy**: Règles d'application de l'IA
- **AiLog**: Logs d'exécution

### Entités Billing

- **Plan**: Plans disponibles (FREE, PREMIUM, ASSOCIATION, PRO, TEAM)
- **Subscription**: Abonnements actifs
- **PlanFeature**: Fonctionnalités par plan
- **FeatureFlag**: Flags par workspace

## Sécurité

- Rate limiting sur toutes les API
- Validation Zod systématique
- Protection SSRF sur les URLs externes
- Audit logs de toutes les actions
- Rôles et permissions
- CSP headers
- Quarantaine des contenus suspects

Voir [docs/security.md](docs/security.md) pour les détails.

## Accessibilité

- Conformité RGAA/WCAG
- Navigation 100% clavier
- Focus visibles
- Contrastes conformes
- Composants ARIA
- Support lecteur d'écran

## Roadmap

- [ ] UI de design system complète
- [ ] Intégration Stripe billing
- [ ] Webhooks sortants
- [ ] API GraphQL
- [ ] Multi-langues
- [ ] Rapports et analytics
- [ ] Collaboration en temps réel
- [ ] Mobile app

## Licence

Propriétaire - Tous droits réservés
