import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { prisma } from '@database/client';

const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  theme: z.string().trim().toLowerCase().optional(),
  q: z.string().trim().optional(),
});

const themesQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(30),
});

const sampleNews = [
  {
    id: 'demo-1',
    slug: 'alerte-cyber-phishing-mairies',
    title: 'Alerte cyber: campagne de phishing ciblant les mairies',
    summary: 'Une vague de phishing usurpe des services publics locaux.',
    content:
      'Des campagnes de phishing ont été détectées. Vérifiez les domaines expéditeurs et activez MFA.',
    publishedAt: '2026-04-14T08:00:00.000Z',
    themes: ['cyber', 'collectivites'],
  },
  {
    id: 'demo-2',
    slug: 'subventions-asso-2026-nouveautes',
    title: 'Subventions 2026: ce qui change pour les associations',
    summary: 'Nouveaux critères de dossiers et calendrier de dépôt.',
    content:
      'Les associations doivent anticiper les échéances et renforcer le suivi documentaire.',
    publishedAt: '2026-04-13T10:30:00.000Z',
    themes: ['asso', 'financement'],
  },
  {
    id: 'demo-3',
    slug: 'protection-donnees-pme-actions-prioritaires',
    title: 'Protection des données PME: 5 actions prioritaires',
    summary: 'Checklist rapide pour améliorer conformité et sécurité.',
    content: 'Cartographiez les traitements, limitez les accès et sécurisez les sauvegardes.',
    publishedAt: '2026-04-12T14:20:00.000Z',
    themes: ['conformite', 'pme', 'cyber'],
  },
];

function normalizeTheme(value: string): string {
  return value.trim().toLowerCase();
}

function extractThemes(item: { categories: string[]; tags: string[] }): string[] {
  return [...item.categories, ...item.tags]
    .map(normalizeTheme)
    .filter(Boolean);
}

export const newsRoutes: FastifyPluginAsync = async (app) => {
  app.get('/news', async (request, reply) => {
    const query = listQuerySchema.parse(request.query);
    const offset = (query.page - 1) * query.limit;
    try {
      const baseWhere = {
        isPublished: true,
        ...(query.q
          ? {
              OR: [
                { title: { contains: query.q, mode: 'insensitive' as const } },
                { summary: { contains: query.q, mode: 'insensitive' as const } },
                { content: { contains: query.q, mode: 'insensitive' as const } },
              ],
            }
          : {}),
      };

      const where =
        query.theme === undefined
          ? baseWhere
          : {
              ...baseWhere,
              items: {
                some: {
                  OR: [
                    { categories: { has: query.theme } },
                    { tags: { has: query.theme } },
                  ],
                },
              },
            };

      const [stories, total] = await Promise.all([
        prisma.story.findMany({
          where,
          include: {
            items: {
              select: {
                id: true,
                title: true,
                url: true,
                summary: true,
                author: true,
                publishedAt: true,
                categories: true,
                tags: true,
                severity: true,
              },
              orderBy: { publishedAt: 'desc' },
            },
          },
          orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
          skip: offset,
          take: query.limit,
        }),
        prisma.story.count({ where }),
      ]);

      return reply.send({
        success: true,
        data: stories.map((story) => {
          const primaryItem = story.items[0];
          const themes = primaryItem ? extractThemes(primaryItem) : [];

          return {
            id: story.id,
            slug: story.slug,
            title: story.title,
            summary: story.summary,
            content: story.content,
            publishedAt: story.publishedAt?.toISOString() ?? null,
            themes,
            primary: primaryItem
              ? {
                  id: primaryItem.id,
                  title: primaryItem.title,
                  url: primaryItem.url,
                  summary: primaryItem.summary,
                  author: primaryItem.author,
                  publishedAt: primaryItem.publishedAt?.toISOString() ?? null,
                  severity: primaryItem.severity,
                }
              : null,
          };
        }),
        pagination: {
          page: query.page,
          limit: query.limit,
          total,
          totalPages: Math.ceil(total / query.limit),
          hasNext: query.page * query.limit < total,
          hasPrev: query.page > 1,
        },
      });
    } catch {
      const filtered = sampleNews.filter((news) => {
        const themeMatch = query.theme ? news.themes.includes(query.theme) : true;
        const text = `${news.title} ${news.summary} ${news.content}`.toLowerCase();
        const qMatch = query.q ? text.includes(query.q.toLowerCase()) : true;
        return themeMatch && qMatch;
      });
      const total = filtered.length;
      return reply.send({
        success: true,
        data: filtered.slice(offset, offset + query.limit),
        pagination: {
          page: query.page,
          limit: query.limit,
          total,
          totalPages: Math.ceil(total / query.limit),
          hasNext: query.page * query.limit < total,
          hasPrev: query.page > 1,
        },
      });
    }
  });

  app.get('/news/:slug', async (request, reply) => {
    const params = z.object({ slug: z.string().min(1) }).parse(request.params);

    try {
      const story = await prisma.story.findUnique({
        where: { slug: params.slug },
        include: {
          items: {
            select: {
              id: true,
              title: true,
              url: true,
              summary: true,
              content: true,
              author: true,
              publishedAt: true,
              categories: true,
              tags: true,
              severity: true,
            },
            orderBy: { publishedAt: 'desc' },
          },
        },
      });

      if (!story || !story.isPublished) {
        return reply.status(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: 'News not found' },
        });
      }

      const storyThemes = [...new Set(story.items.flatMap(extractThemes))];

      return reply.send({
        success: true,
        data: {
          id: story.id,
          slug: story.slug,
          title: story.title,
          summary: story.summary,
          content: story.content,
          publishedAt: story.publishedAt?.toISOString() ?? null,
          themes: storyThemes,
          items: story.items.map((item) => ({
            id: item.id,
            title: item.title,
            url: item.url,
            summary: item.summary,
            content: item.content,
            author: item.author,
            severity: item.severity,
            publishedAt: item.publishedAt?.toISOString() ?? null,
            themes: extractThemes(item),
          })),
        },
      });
    } catch {
      const fallback = sampleNews.find((news) => news.slug === params.slug);
      if (!fallback) {
        return reply.status(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: 'News not found' },
        });
      }
      return reply.send({ success: true, data: { ...fallback, items: [] } });
    }
  });

  app.get('/themes', async (request, reply) => {
    const query = themesQuerySchema.parse(request.query);

    try {
      const stories = await prisma.story.findMany({
        where: { isPublished: true },
        select: {
          items: {
            select: {
              categories: true,
              tags: true,
            },
          },
        },
        take: 500,
        orderBy: { publishedAt: 'desc' },
      });

      const counts = new Map<string, number>();
      for (const story of stories) {
        for (const item of story.items) {
          for (const theme of extractThemes(item)) {
            counts.set(theme, (counts.get(theme) ?? 0) + 1);
          }
        }
      }

      const themes = [...counts.entries()]
        .map(([slug, count]) => ({ slug, label: slug, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, query.limit);

      return reply.send({ success: true, data: themes });
    } catch {
      const counts = new Map<string, number>();
      for (const news of sampleNews) {
        for (const theme of news.themes) {
          counts.set(theme, (counts.get(theme) ?? 0) + 1);
        }
      }
      const themes = [...counts.entries()]
        .map(([slug, count]) => ({ slug, label: slug, count }))
        .slice(0, query.limit);
      return reply.send({ success: true, data: themes });
    }
  });

  app.get('/feeds/:theme.json', async (request, reply) => {
    const params = z.object({ theme: z.string().min(1) }).parse(request.params);
    const theme = normalizeTheme(params.theme);

    try {
      const stories = await prisma.story.findMany({
        where: {
          isPublished: true,
          items: {
            some: {
              OR: [{ categories: { has: theme } }, { tags: { has: theme } }],
            },
          },
        },
        include: {
          items: {
            select: {
              title: true,
              url: true,
              summary: true,
              categories: true,
              tags: true,
              publishedAt: true,
            },
            orderBy: { publishedAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { publishedAt: 'desc' },
        take: 100,
      });

      return reply.send({
        success: true,
        data: stories.map((story) => ({
          slug: story.slug,
          title: story.title,
          summary: story.summary,
          publishedAt: story.publishedAt?.toISOString() ?? null,
          link: `/news/${story.slug}`,
          sourceUrl: story.items[0]?.url ?? null,
          themes: story.items[0] ? extractThemes(story.items[0]) : [],
        })),
      });
    } catch {
      const data = sampleNews
        .filter((news) => news.themes.includes(theme))
        .map((news) => ({
          slug: news.slug,
          title: news.title,
          summary: news.summary,
          publishedAt: news.publishedAt,
          link: `/news/${news.slug}`,
          sourceUrl: null,
          themes: news.themes,
        }));
      return reply.send({ success: true, data });
    }
  });
};
