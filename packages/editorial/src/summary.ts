import type { EditorialSummary, EditorialContext, GenerateOptions } from './types/index.js';
import { DEFAULT_MAX_CHARS } from './types/index.js';
import {
  extractFirstParagraph,
  truncate,
  capitalizeFirst,
  extractSubject,
  identifyEntities,
  extractAction,
} from './utils.js';

export function generateSummaryShort(ctx: EditorialContext, maxChars?: number): string {
  const max = maxChars || DEFAULT_MAX_CHARS.summaryShort;
  
  if (ctx.excerpt) {
    return truncate(ctx.excerpt, max);
  }

  const firstPara = extractFirstParagraph(ctx.content);
  return truncate(firstPara, max);
}

export function generateSummaryPublic(
  ctx: EditorialContext,
  maxChars?: number
): string {
  const max = maxChars || DEFAULT_MAX_CHARS.summaryPublic;
  
  const subject = extractSubject(ctx.title);
  const firstPara = extractFirstParagraph(ctx.content);
  
  if (!subject) {
    return truncate(firstPara, max);
  }

  const summary = `${capitalizeFirst(subject)} ${firstPara}`;
  return truncate(summary, max);
}

export function generateWhyItMatters(
  ctx: EditorialContext,
  maxChars?: number
): string {
  const max = maxChars || DEFAULT_MAX_CHARS.whyItMatters;
  const { topics } = identifyEntities(ctx.content);
  
  const subject = extractSubject(ctx.title);
  const action = extractAction(ctx.content);

  let reasons: string[] = [];

  if (topics.length > 0) {
    reasons.push(`Cette actualité concerne le domaine ${topics[0]}`);
  }

  if (action) {
    reasons.push(`Cette décision ${action}e des changements significatifs`);
  }

  if (ctx.sourceName) {
    reasons.push(`La source ${ctx.sourceName} est considérée comme fiable`);
  }

  if (reasons.length === 0) {
    reasons.push(`Cette information mérite votre attention`);
    reasons.push(`Elle pourrait avoir des implications importantes`);
  }

  const result = reasons.join('. ');
  return truncate(result, max);
}

export function generateWhatToDo(
  ctx: EditorialContext,
  maxChars?: number
): string {
  const max = maxChars || DEFAULT_MAX_CHARS.whatToDo;
  
  const action = extractAction(ctx.content);
  const { topics } = identifyEntities(ctx.content);

  const actions: string[] = [];

  if (action) {
    actions.push(`Suivre l'évolution de cette situation`);
  }

  if (topics.includes('technologie') || topics.includes('digital')) {
    actions.push(`Vérifier la compatibilité avec vos systèmes`);
    actions.push(`Considérer une période de transition`);
  }

  if (topics.includes('finance') || topics.includes('économie')) {
    actions.push(`Évaluer l'impact financier potentiel`);
    actions.push(`Consulter un expert si nécessaire`);
  }

  actions.push(`Rester informé des développements`);
  actions.push(`Partager cette information avec les parties prenantes`);

  const result = actions.join('. ');
  return truncate(result, max);
}

export function generateWhoIsConcerned(
  ctx: EditorialContext,
  maxChars?: number
): string {
  const max = maxChars || DEFAULT_MAX_CHARS.whoIsConcerned;
  const { topics } = identifyEntities(ctx.content);

  const audiences: string[] = [];

  if (topics.includes('technologie') || topics.includes('digital')) {
    audiences.push('les professionnels IT');
    audiences.push('les responsables数字化');
    audiences.push('les utilisateurs de technologies');
  }

  if (topics.includes('santé')) {
    audiences.push('les professionnels de santé');
    audiences.push('les patients');
  }

  if (topics.includes('finance') || topics.includes('économie')) {
    audiences.push('les acteurs financiers');
    audiences.push('les entrepreneurs');
  }

  if (topics.includes('politique')) {
    audiences.push('les décideurs');
    audiences.push('les citoyens');
  }

  if (audiences.length === 0) {
    audiences.push('les professionnels du secteur concerné');
    audiences.push('toute personne touchée par ce sujet');
  }

  const result = audiences.join(', ');
  return truncate(result, max);
}

export function generateEditorialSummary(
  ctx: EditorialContext,
  options: GenerateOptions = {}
): EditorialSummary {
  const maxChars = {
    ...DEFAULT_MAX_CHARS,
    ...options.maxChars,
  };

  return {
    summaryShort: generateSummaryShort(ctx, maxChars.summaryShort),
    summaryPublic: generateSummaryPublic(ctx, maxChars.summaryPublic),
    whyItMatters: generateWhyItMatters(ctx, maxChars.whyItMatters),
    whatToDo: generateWhatToDo(ctx, maxChars.whatToDo),
    whoIsConcerned: generateWhoIsConcerned(ctx, maxChars.whoIsConcerned),
  };
}
