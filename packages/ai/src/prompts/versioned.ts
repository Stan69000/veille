import type { AiTaskType } from '../types/index.js';

export interface PromptVersion {
  version: number;
  systemPrompt: string;
  userPromptTemplate: string;
  createdAt: string;
  description: string;
  changelog?: string;
}

export interface PromptConfig {
  name: string;
  task: AiTaskType;
  versions: PromptVersion[];
  activeVersion: number;
}

export const PROMPT_REGISTRY: Record<AiTaskType, PromptConfig> = {
  SUMMARIZE_ITEM: {
    name: 'summarize-item',
    task: 'SUMMARIZE_ITEM',
    versions: [
      {
        version: 1,
        createdAt: '2024-01-01',
        description: 'Version initiale',
        systemPrompt: 'Tu es un assistant editorial expert en création de résumés concis et informatifs.',
        userPromptTemplate: `Résume le contenu suivant en français de manière claire et accessible.

Titre: {{title}}

Contenu:
{{content}}

Requisitos:
- Résumé de 2-3 phrases maximum
- Ton professionnel mais accessible
- Inclure les informations clés
- Pas de jugements de valeur

Réponds en JSON:
{
  "summary": "résumé principal",
  "summaryShort": "résumé en 1 phrase",
  "keyPoints": ["point 1", "point 2"],
  "confidence": 0.85
}`,
      },
      {
        version: 2,
        createdAt: '2024-06-01',
        description: 'Amélioration extraction key points',
        changelog: 'Meilleure extraction des points clés, ajout du summaryShort obligatoire',
        systemPrompt: 'Tu es un assistant editorial expert en création de résumés concis et informatifs. Tu dois identifier les informations les plus pertinentes pour les lecteurs.',
        userPromptTemplate: `Analyse et résume le contenu suivant.

TITRE: {{title}}
CONTENU: {{content}}
{{#if language}}LANGUE: {{language}}{{/if}}
{{#if sourceType}}TYPE DE SOURCE: {{sourceType}}{{/if}}

INSTRUCTIONS:
1. Extrais le résumé principal (2-3 phrases)
2. Fournis un summaryShort (1 phrase max)
3. Identifie 2-5 points clés
4. Évalue ta confiance (0-1)

FORMAT JSON OBLIGATOIRE:
\`\`\`json
{
  "summary": "résumé principal (2-3 phrases)",
  "summaryShort": "résumé ultra-court (1 phrase)",
  "keyPoints": ["point clé 1", "point clé 2", "point clé 3"],
  "confidence": 0.0-1.0
}
\`\`\``,
      },
    ],
    activeVersion: 2,
  },

  SUMMARIZE_STORY: {
    name: 'summarize-story',
    task: 'SUMMARIZE_STORY',
    versions: [
      {
        version: 1,
        createdAt: '2024-01-01',
        description: 'Version initiale',
        systemPrompt: 'Tu es un assistant editorial expert en consolidation de sujets multi-sources.',
        userPromptTemplate: `À partir des articles suivants concernant le même sujet, crée un résumé consolidé.

Sujet: {{title}}

Articles:
{{#each items}}
---
[{{publishedAt}}] {{title}}
{{summary}}
{{/each}}

Génère un JSON avec:
{
  "summary": "résumé consolidé",
  "whyItMatters": "pourquoi c'est important",
  "whatToDo": "ce qu'il faut faire",
  "whoIsConcerned": "qui est concerné",
  "severity": "INFO|LOW|MEDIUM|HIGH|CRITICAL"
}`,
      },
    ],
    activeVersion: 1,
  },

  CLASSIFY_CATEGORY: {
    name: 'classify-category',
    task: 'CLASSIFY_CATEGORY',
    versions: [
      {
        version: 1,
        createdAt: '2024-01-01',
        description: 'Version initiale',
        systemPrompt: 'Tu es un assistant de classification de contenu.',
        userPromptTemplate: `Classe le contenu dans une catégorie.

TITRE: {{title}}
CONTENU: {{content}}
{{#if existingCategories}}CATEGORIES EXISTANTES: {{existingCategories}}{{/if}}

FORMAT JSON:
{
  "category": "catégorie principale",
  "subcategory": "sous-catégorie (optionnel)",
  "confidence": 0.0-1.0,
  "alternatives": [{"category": "...", "confidence": 0.5}]
}`,
      },
    ],
    activeVersion: 1,
  },

  CLASSIFY_AUDIENCE: {
    name: 'classify-audience',
    task: 'CLASSIFY_AUDIENCE',
    versions: [
      {
        version: 1,
        createdAt: '2024-01-01',
        description: 'Version initiale',
        systemPrompt: 'Tu es un assistant de classification du public cible.',
        userPromptTemplate: `Identifie le(s) public(s) cible(s).

TITRE: {{title}}
CONTENU: {{content}}

AUDIENCES POSSIBLES:
- GENERAL: Grand public
- PROFESSIONNELS: Professionnels d'un secteur
- ASSOCIATIONS: Responsables d'associations
- PARTICULIERS: Particuliers
- SENIORS: Personnes âgées
- JEUNES: Jeunes et étudiants
- ENTREPRISES: Chefs d'entreprise
- INSTITUTIONS: Institutions publiques

FORMAT JSON:
{
  "audiences": ["PRINCIPAL", "SECONDAIRE"],
  "primary": "PRINCIPAL",
  "confidence": 0.0-1.0
}`,
      },
    ],
    activeVersion: 1,
  },

  DEDUPE_HINT: {
    name: 'dedupe-hint',
    task: 'DEDUPE_HINT',
    versions: [
      {
        version: 1,
        createdAt: '2024-01-01',
        description: 'Version initiale',
        systemPrompt: 'Tu es un assistant de détection de doublons.',
        userPromptTemplate: `Détermine si le nouvel article est un doublon.

NOUVEL ARTICLE:
- Titre: {{newItem.title}}
{{#if newItem.url}}- URL: {{newItem.url}}{{/if}}
{{#if newItem.publishedAt}}- Date: {{newItem.publishedAt}}{{/if}}
- Contenu: {{newItem.content}}

ARTICLES EXISTANTS:
{{#each existingItems}}
[{{id}}] {{title}}
{{/each}}

FORMAT JSON:
{
  "isDuplicate": true/false,
  "originalId": "id si doublon",
  "similarity": 0.0-1.0,
  "reason": "explication"
}`,
      },
    ],
    activeVersion: 1,
  },

  CLUSTER_HINT: {
    name: 'cluster-hint',
    task: 'CLUSTER_HINT',
    versions: [
      {
        version: 1,
        createdAt: '2024-01-01',
        description: 'Version initiale',
        systemPrompt: 'Tu es un assistant de regroupement de sujets.',
        userPromptTemplate: `Groupe les articles par sujet.

ARTICLES:
{{#each items}}
[{{id}}] {{title}}
{{#if url}}URL: {{url}}{{/if}}
Résumé: {{summary}}
{{/each}}

FORMAT JSON:
{
  "clusters": [
    {
      "topic": "nom du sujet",
      "itemIds": ["id1", "id2"]
    }
  ]
}`,
      },
    ],
    activeVersion: 1,
  },

  EXTRACT_ACTIONS: {
    name: 'extract-actions',
    task: 'EXTRACT_ACTIONS',
    versions: [
      {
        version: 1,
        createdAt: '2024-01-01',
        description: 'Version initiale',
        systemPrompt: 'Tu es un assistant d\'extraction d\'actions concrètes.',
        userPromptTemplate: `Extrait les actions concrètes.

CONTENU: {{content}}

TYPES D'ACTIONS: read, sign, share, contact, donate, participate, learn, other
{{#if audience}}AUDIENCE: {{audience}}{{/if}}

FORMAT JSON:
{
  "actions": [
    {"type": "type", "description": "description", "urgency": "low|medium|high"}
  ],
  "whatToDo": "résumé des actions"
}`,
      },
    ],
    activeVersion: 1,
  },

  REWRITE_PUBLIC: {
    name: 'rewrite-public',
    task: 'REWRITE_PUBLIC',
    versions: [
      {
        version: 1,
        createdAt: '2024-01-01',
        description: 'Version initiale',
        systemPrompt: 'Tu es un assistant de réécriture accessible.',
        userPromptTemplate: `Réécris pour le grand public.

TITRE: {{title}}
CONTENU: {{content}}
AUDIENCE: {{audience}}
TON: {{tone}}

FORMAT JSON:
{
  "title": "titre adapté",
  "summary": "résumé accessible",
  "seoTitle": "titre SEO",
  "seoDescription": "description SEO"
}`,
      },
    ],
    activeVersion: 1,
  },

  REWRITE_ASSOCIATION: {
    name: 'rewrite-association',
    task: 'REWRITE_ASSOCIATION',
    versions: [
      {
        version: 1,
        createdAt: '2024-01-01',
        description: 'Version initiale',
        systemPrompt: 'Tu es un assistant de rédaction pour associations.',
        userPromptTemplate: `Adapte pour les responsables d'associations.

TITRE: {{title}}
CONTENU: {{content}}

FORMAT JSON:
{
  "title": "titre adapté",
  "summary": "résumé pour associations",
  "implications": "implications pour les associations",
  "recommendedActions": ["action 1", "action 2"]
}`,
      },
    ],
    activeVersion: 1,
  },

  GENERATE_SEO: {
    name: 'generate-seo',
    task: 'GENERATE_SEO',
    versions: [
      {
        version: 1,
        createdAt: '2024-01-01',
        description: 'Version initiale',
        systemPrompt: 'Tu es un expert SEO.',
        userPromptTemplate: `Génère l'optimisation SEO.

TITRE: {{title}}
CONTENU: {{content}}
{{#if keywords}}KEYWORDS: {{keywords}}{{/if}}
MAX TITRE: {{maxTitleLength}} caractères
MAX DESCRIPTION: {{maxDescriptionLength}} caractères

FORMAT JSON:
{
  "seoTitle": "titre SEO",
  "seoDescription": "description SEO",
  "keywords": ["keyword1", "keyword2"]
}`,
      },
    ],
    activeVersion: 1,
  },

  DETECT_PHISHING: {
    name: 'detect-phishing',
    task: 'DETECT_PHISHING',
    versions: [
      {
        version: 1,
        createdAt: '2024-01-01',
        description: 'Version initiale',
        systemPrompt: 'Tu es un expert en sécurité et détection de phishing.',
        userPromptTemplate: `Analyse le contenu pour détecter du phishing.

{{#if url}}URL: {{url}}{{/if}}
{{#if sourceDomain}}DOMAINE: {{sourceDomain}}{{/if}}
TITRE: {{title}}
CONTENU: {{content}}

SIGNaux À RECHERCHER:
- Urgence excessive
- Demande d'informations personnelles
- Liens suspects
- Fautes d'orthographe
- Promesses irréalistes
- Imitation de marques

FORMAT JSON:
{
  "isPhishing": true/false,
  "confidence": 0.0-1.0,
  "signals": [
    {"type": "type", "description": "desc", "severity": "low|medium|high"}
  ],
  "recommendation": "recommandation"
}`,
      },
    ],
    activeVersion: 1,
  },

  GENERATE_EDITORIAL: {
    name: 'generate-editorial',
    task: 'GENERATE_EDITORIAL',
    versions: [
      {
        version: 1,
        createdAt: '2024-06-01',
        description: 'Version initiale - génération éditoriale complète',
        systemPrompt: 'Tu es un assistant editorial expert en veille информационная. Tu génères des synthèses éditoriales de haute qualité pour des professionnels.',
        userPromptTemplate: `Génère une synthèse éditoriale complète.

TITRE: {{title}}
{{#if summaryPublic}}RÉSUMÉ EXISTANT: {{summaryPublic}}{{/if}}
CONTENU: {{content}}
{{#if sourceName}}SOURCE: {{sourceName}}{{/if}}
{{#if category}}CATÉGORIE: {{category}}{{/if}}

INSTRUCTIONS:
1. summaryShort: 1 phrase concise
2. summaryPublic: 2-3 phrases accessibles à tous
3. whyItMatters: Pourquoi c'est important (1-2 phrases)
4. whatToDo: Actions concrètes recommandées (1-2 phrases)
5. whoIsConcerned: Publics concernés (1-2 phrases)

FORMAT JSON:
\`\`\`json
{
  "summaryShort": "une phrase concise",
  "summaryPublic": "2-3 phrases accessibles",
  "whyItMatters": "pourquoi c'est important",
  "whatToDo": "actions recommandées",
  "whoIsConcerned": "publics concernés"
}
\`\`\``,
      },
    ],
    activeVersion: 1,
  },
};

export function getActivePrompt(task: AiTaskType): PromptVersion {
  const config = PROMPT_REGISTRY[task];
  return config.versions.find((v) => v.version === config.activeVersion) || config.versions[0];
}

export function getPromptByVersion(task: AiTaskType, version: number): PromptVersion | undefined {
  return PROMPT_REGISTRY[task].versions.find((v) => v.version === version);
}

export function getAllPromptVersions(task: AiTaskType): PromptVersion[] {
  return PROMPT_REGISTRY[task].versions;
}
