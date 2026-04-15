import type { FastifyPluginAsync } from 'fastify';
import { storiesQuerySchema, parseCommaSeparated } from '../lib/schemas';
import { notFoundError } from '../lib/error-handler';

const mockStories = [
  {
    id: 'story-1',
    title: 'Crise énergétique en Europe',
    description: 'Rassemblement des articles sur la crise énergétique européenne',
    status: 'published',
    publishedAt: '2024-01-15T10:00:00Z',
    items: [
      {
        id: '1',
        title: 'Nouvelle réglementation sur les données personnelles',
        url: 'https://example.com/article/1',
        source: 'Le Monde',
        publishedAt: '2024-01-15T10:30:00Z',
        summaryShort: 'Résumé regulation',
        tags: ['Énergie', 'Europe'],
        audience: ['Entreprises'],
      },
      {
        id: '2',
        title: 'Lancement du programme de transition écologique',
        url: 'https://example.com/article/2',
        source: 'Les Échos',
        publishedAt: '2024-01-15T09:45:00Z',
        summaryShort: 'Green Deal',
        tags: ['Environnement', 'Europe'],
        audience: ['Entreprises', 'ONG'],
      },
    ],
    tags: ['Énergie', 'Europe', 'Green Deal'],
    audience: ['Entreprises', 'ONG', 'Gouvernements'],
    summary: 'Une analyse complète de la crise énergétique européenne et ses implications.',
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-15T12:00:00Z',
  },
  {
    id: 'story-2',
    title: 'Réforme des retraites',
    description: 'Couverture de la réforme des retraites française',
    status: 'in_progress',
    items: [
      {
        id: '3',
        title: 'Interview exclusif sur les retraites',
        url: 'https://example.com/article/3',
        source: 'Challenges',
        publishedAt: '2024-01-14T14:00:00Z',
        summaryShort: 'Interview réforme',
        tags: ['Retraites', 'Politique'],
        audience: ['Particuliers', 'Entreprises'],
      },
    ],
    tags: ['Retraites', 'Politique', 'France'],
    audience: ['Particuliers', 'Entreprises'],
    summary: 'Couverture continue de la réforme des retraites.',
    createdAt: '2024-01-12T10:00:00Z',
    updatedAt: '2024-01-14T14:00:00Z',
  },
];

function filterStories(stories: typeof mockStories, query: {
  audience?: string;
  audiences?: string;
  tag?: string;
  tags?: string;
  status?: string;
  q?: string;
}) {
  let filtered = [...stories];

  const audiences = parseCommaSeparated(query.audiences || query.audience);
  if (audiences.length > 0) {
    filtered = filtered.filter((story) =>
      audiences.some((a) => story.audience.includes(a))
    );
  }

  const tags = parseCommaSeparated(query.tags || query.tag);
  if (tags.length > 0) {
    filtered = filtered.filter((story) =>
      tags.some((t) => story.tags.includes(t))
    );
  }

  if (query.status) {
    filtered = filtered.filter((story) => story.status === query.status);
  }

  if (query.q) {
    const search = query.q.toLowerCase();
    filtered = filtered.filter(
      (story) =>
        story.title.toLowerCase().includes(search) ||
        story.description?.toLowerCase().includes(search) ||
        story.tags.some((t) => t.toLowerCase().includes(search))
    );
  }

  return filtered;
}

export const storiesRoutes: FastifyPluginAsync = async (app) => {
  app.get('/', async (request, reply) => {
    const queryResult = storiesQuerySchema.safeParse(request.query);

    if (!queryResult.success) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Invalid query parameters',
        details: queryResult.error.errors,
      });
    }

    const { page = 1, limit = 20, ...filters } = queryResult.data;

    let stories = filterStories(mockStories, filters);

    const total = stories.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginatedStories = stories.slice(offset, offset + limit);

    return {
      data: paginatedStories,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  });

  app.get('/by-audience/:audience', async (request, reply) => {
    const { audience } = request.params as { audience: string };

    const stories = filterStories(mockStories, { audience });

    return {
      data: stories,
      audience,
      count: stories.length,
    };
  });

  app.get('/by-tag/:tag', async (request, reply) => {
    const { tag } = request.params as { tag: string };

    const stories = filterStories(mockStories, { tag });

    return {
      data: stories,
      tag,
      count: stories.length,
    };
  });

  app.get('/published', async () => {
    const stories = mockStories.filter((story) => story.status === 'published');

    return {
      data: stories,
      count: stories.length,
    };
  });

  app.get('/in-progress', async () => {
    const stories = mockStories.filter((story) => story.status === 'in_progress');

    return {
      data: stories,
      count: stories.length,
    };
  });

  app.get('/audiences', async () => {
    const audiences = [...new Set(mockStories.flatMap((story) => story.audience))].sort();

    return {
      data: audiences.map((audience) => ({
        name: audience,
        slug: audience.toLowerCase().replace(/\s+/g, '-'),
        count: mockStories.filter((story) => story.audience.includes(audience)).length,
      })),
      total: audiences.length,
    };
  });

  app.get('/tags', async () => {
    const tags = [...new Set(mockStories.flatMap((story) => story.tags))].sort();

    return {
      data: tags.map((tag) => ({
        name: tag,
        slug: tag.toLowerCase().replace(/\s+/g, '-'),
        count: mockStories.filter((story) => story.tags.includes(tag)).length,
      })),
      total: tags.length,
    };
  });

  app.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    const story = mockStories.find((story) => story.id === id);

    if (!story) {
      throw notFoundError('Story');
    }

    return { data: story };
  });
};
