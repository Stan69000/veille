import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { errorHandler } from './middleware/error-handler.js';
import { notFoundHandler } from './middleware/not-found.js';

import { authRoutes } from './routes/auth/index.js';
import { itemsRoutes } from './routes/items/index.js';
import { storiesRoutes } from './routes/stories/index.js';
import { sourcesRoutes } from './routes/sources/index.js';
import { importsRoutes } from './routes/imports/index.js';
import { exportsRoutes } from './routes/exports/index.js';
import { logsRoutes } from './routes/logs/index.js';
import { healthRoutes } from './routes/health/index.js';
import { usersRoutes } from './routes/users/index.js';
import { settingsRoutes } from './routes/settings/index.js';

import { authPlugin } from './plugins/auth.js';
import { swaggerPlugin } from './plugins/swagger.js';

const PORT = parseInt(process.env.API_PORT || '3001', 10);
const HOST = process.env.API_HOST || '0.0.0.0';

export async function buildServer() {
  const server = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
      transport:
        process.env.NODE_ENV === 'development'
          ? { target: 'pino-pretty', options: { colorize: true } }
          : undefined,
    },
    trustProxy: process.env.SECURITY_TRUST_PROXY === 'true',
    disableRequestLogging: false,
  });

  await server.register(cors, {
    origin: process.env.API_CORS_ORIGINS?.split(',').map((s) => s.trim()) || [
      'http://localhost:3000',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400,
  });

  await server.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        fontSrc: ["'self'", 'data:'],
        connectSrc: ["'self'"],
        mediaSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameSrc: ["'none'"],
        formAction: ["'self'"],
        baseUri: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  });

  await server.register(rateLimit, {
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    timeWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '60000', 10),
    errorResponseBuilder: () => ({
      statusCode: 429,
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: 60,
    }),
    keyGenerator: (request) => {
      return request.headers['x-api-key'] as string ||
             request.ip ||
             'unknown';
    },
  });

  await server.register(swaggerPlugin);

  server.setErrorHandler(errorHandler);
  server.setNotFoundHandler(notFoundHandler);

  await server.register(authPlugin);

  await server.register(healthRoutes, { prefix: '/health' });
  await server.register(authRoutes, { prefix: '/api/auth' });
  await server.register(usersRoutes, { prefix: '/api/users' });
  await server.register(itemsRoutes, { prefix: '/api/items' });
  await server.register(storiesRoutes, { prefix: '/api/stories' });
  await server.register(sourcesRoutes, { prefix: '/api/sources' });
  await server.register(importsRoutes, { prefix: '/api/imports' });
  await server.register(exportsRoutes, { prefix: '/api/exports' });
  await server.register(logsRoutes, { prefix: '/api/logs' });
  await server.register(settingsRoutes, { prefix: '/api/settings' });

  server.get('/api', async () => ({
    name: 'Veille Platform API',
    version: '0.1.0',
    docs: '/docs',
    health: '/health',
  }));

  return server;
}

async function start() {
  try {
    const server = await buildServer();

    await server.listen({ port: PORT, host: HOST });

    server.log.info(`API server running at http://${HOST}:${PORT}`);
    server.log.info(`API docs available at http://localhost:${PORT}/docs`);

    const shutdown = async (signal: string) => {
      server.log.info(`Received ${signal}, shutting down gracefully...`);
      await server.close();
      process.exit(0);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
