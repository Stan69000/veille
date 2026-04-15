import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '@database/client';

const querySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(50).optional().default(20),
  audience: z.string().optional(),
  category: z.string().optional(),
  severity: z.enum(['INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  tag: z.string().optional(),
});

export async function publicRoutes(fastify: FastifyInstance) {
  fastify.get('/health', async (request, reply) => {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '0.1.0',
    };
  });

  fastify.get('/news', {
    schema: {
      querystring: querySchema,
    },
  }, async (request, reply) => {
    const filters = querySchema.parse(request.query);
    const { page, limit } = filters;
    const offset = (page - 1) * limit;

    const where: Record<string, unknown> = {
      editorialStatus: 'PUBLISHED',
    };

    if (filters.audience) {
      where.audiences = { has: filters.audience };
    }
    if (filters.category) {
      where.category = filters.category;
    }
    if (filters.severity) {
      where.severity = filters.severity;
    }
    if (filters.tag) {
      where.tags = { has: filters.tag };
    }

    const [stories, total] = await Promise.all([
      prisma.story.findMany({
        where,
        include: {
          items: {
            include: {
              item: {
                select: {
                  id: true,
                  title: true,
                  canonicalUrl: true,
                  publishedAt: true,
                  summaryShort: true,
                  source: {
                    select: { name: true },
                  },
                },
              },
            },
            orderBy: { order: 'asc' },
            take: 5,
          },
        },
        orderBy: { publishedAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.story.count({ where }),
    ]);

    const news = stories.map((story) => ({
      id: story.id,
      slug: story.slug,
      title: story.title,
      strapline: story.strapline,
      summary: story.summaryPublic || story.summary,
      category: story.category,
      tags: story.tags,
      severity: story.severity,
      audiences: story.audiences,
      publishedAt: story.publishedAt?.toISOString(),
      items: story.items.map((si) => ({
        id: si.item.id,
        title: si.item.title,
        url: si.item.canonicalUrl,
        sourceName: si.item.source.name,
        publishedAt: si.item.publishedAt?.toISOString(),
        summary: si.item.summaryShort,
      })),
    }));

    return {
      data: news,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  });

  fastify.get('/news/:slug', async (request, reply) => {
    const { slug } = request.params as { slug: string };

    const story = await prisma.story.findUnique({
      where: { slug },
      include: {
        items: {
          include: {
            item: {
              include: {
                source: {
                  select: { id: true, name: true, url: true },
                },
              },
            },
          },
          orderBy: { order: 'asc' },
        },
        variants: true,
      },
    });

    if (!story || story.editorialStatus !== 'PUBLISHED') {
      return reply.status(404).send({
        error: { code: 'NOT_FOUND', message: 'Story not found' },
      });
    }

    const publicStory = {
      id: story.id,
      slug: story.slug,
      title: story.title,
      strapline: story.strapline,
      summary: story.summaryPublic || story.summary,
      summaryPublic: story.summaryPublic,
      whyItMatters: story.whyItMatters,
      whatToDo: story.whatToDo,
      whoIsConcerned: story.whoIsConcerned,
      category: story.category,
      tags: story.tags,
      severity: story.severity,
      audiences: story.audiences,
      publishedAt: story.publishedAt?.toISOString(),
      updatedAt: story.updatedAt.toISOString(),
      items: story.items.map((si) => ({
        id: si.item.id,
        title: si.item.title,
        url: si.item.canonicalUrl,
        author: si.item.author,
        source: {
          name: si.item.source.name,
          url: si.item.source.url,
        },
        publishedAt: si.item.publishedAt?.toISOString(),
        summary: si.item.summaryShort,
        content: si.item.extractedText,
      })),
    };

    return { data: publicStory };
  });

  fastify.get('/categories', async (request, reply) => {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        color: true,
        icon: true,
      },
    });

    const storiesByCategory = await prisma.story.groupBy({
      by: ['category'],
      where: { editorialStatus: 'PUBLISHED', category: { not: null } },
      _count: true,
    });

    const result = categories.map((cat) => {
      const stats = storiesByCategory.find((s) => s.category === cat.slug);
      return {
        ...cat,
        storyCount: stats?._count || 0,
      };
    });

    return { data: result };
  });

  fastify.get('/tags', async (request, reply) => {
    const stories = await prisma.story.findMany({
      where: { editorialStatus: 'PUBLISHED' },
      select: { tags: true },
    });

    const tagCounts: Record<string, number> = {};
    for (const story of stories) {
      for (const tag of story.tags) {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      }
    }

    const tags = Object.entries(tagCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 50);

    return { data: tags };
  });

  fastify.get('/alerts', {
    schema: {
      querystring: z.object({
        page: z.coerce.number().int().positive().optional().default(1),
        limit: z.coerce.number().int().positive().max(50).optional().default(10),
        audience: z.string().optional(),
      }),
    },
  }, async (request, reply) => {
    const { page, limit, audience } = querySchema.parse(request.query);
    const offset = (page - 1) * limit;

    const where: Record<string, unknown> = {
      editorialStatus: 'PUBLISHED',
      severity: { in: ['HIGH', 'CRITICAL'] },
    };

    if (audience) {
      where.audiences = { has: audience };
    }

    const [alerts, total] = await Promise.all([
      prisma.story.findMany({
        where,
        select: {
          id: true,
          slug: true,
          title: true,
          summary: true,
          severity: true,
          publishedAt: true,
        },
        orderBy: [
          { severity: 'desc' },
          { publishedAt: 'desc' },
        ],
        skip: offset,
        take: limit,
      }),
      prisma.story.count({ where }),
    ]);

    return {
      data: alerts.map((alert) => ({
        ...alert,
        publishedAt: alert.publishedAt?.toISOString(),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  });

  fastify.get('/feed/rss', async (request, reply) => {
    const stories = await prisma.story.findMany({
      where: { editorialStatus: 'PUBLISHED' },
      include: {
        items: {
          include: { item: true },
          take: 1,
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { publishedAt: 'desc' },
      take: 50,
    });

    const items = stories.map((story) => {
      const primaryItem = story.items[0]?.item;
      return {
        title: story.title,
        link: `${process.env.PUBLIC_API_URL || 'http://localhost:3002'}/news/${story.slug}`,
        guid: story.id,
        description: story.summaryPublic || story.summary || '',
        pubDate: story.publishedAt?.toUTCString(),
        author: primaryItem?.author,
        category: story.category,
      };
    });

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Veille Platform</title>
    <link>${process.env.PUBLIC_API_URL || 'http://localhost:3002'}</link>
    <description>Flux RSS des dernières actualités</description>
    <language>fr-fr</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${process.env.PUBLIC_API_URL || 'http://localhost:3002'}/feed/rss" rel="self" type="application/rss+xml"/>
    ${items.map((item) => `
    <item>
      <title><![CDATA[${item.title}]]></title>
      <link>${item.link}</link>
      <guid isPermaLink="false">${item.guid}</guid>
      <description><![CDATA[${item.description}]]></description>
      ${item.pubDate ? `<pubDate>${item.pubDate}</pubDate>` : ''}
      ${item.author ? `<author>${item.author}</author>` : ''}
      ${item.category ? `<category>${item.category}</category>` : ''}
    </item>`).join('')}
  </channel>
</rss>`;

    reply.header('Content-Type', 'application/rss+xml; charset=utf-8');
    return rss;
  });
}
