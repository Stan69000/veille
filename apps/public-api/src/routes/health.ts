import type { FastifyPluginAsync } from 'fastify';

export const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get('/', async () => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  });

  app.get('/ready', async () => {
    return {
      status: 'ready',
      timestamp: new Date().toISOString(),
      checks: {
        api: 'ok',
      },
    };
  });

  app.get('/live', async () => {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
    };
  });
};
