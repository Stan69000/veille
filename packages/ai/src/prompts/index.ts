import type { AiTaskType } from '@core/types';

export interface PromptTemplate {
  name: string;
  task: AiTaskType;
  version: number;
  systemPrompt?: string;
  userPromptTemplate: string;
  description?: string;
}

export const DEFAULT_PROMPTS: Record<AiTaskType, PromptTemplate> = {
  SUMMARIZE_ITEM: {
    name: 'summarize-item-default',
    task: 'SUMMARIZE_ITEM',
    version: 1,
    systemPrompt: 'Tu es un assistant editorial expert en création de résumés concis et informatifs.',
    userPromptTemplate: `Résume le contenu suivant en français de manière claire et accessible.

Titre: {{title}}

Contenu:
{{content}}

Requisitos:
- Résumé de 2-3 phrases maximum
- Ton professionnel mais accessible
- Inclure les informations clés
- Pas de jugements de valeur`,
    description: 'Résumé court pour un article',
  },

  SUMMARIZE_STORY: {
    name: 'summarize-story-default',
    task: 'SUMMARIZE_STORY',
    version: 1,
    systemPrompt: 'Tu es un assistant editorial expert en consolidation de sujets multi-sources.',
    userPromptTemplate: `À partir des articles suivants concernant le même sujet, crée un résumé consolidé.

Sujet: {{title}}

Articles:
{{#each items}}
---
[{{publishedAt}}] {{title}}
{{summary}}
{{/each}}

Génère:
1. Un résumé consolidé (2-3 phrases)
2. Pourquoi c'est important ("whyItMatters")
3. Ce qu'il faut faire ("whatToDo") si applicable
4. Qui est concerné ("whoIsConcerned") si applicable
5. La sévérité (INFO, LOW, MEDIUM, HIGH, CRITICAL)`,
    description: 'Résumé consolidé pour une story',
  },

  CLASSIFY_CATEGORY: {
    name: 'classify-category-default',
    task: 'CLASSIFY_CATEGORY',
    version: 1,
    systemPrompt: 'Tu es un assistant de classification de contenu.',
    userPromptTemplate: `Classe le contenu suivant dans une catégorie appropriée.

Titre: {{title}}

Contenu:
{{content}}

Catégories disponibles:
{{#each existingCategories}}
- {{this}}
{{/each}}

Réponds avec la catégorie la plus appropriée et une sous-catégorie si pertinent.`,
    description: 'Classification de catégorie',
  },

  CLASSIFY_AUDIENCE: {
    name: 'classify-audience-default',
    task: 'CLASSIFY_AUDIENCE',
    version: 1,
    systemPrompt: 'Tu es un assistant de classification du public cible.',
    userPromptTemplate: `Identifie le(s) public(s) cible(s) pour le contenu suivant.

Titre: {{title}}

Contenu:
{{content}}

Audiences possibles:
- GENERAL: Grand public
- PROFESSIONNELS: Professionnels d'un secteur
- ASSOCIATIONS: Responsables d'associations
- PARTICULIERS: Particuliers
- SENIORS: Personnes âgées
- JEUNES: Jeunes et étudiants
- ENTREPRISES: Chefs d'entreprise
- INSTITUTIONS: Institutions publiques

Réponds avec l'audience principale et les audiences secondaires si pertinent.`,
    description: 'Classification audience',
  },

  DEDUPE_HINT: {
    name: 'dedupe-hint-default',
    task: 'DEDUPE_HINT',
    version: 1,
    systemPrompt: 'Tu es un assistant de détection de doublons.',
    userPromptTemplate: `Détermine si le nouvel article est un doublon d'un article existant.

Nouvel article:
Titre: {{newItem.title}}
{{#if newItem.url}}URL: {{newItem.url}}{{/if}}
{{#if newItem.publishedAt}}Date: {{newItem.publishedAt}}{{/if}}
Contenu: {{newItem.content}}

Articles existants:
{{#each existingItems}}
---
[{{id}}] {{title}}
{{#if url}}URL: {{url}}{{/if}}
Contenu: {{content}}
{{/each}}

Indique si c'est un doublon et pourquoi.`,
    description: 'Détection de doublons',
  },

  CLUSTER_HINT: {
    name: 'cluster-hint-default',
    task: 'CLUSTER_HINT',
    version: 1,
    systemPrompt: 'Tu es un assistant de regroupement de sujets.',
    userPromptTemplate: `Groupe les articles suivants par sujet.

Articles:
{{#each items}}
---
[{{id}}] {{title}}
{{#if url}}URL: {{url}}{{/if}}
{{#if publishedAt}}Date: {{publishedAt}}{{/if}}
Résumé: {{summary}}
{{/each}}

Identifie les regroupements logiques et les articles qui traitent du même sujet.`,
    description: 'Regroupement en stories',
  },

  EXTRACT_ACTIONS: {
    name: 'extract-actions-default',
    task: 'EXTRACT_ACTIONS',
    version: 1,
    systemPrompt: 'Tu es un assistant d\'extraction d\'actions concrètes.',
    userPromptTemplate: `Extrait les actions concrètes recommandées dans le contenu.

Contenu:
{{content}}

Types d'actions possibles:
- read: Lire/commenter un article
- sign: Signer une petition
- share: Partager l'information
- contact: Contacter un organisme
- donate: Faire un don
- participate: Participer à un événement
- learn: S'informer davantage
- other: Autre

Génère la liste des actions et ce qu'il faut faire concrètement.`,
    description: 'Extraction actions à mener',
  },

  REWRITE_PUBLIC: {
    name: 'rewrite-public-default',
    task: 'REWRITE_PUBLIC',
    version: 1,
    systemPrompt: 'Tu es un assistant de réécriture accessible.',
    userPromptTemplate: `Réécris le contenu suivant pour le rendre accessible au grand public.

Contenu original:
Titre: {{title}}
{{content}}

Public cible: {{audience}}
Ton: {{tone}}

Génère:
1. Un titre adapté
2. Un résumé accessible (3-4 phrases)
3. Optionnel: Un titre SEO et une description SEO`,
    description: 'Réécriture grand public',
  },

  REWRITE_ASSOCIATION: {
    name: 'rewrite-association-default',
    task: 'REWRITE_ASSOCIATION',
    version: 1,
    systemPrompt: 'Tu es un assistant de rédaction pour associations.',
    userPromptTemplate: `Adapte le contenu suivant pour les responsables d\'associations.

Contenu original:
Titre: {{title}}
{{content}}

Génère:
1. Un titre adapté
2. Un résumé pour responsables d\'associations
3. Les implications pour les associations
4. Des actions concrètes recommandées`,
    description: 'Réécriture pour associations',
  },

  GENERATE_SEO: {
    name: 'generate-seo-default',
    task: 'GENERATE_SEO',
    version: 1,
    systemPrompt: 'Tu es un expert SEO.',
    userPromptTemplate: `Génère une optimisation SEO pour le contenu suivant.

Titre: {{title}}
Contenu: {{content}}
{{#if keywords}}Keywords: {{keywords}}{{/if}}

Contraintes:
- Titre SEO: max {{maxTitleLength}} caractères
- Description SEO: max {{maxDescriptionLength}} caractères
- Inclure les mots-clés naturellement`,
    description: 'Génération SEO',
  },

  DETECT_PHISHING: {
    name: 'detect-phishing-default',
    task: 'DETECT_PHISHING',
    version: 1,
    systemPrompt: 'Tu es un expert en sécurité informatique et détection de phishing.',
    userPromptTemplate: `Analyse le contenu suivant pour détecter d\'éventuels signaux de phishing.

{{#if url}}URL suspecte: {{url}}{{/if}}
{{#if sourceDomain}}Domaine source: {{sourceDomain}}{{/if}}

Titre: {{title}}
Contenu:
{{content}}

Signaux à rechercher:
- Urgence excessive
- Demande d\'informations personnelles
- Liens suspects
- Fautes d\'orthographe
- Promesses irréalistes
- Imitation de marques connues

Donne un verdict et les signaux détectés.`,
    description: 'Détection phishing',
  },
};

export function renderPrompt(
  template: string,
  variables: Record<string, unknown>
): string {
  let result = template;

  result = result.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const value = variables[key];
    return value !== undefined ? String(value) : `{{${key}}}`;
  });

  const eachRegex = /\{\{#each (\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g;
  result = result.replace(eachRegex, (_, arrayKey, blockContent) => {
    const array = variables[arrayKey];
    if (!Array.isArray(array)) return '';
    
    return array
      .map((item, index) => {
        let block = blockContent;
        
        if (typeof item === 'object' && item !== null) {
          block = block.replace(/\{\{(\w+)\}\}/g, (_, propKey) => {
            const val = (item as Record<string, unknown>)[propKey];
            return val !== undefined ? String(val) : `{{${propKey}}}`;
          });
        }
        
        return block;
      })
      .join('');
  });

  const ifRegex = /\{\{#if (\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g;
  result = result.replace(ifRegex, (_, key, blockContent) => {
    const value = variables[key];
    return value !== undefined && value !== null && value !== '' ? blockContent : '';
  });

  return result;
}

export function getPrompt(task: AiTaskType): PromptTemplate {
  return DEFAULT_PROMPTS[task];
}

export function buildMessages(
  prompt: PromptTemplate,
  variables: Record<string, unknown>
): Array<{ role: 'system' | 'user' | 'assistant'; content: string }> {
  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];

  if (prompt.systemPrompt) {
    messages.push({
      role: 'system',
      content: prompt.systemPrompt,
    });
  }

  const userContent = renderPrompt(prompt.userPromptTemplate, variables);
  messages.push({
    role: 'user',
    content: userContent,
  });

  return messages;
}
