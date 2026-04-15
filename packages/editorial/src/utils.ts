export function extractFirstParagraph(text: string | null | undefined): string {
  if (!text) return '';
  
  const cleaned = text
    .replace(/\s+/g, ' ')
    .trim();

  const sentences = cleaned.split(/[.!?]+/).filter((s) => s.trim().length > 20);
  
  if (sentences.length === 0) return cleaned.slice(0, 200);
  
  const first = sentences[0].trim();
  return first.length > 50 ? first : sentences.slice(0, 2).join('. ').trim();
}

export function extractKeySentences(text: string, count = 3): string[] {
  if (!text) return [];

  const sentences = text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 30);

  const scored = sentences.map((s) => {
    let score = 0;
    
    if (s.length > 50 && s.length < 200) score += 2;
    
    const importantWords = [
      'annonce', 'dévoile', 'lance', 'met', 'annonce',
      'declare', 'reveals', 'launches', 'unveils',
      'critical', 'urgent', 'important', 'essentiel',
      'nouveau', 'nouvelle', 'premier', 'dernier',
    ];
    const lower = s.toLowerCase();
    for (const word of importantWords) {
      if (lower.includes(word)) score += 1;
    }

    return { sentence: s, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map((s) => s.sentence);
}

export function truncate(text: string, maxLength: number, suffix = '...'): string {
  if (text.length <= maxLength) return text;
  
  const truncated = text.slice(0, maxLength - suffix.length);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace > maxLength * 0.7) {
    return truncated.slice(0, lastSpace) + suffix;
  }
  
  return truncated + suffix;
}

export function capitalizeFirst(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function extractSubject(text: string): string {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  
  const patterns = [
    /^Le\s+(.+?)\s+(annonce|lance|présente|dévoile)/i,
    /^La\s+(.+?)\s+(annonce|lance|présente|dévoile)/i,
    /^Les?\s+(.+?)\s+(annonce|lance|présente|dévoile)/i,
    /^(.+?)\s+(annonce|lance|présente|dévoile)/i,
  ];

  for (const pattern of patterns) {
    const match = cleaned.match(pattern);
    if (match) return match[1].trim();
  }

  return cleaned.split(/[,;]/)[0].trim();
}

export function identifyEntities(text: string): {
  organizations: string[];
  topics: string[];
} {
  const topics: string[] = [];
  
  const topicIndicators = [
    'technologie', 'santé', 'finance', 'politique', 'économie',
    'environnement', 'éducation', 'sécurité', 'innovation',
    'digital', 'numérique', 'ia', 'intelligence artificielle',
    'cybersécurité', 'data', 'cloud', 'mobile',
  ];

  const lower = text.toLowerCase();
  for (const topic of topicIndicators) {
    if (lower.includes(topic)) {
      topics.push(topic);
    }
  }

  return {
    organizations: [],
    topics,
  };
}

export function extractAction(text: string): string | null {
  const actionPatterns = [
    /(?:annonce|lance|dévoile|présente|met en place|instaure|lance)/i,
    /(?:interdit|bannit|restreint|limite)/i,
    /(?:investit|alloue|budgetise)/i,
    /(?:négocie|discuter|conclut)/i,
  ];

  for (const pattern of actionPatterns) {
    const match = text.match(pattern);
    if (match) return match[0].toLowerCase();
  }

  return null;
}
