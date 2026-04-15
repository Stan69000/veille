import type { FastifyPluginAsync } from 'fastify';
import {
  itemsQuerySchema,
  itemParamsSchema,
  parseCommaSeparated,
  buildFilters,
} from '../lib/schemas';
import { notFoundError } from '../lib/error-handler';

const mockItems = [
  {
    id: '1',
    title: 'Nouvelle réglementation sur les données personnelles entre en vigueur',
    url: 'https://example.com/article/1',
    source: 'Le Monde',
    sourceId: 'le-monde',
    publishedAt: '2024-01-15T10:30:00Z',
    summary: 'Un résumé complet de la nouvelle réglementation...',
    summaryShort: 'Résumer de la regulation RGPD 2.0',
    summaryPublic: 'La nouvelle réglementation sur les données personnelles entre en vigueur ce mois.',
    whyItMatters: 'Impact sur toutes les entreprises traitant des données européennes.',
    whatToDo: 'Mettre à jour vos politiques de confidentialité.',
    whoIsConcerned: 'Entreprises, Startups, DPO',
    tags: ['RGPD', 'Vie privée', 'RGAA'],
    audience: ['Entreprises', 'DPO', 'Développeurs'],
    categories: ['Politique', 'Tech'],
    score: 0.92,
    status: 'approved',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T12:00:00Z',
  },
  {
    id: '2',
    title: 'Lancement du programme de transition écologique européen',
    url: 'https://example.com/article/2',
    source: 'Les Échos',
    sourceId: 'les-echos',
    publishedAt: '2024-01-15T09:45:00Z',
    summary: 'Analyse du programme Green Deal européen...',
    summaryShort: 'European Green Deal launched',
    summaryPublic: 'Le programme de transition écologique européen a été lancé.',
    tags: ['Environnement', 'Europe', 'Énergie'],
    audience: ['Entreprises', 'ONG'],
    categories: ['Environnement'],
    score: 0.78,
    status: 'approved',
    createdAt: '2024-01-15T09:45:00Z',
    updatedAt: '2024-01-15T11:00:00Z',
  },
  {
    id: '3',
    title: 'Cybersécurité : les nouvelles menaces pour 2024',
    url: 'https://example.com/article/3',
    source: '01net',
    sourceId: '01net',
    publishedAt: '2024-01-15T08:20:00Z',
    summaryShort: 'Nouvelles menaces cyber en 2024',
    summaryPublic: 'Les nouvelles menaces cybernétiques pour 2024 sont identifiées.',
    tags: ['Cybersécurité', 'IT', 'Tech'],
    audience: ['DSI', 'Développeurs', 'RSSI'],
    categories: ['Technologie'],
    score: 0.65,
    status: 'pending',
    createdAt: '2024-01-15T08:20:00Z',
    updatedAt: '2024-01-15T08:20:00Z',
  },
];

function filterItems(items: typeof mockItems, query: {
  audience?: string;
  audiences?: string;
  tag?: string;
  tags?: string;
  source?: string;
  status?: string;
  from?: Date;
  to?: Date;
  q?: string;
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

  if (query.source) {
    filtered = filtered.filter((item) =>
      item.source.toLowerCase().includes(query.source!.toLowerCase()) ||
      item.sourceId === query.source
    );
  }

  if (query.status) {
    filtered = filtered.filter((item) => item.status === query.status);
  }

  if (query.from) {
    filtered = filtered.filter(
      (item) => new Date(item.publishedAt) >= query.from!
    );
  }

  if (query.to) {
    filtered = filtered.filter(
      (item) => new Date(item.publishedAt) <= query.to!
    );
  }

  if (query.q) {
    const search = query.q.toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.title.toLowerCase().includes(search) ||
        item.summary?.toLowerCase().includes(search) ||
        item.tags.some((t) => t.toLowerCase().includes(search))
    );
  }

  return filtered;
}

function sortItems(items: typeof mockItems, sort: string, order: string) {
  return items.sort((a, b) => {
    let comparison = 0;

    switch (sort) {
      case 'publishedAt':
        comparison = new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
        break;
      case 'score':
        comparison = (a.score || 0) - (b.score || 0);
        break;
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      default:
        comparison = new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
    }

    return order === 'asc' ? comparison : -comparison;
  });
}

export const itemsRoutes: FastifyPluginAsync = async (app) => {
  app.get('/', async (request, reply) => {
    const queryResult = itemsQuerySchema.safeParse(request.query);

    if (!queryResult.success) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Invalid query parameters',
        details: queryResult.error.errors,
      });
    }

    const { page, limit, sort, order, ...filters } = queryResult.data;

    let items = filterItems(mockItems, filters);
    items = sortItems(items, sort, order);

    const total = items.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginatedItems = items.slice(offset, offset + limit);

    return {
      data: paginatedItems,
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

  app.get('/latest', async (request, reply) => {
    const queryResult = itemsQuerySchema.safeParse(request.query);

    if (!queryResult.success) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Invalid query parameters',
      });
    }

    const { limit = 10, ...filters } = queryResult.data;
    const items = filterItems(mockItems, filters);

    return {
      data: items.slice(0, limit),
      count: Math.min(items.length, limit),
    };
  });

  app.get('/by-audience/:audience', async (request, reply) => {
    const { audience } = request.params as { audience: string };

    const queryResult = itemsQuerySchema.safeParse(request.query);
    const { page, limit, sort, order, ...filters } = queryResult.success
      ? queryResult.data
      : { page: 1, limit: 20, sort: 'publishedAt', order: 'desc' };

    let items = filterItems(mockItems, { ...filters, audience });
    items = sortItems(items, sort, order);

    return {
      data: items.slice(0, limit),
      audience,
      pagination: {
        page,
        limit,
        total: items.length,
        totalPages: Math.ceil(items.length / limit),
      },
    };
  });

  app.get('/by-tag/:tag', async (request, reply) => {
    const { tag } = request.params as { tag: string };

    const queryResult = itemsQuerySchema.safeParse(request.query);
    const { page, limit, sort, order, ...filters } = queryResult.success
      ? queryResult.data
      : { page: 1, limit: 20, sort: 'publishedAt', order: 'desc' };

    let items = filterItems(mockItems, { ...filters, tag });
    items = sortItems(items, sort, order);

    return {
      data: items.slice(0, limit),
      tag,
      pagination: {
        page,
        limit,
        total: items.length,
        totalPages: Math.ceil(items.length / limit),
      },
    };
  });

  app.get('/by-source/:sourceId', async (request, reply) => {
    const { sourceId } = request.params as { sourceId: string };

    const queryResult = itemsQuerySchema.safeParse(request.query);
    const { page, limit, sort, order, ...filters } = queryResult.success
      ? queryResult.data
      : { page: 1, limit: 20, sort: 'publishedAt', order: 'desc' };

    let items = filterItems(mockItems, { ...filters, source: sourceId });
    items = sortItems(items, sort, order);

    return {
      data: items.slice(0, limit),
      source: sourceId,
      pagination: {
        page,
        limit,
        total: items.length,
        totalPages: Math.ceil(items.length / limit),
      },
    };
  });

  app.get('/audiences', async () => {
    const audiences = [...new Set(mockItems.flatMap((item) => item.audience))].sort();

    return {
      data: audiences.map((audience) => ({
        name: audience,
        slug: audience.toLowerCase().replace(/\s+/g, '-'),
        count: mockItems.filter((item) => item.audience.includes(audience)).length,
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
        count: mockItems.filter((item) => item.tags.includes(tag)).length,
      })),
      total: tags.length,
    };
  });

  app.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    const item = mockItems.find((item) => item.id === id);

    if (!item) {
      throw notFoundError('Item');
    }

    return { data: item };
  });
};
