import type { FastifyPluginAsync } from 'fastify';
import { feedsQuerySchema, parseCommaSeparated } from '../lib/schemas';
import { notFoundError } from '../lib/error-handler';
import {
  exportItemsToJSON,
  exportItemsToMDX,
  exportItemsToRSS,
  exportStoryToMDX,
  exportStoryToRSS,
  type ItemExport,
} from '@veilles-platform/export';

const mockItems: ItemExport[] = [
  {
    id: '1',
    title: 'Nouvelle réglementation sur les données personnelles entre en vigueur',
    url: 'https://example.com/article/1',
    source: 'Le Monde',
    publishedAt: '2024-01-15T10:30:00Z',
    summary: 'Un résumé complet de la nouvelle réglementation...',
    summaryShort: 'Résumé de la regulation RGPD 2.0',
    summaryPublic: 'La nouvelle réglementation sur les données personnelles entre en vigueur ce mois.',
    whyItMatters: 'Impact sur toutes les entreprises traitant des données européennes.',
    whatToDo: 'Mettre à jour vos politiques de confidentialité.',
    whoIsConcerned: 'Entreprises, Startups, DPO',
    tags: ['RGPD', 'Vie privée'],
    audience: ['Entreprises', 'DPO', 'Développeurs'],
    categories: ['Politique'],
    score: 0.92,
    status: 'approved',
  },
  {
    id: '2',
    title: 'Lancement du programme de transition écologique européen',
    url: 'https://example.com/article/2',
    source: 'Les Échos',
    publishedAt: '2024-01-15T09:45:00Z',
    summaryShort: 'European Green Deal launched',
    summaryPublic: 'Le programme de transition écologique européen a été lancé.',
    tags: ['Environnement', 'Europe', 'Énergie'],
    audience: ['Entreprises', 'ONG'],
    categories: ['Environnement'],
    score: 0.78,
    status: 'approved',
  },
  {
    id: '3',
    title: 'Cybersécurité : les nouvelles menaces pour 2024',
    url: 'https://example.com/article/3',
    source: '01net',
    publishedAt: '2024-01-15T08:20:00Z',
    summaryShort: 'Nouvelles menaces cyber en 2024',
    summaryPublic: 'Les nouvelles menaces cybernétiques pour 2024 sont identifiées.',
    tags: ['Cybersécurité', 'IT', 'Tech'],
    audience: ['DSI', 'Développeurs', 'RSSI'],
    categories: ['Technologie'],
    score: 0.65,
    status: 'pending',
  },
];

function filterItems(items: ItemExport[], query: {
  audience?: string;
  audiences?: string;
  tag?: string;
  tags?: string;
  limit?: number;
}) {
  let filtered = [...items];

  const audiences = parseCommaSeparated(query.audiences || query.audience);
  if (audiences.length > 0) {
    filtered = filtered.filter((item) =>
      audiences.some((a) => item.audience.includes(a))
    );
  }

  const tags = parseCommaSeparated(query.tags || query.tag);
  if (tags.length > 0) {
    filtered = filtered.filter((item) =>
      tags.some((t) => item.tags.includes(t))
    );
  }

  const limit = query.limit || 50;
  return filtered.slice(0, limit);
}

export const feedsRoutes: FastifyPluginAsync = async (app) => {
  app.get('/json', async (request, reply) => {
    const queryResult = feedsQuerySchema.safeParse(request.query);

    if (!queryResult.success) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Invalid query parameters',
        details: queryResult.error.errors,
      });
    }

    const items = filterItems(mockItems, queryResult.data);
    const result = exportItemsToJSON(items, {
      includeSummary: true,
      includeTags: true,
      includeAudience: true,
      includeMetadata: true,
    });

    reply.header('Content-Type', result.mimeType);
    reply.header('Content-Disposition', `attachment; filename="${result.filename}"`);

    return result.content;
  });

  app.get('/mdx', async (request, reply) => {
    const queryResult = feedsQuerySchema.safeParse(request.query);

    if (!queryResult.success) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Invalid query parameters',
      });
    }

    const items = filterItems(mockItems, queryResult.data);
    const result = exportItemsToMDX(items, {
      includeFrontmatter: true,
      includeToc: true,
      includeSummary: true,
      includeTags: true,
      includeAudience: true,
    });

    reply.header('Content-Type', 'text/markdown; charset=utf-8');
    reply.header('Content-Disposition', `attachment; filename="${result.filename}"`);

    return result.content;
  });

  app.get('/rss', async (request, reply) => {
    const queryResult = feedsQuerySchema.safeParse(request.query);

    if (!queryResult.success) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Invalid query parameters',
      });
    }

    const items = filterItems(mockItems, queryResult.data);
    const result = exportItemsToRSS(
      items,
      {
        title: 'Veille Platform',
        link: 'https://veille.example.com',
        description: 'Flux RSS de veille éditoriale',
      },
      {
        includeTags: true,
        includeAudience: false,
      }
    );

    reply.header('Content-Type', result.mimeType);
    reply.header('Content-Disposition', `inline; filename="${result.filename}"`);

    return result.content;
  });

  app.get('/by-audience/:audience/json', async (request, reply) => {
    const { audience } = request.params as { audience: string };

    const queryResult = feedsQuerySchema.safeParse(request.query);
    const items = filterItems(mockItems, {
      ...(queryResult.success ? queryResult.data : {}),
      audience,
    });

    const result = exportItemsToJSON(items, {
      includeSummary: true,
      includeTags: true,
      includeAudience: true,
    });

    reply.header('Content-Type', result.mimeType);
    reply.header('Content-Disposition', `attachment; filename="${result.filename}"`);

    return result.content;
  });

  app.get('/by-audience/:audience/mdx', async (request, reply) => {
    const { audience } = request.params as { audience: string };

    const queryResult = feedsQuerySchema.safeParse(request.query);
    const items = filterItems(mockItems, {
      ...(queryResult.success ? queryResult.data : {}),
      audience,
    });

    const result = exportItemsToMDX(items, {
      includeFrontmatter: true,
      includeToc: true,
      includeSummary: true,
      includeTags: true,
      includeAudience: true,
    });

    reply.header('Content-Type', 'text/markdown; charset=utf-8');
    reply.header('Content-Disposition', `attachment; filename="${result.filename}"`);

    return result.content;
  });

  app.get('/by-audience/:audience/rss', async (request, reply) => {
    const { audience } = request.params as { audience: string };

    const queryResult = feedsQuerySchema.safeParse(request.query);
    const items = filterItems(mockItems, {
      ...(queryResult.success ? queryResult.data : {}),
      audience,
    });

    const result = exportItemsToRSS(
      items,
      {
        title: `Veille Platform - ${audience}`,
        link: `https://veille.example.com/audiences/${encodeURIComponent(audience)}`,
        description: `Articles destinés à ${audience}`,
      },
      {
        includeTags: true,
        includeAudience: false,
      }
    );

    reply.header('Content-Type', result.mimeType);
    reply.header('Content-Disposition', `inline; filename="${result.filename}"`);

    return result.content;
  });

  app.get('/by-tag/:tag/json', async (request, reply) => {
    const { tag } = request.params as { tag: string };

    const queryResult = feedsQuerySchema.safeParse(request.query);
    const items = filterItems(mockItems, {
      ...(queryResult.success ? queryResult.data : {}),
      tag,
    });

    const result = exportItemsToJSON(items, {
      includeSummary: true,
      includeTags: true,
      includeAudience: true,
    });

    reply.header('Content-Type', result.mimeType);
    reply.header('Content-Disposition', `attachment; filename="${result.filename}"`);

    return result.content;
  });

  app.get('/by-tag/:tag/mdx', async (request, reply) => {
    const { tag } = request.params as { tag: string };

    const queryResult = feedsQuerySchema.safeParse(request.query);
    const items = filterItems(mockItems, {
      ...(queryResult.success ? queryResult.data : {}),
      tag,
    });

    const result = exportItemsToMDX(items, {
      includeFrontmatter: true,
      includeToc: true,
      includeSummary: true,
      includeTags: true,
      includeAudience: true,
    });

    reply.header('Content-Type', 'text/markdown; charset=utf-8');
    reply.header('Content-Disposition', `attachment; filename="${result.filename}"`);

    return result.content;
  });

  app.get('/by-tag/:tag/rss', async (request, reply) => {
    const { tag } = request.params as { tag: string };

    const queryResult = feedsQuerySchema.safeParse(request.query);
    const items = filterItems(mockItems, {
      ...(queryResult.success ? queryResult.data : {}),
      tag,
    });

    const result = exportItemsToRSS(
      items,
      {
        title: `Veille Platform - ${tag}`,
        link: `https://veille.example.com/tags/${encodeURIComponent(tag)}`,
        description: `Articles tagués "${tag}"`,
      },
      {
        includeTags: true,
        includeAudience: false,
      }
    );

    reply.header('Content-Type', result.mimeType);
    reply.header('Content-Disposition', `inline; filename="${result.filename}"`);

    return result.content;
  });

  app.get('/story/:id/json', async (request, reply) => {
    const { id } = request.params as { id: string };

    const story = {
      id,
      title: 'Story Example',
      description: 'Example story description',
      status: 'published',
      publishedAt: '2024-01-15T10:00:00Z',
      items: mockItems.slice(0, 2),
      tags: ['Tech', 'Innovation'],
      audience: ['DSI', 'Développeurs'],
      summary: 'Example story summary',
      createdAt: '2024-01-10T08:00:00Z',
      updatedAt: '2024-01-15T12:00:00Z',
    };

    const result = exportItemsToJSON(story.items, {
      includeSummary: true,
      includeTags: true,
      includeAudience: true,
    });

    reply.header('Content-Type', result.mimeType);
    reply.header('Content-Disposition', `attachment; filename="story-${id}.json"`);

    return result.content;
  });

  app.get('/story/:id/mdx', async (request, reply) => {
    const { id } = request.params as { id: string };

    const story = {
      id,
      title: 'Story Example',
      description: 'Example story description',
      status: 'published',
      publishedAt: '2024-01-15T10:00:00Z',
      items: mockItems.slice(0, 2),
      tags: ['Tech', 'Innovation'],
      audience: ['DSI', 'Développeurs'],
      summary: 'Example story summary',
      createdAt: '2024-01-10T08:00:00Z',
      updatedAt: '2024-01-15T12:00:00Z',
    };

    const result = exportStoryToMDX(story, {
      includeFrontmatter: true,
      includeToc: true,
      includeSummary: true,
      includeTags: true,
      includeAudience: true,
    });

    reply.header('Content-Type', 'text/markdown; charset=utf-8');
    reply.header('Content-Disposition', `attachment; filename="${result.filename}"`);

    return result.content;
  });

  app.get('/story/:id/rss', async (request, reply) => {
    const { id } = request.params as { id: string };

    const story = {
      id,
      title: 'Story Example',
      description: 'Example story description',
      status: 'published',
      publishedAt: '2024-01-15T10:00:00Z',
      items: mockItems.slice(0, 2),
      tags: ['Tech', 'Innovation'],
      audience: ['DSI', 'Développeurs'],
      summary: 'Example story summary',
      createdAt: '2024-01-10T08:00:00Z',
      updatedAt: '2024-01-15T12:00:00Z',
    };

    const result = exportStoryToRSS(
      story,
      {
        title: 'Veille Platform',
        link: 'https://veille.example.com',
        description: 'Flux RSS de veille éditoriale',
      }
    );

    reply.header('Content-Type', result.mimeType);
    reply.header('Content-Disposition', `inline; filename="${result.filename}"`);

    return result.content;
  });

  app.get('/audiences', async () => {
    const audiences = [...new Set(mockItems.flatMap((item) => item.audience))].sort();

    return {
      data: audiences.map((audience) => ({
        name: audience,
        slug: audience.toLowerCase().replace(/\s+/g, '-'),
        feeds: {
          json: `/api/v1/feeds/by-audience/${encodeURIComponent(audience)}/json`,
          mdx: `/api/v1/feeds/by-audience/${encodeURIComponent(audience)}/mdx`,
          rss: `/api/v1/feeds/by-audience/${encodeURIComponent(audience)}/rss`,
        },
      })),
      total: audiences.length,
    };
  });

  app.get('/tags', async () => {
    const tags = [...new Set(mockItems.flatMap((item) => item.tags))].sort();

    return {
      data: tags.map((tag) => ({
        name: tag,
        slug: tag.toLowerCase().replace(/\s+/g, '-'),
        feeds: {
          json: `/api/v1/feeds/by-tag/${encodeURIComponent(tag)}/json`,
          mdx: `/api/v1/feeds/by-tag/${encodeURIComponent(tag)}/mdx`,
          rss: `/api/v1/feeds/by-tag/${encodeURIComponent(tag)}/rss`,
        },
      })),
      total: tags.length,
    };
  });
};
