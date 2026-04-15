import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

import { itemsRoutes } from './routes/items';
import { storiesRoutes } from './routes/stories';
import { sourcesRoutes } from './routes/sources';
import { feedsRoutes } from './routes/feeds';
import { healthRoutes } from './routes/health';
import { errorHandler } from './lib/error-handler';

const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = process.env.HOST || '0.0.0.0';

async function buildServer() {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
      transport:
        process.env.NODE_ENV !== 'production'
          ? {
              target: 'pino-pretty',
              options: {
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname',
              },
            }
          : undefined,
    },
  });

  await app.register(helmet, {
    contentSecurityPolicy: false,
  });

  await app.register(cors, {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'OPTIONS'],
  });

  await app.register(rateLimit, {
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    timeWindow: '1 minute',
  });

  await app.register(swagger, {
    openapi: {
      info: {
        title: 'Veille Platform Public API',
        description: 'API publique pour accéder aux articles et stories de veille',
        version: '1.0.0',
      },
      servers: [
        {
          url: `http://localhost:${PORT}`,
          description: 'Development server',
        },
      ],
      tags: [
        { name: 'items', description: 'Articles et contenus' },
        { name: 'stories', description: 'Stories et regroupements' },
        { name: 'sources', description: 'Sources RSS' },
        { name: 'feeds', description: 'Flux RSS/MDX/JSON' },
      ],
    },
  });

  await app.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
    },
  });

  app.setErrorHandler(errorHandler);

  await app.register(healthRoutes, { prefix: '/health' });
  await app.register(itemsRoutes, { prefix: '/api/v1/items' });
  await app.register(storiesRoutes, { prefix: '/api/v1/stories' });
  await app.register(sourcesRoutes, { prefix: '/api/v1/sources' });
  await app.register(feedsRoutes, { prefix: '/api/v1/feeds' });

  app.get('/', async () => {
    return {
      name: 'Veille Platform Public API',
      version: '1.0.0',
      docs: '/docs',
      health: '/health',
    };
  });

  return app;
}

async function start() {
  try {
    const app = await buildServer();

    await app.listen({ port: PORT, host: HOST });

    app.log.info(`Public API server running at http://${HOST}:${PORT}`);
    app.log.info(`API documentation available at http://localhost:${PORT}/docs`);
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();

export { buildServer };
