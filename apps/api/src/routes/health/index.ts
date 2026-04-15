import type { FastifyInstance } from 'fastify';
import { healthCheck } from '@database/client';

export async function healthRoutes(fastify: FastifyInstance) {
  fastify.get('/', async () => {
    const dbHealthy = await healthCheck();
    const healthy = dbHealthy;

    return {
      status: healthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      version: '0.1.0',
      services: {
        database: dbHealthy,
      },
    };
  });

  fastify.get('/live', async () => {
    return { status: 'alive' };
  });

  fastify.get('/ready', async (request, reply) => {
    const dbHealthy = await healthCheck();

    if (!dbHealthy) {
      return reply.status(503).send({
        status: 'not_ready',
        reason: 'Database not available',
      });
    }

    return { status: 'ready' };
  });
}
