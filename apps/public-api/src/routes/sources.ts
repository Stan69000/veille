import type { FastifyPluginAsync } from 'fastify';
import { notFoundError } from '../lib/error-handler';

const mockSources = [
  {
    id: 'le-monde',
    name: 'Le Monde',
    url: 'https://www.lemonde.fr',
    feedUrl: 'https://www.lemonde.fr/rss/une.xml',
    description: 'Le journal de référence français',
    category: 'Presse nationale',
    language: 'fr',
    enabled: true,
    lastFetchedAt: '2024-01-15T10:00:00Z',
    itemCount: 1245,
    tags: ['Politique', 'Société', 'Économie'],
    audience: ['Grand public', 'Entreprises'],
  },
  {
    id: 'les-echos',
    name: 'Les Échos',
    url: 'https://www.lesechos.fr',
    feedUrl: 'https://www.lesechos.fr/rss/une.xml',
    description: 'Le premier quotidien économique français',
    category: 'Économie',
    language: 'fr',
    enabled: true,
    lastFetchedAt: '2024-01-15T09:30:00Z',
    itemCount: 892,
    tags: ['Économie', 'Finance', 'Business'],
    audience: ['Entreprises', 'Finance'],
  },
  {
    id: '01net',
    name: '01net',
    url: 'https://www.01net.com',
    feedUrl: 'https://www.01net.com/rss.xml',
    description: 'Actualités high-tech et innovations',
    category: 'Tech',
    language: 'fr',
    enabled: true,
    lastFetchedAt: '2024-01-15T08:00:00Z',
    itemCount: 567,
    tags: ['Tech', 'Innovation', 'Digital'],
    audience: ['DSI', 'Développeurs', 'Tech'],
  },
  {
    id: 'challenges',
    name: 'Challenges',
    url: 'https://www.challenges.fr',
    feedUrl: 'https://www.challenges.fr/rss.xml',
    description: 'Le magazine économique et business',
    category: 'Économie',
    language: 'fr',
    enabled: false,
    lastFetchedAt: null,
    itemCount: 0,
    tags: ['Business', 'Management'],
    audience: ['Entreprises', 'Cadres'],
  },
];

export const sourcesRoutes: FastifyPluginAsync = async (app) => {
  app.get('/', async (request) => {
    const { enabled, category, language, q } = request.query as {
      enabled?: string;
      category?: string;
      language?: string;
      q?: string;
    };

    let sources = [...mockSources];

    if (enabled !== undefined) {
      sources = sources.filter((s) => s.enabled === (enabled === 'true'));
    }

    if (category) {
      sources = sources.filter(
        (s) => s.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (language) {
      sources = sources.filter((s) => s.language === language);
    }

    if (q) {
      const search = q.toLowerCase();
      sources = sources.filter(
        (s) =>
          s.name.toLowerCase().includes(search) ||
          s.description?.toLowerCase().includes(search)
      );
    }

    return {
      data: sources,
      total: sources.length,
    };
  });

  app.get('/categories', async () => {
    const categories = [...new Set(mockSources.map((s) => s.category))].sort();

    return {
      data: categories.map((category) => ({
        name: category,
        slug: category.toLowerCase().replace(/\s+/g, '-'),
        count: mockSources.filter((s) => s.category === category).length,
      })),
      total: categories.length,
    };
  });

  app.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    const source = mockSources.find((source) => source.id === id);

    if (!source) {
      throw notFoundError('Source');
    }

    return { data: source };
  });

  app.get('/:id/feed', async (request, reply) => {
    const { id } = request.params as { id: string };

    const source = mockSources.find((source) => source.id === id);

    if (!source) {
      throw notFoundError('Source');
    }

    if (!source.feedUrl) {
      return reply.status(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: 'No RSS feed available for this source',
      });
    }

    return {
      data: {
        sourceId: source.id,
        sourceName: source.name,
        feedUrl: source.feedUrl,
        lastFetchedAt: source.lastFetchedAt,
        itemCount: source.itemCount,
      },
    };
  });

  app.get('/:id/stats', async (request, reply) => {
    const { id } = request.params as { id: string };

    const source = mockSources.find((source) => source.id === id);

    if (!source) {
      throw notFoundError('Source');
    }

    return {
      data: {
        sourceId: source.id,
        sourceName: source.name,
        totalItems: source.itemCount,
        lastFetchedAt: source.lastFetchedAt,
        enabled: source.enabled,
        avgItemsPerDay: Math.round(source.itemCount / 30),
        tags: source.tags,
        audience: source.audience,
      },
    };
  });
};
