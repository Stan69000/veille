import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

const swaggerOptions = {
  openapi: {
    info: {
      title: 'Veille Platform API',
      description: 'API interne pour la plateforme de veille éditoriale',
      version: '0.1.0',
      contact: {
        name: 'API Support',
        email: 'api@veille.platform',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server',
      },
    ],
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Users', description: 'User management' },
      { name: 'Items', description: 'Content items' },
      { name: 'Stories', description: 'Story consolidation' },
      { name: 'Sources', description: 'Source management' },
      { name: 'Imports', description: 'Content import' },
      { name: 'Exports', description: 'Content export' },
      { name: 'Logs', description: 'Audit logs' },
      { name: 'Health', description: 'Health checks' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                code: { type: 'string' },
                message: { type: 'string' },
                details: { type: 'object' },
              },
            },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            page: { type: 'integer' },
            limit: { type: 'integer' },
            total: { type: 'integer' },
            totalPages: { type: 'integer' },
            hasNext: { type: 'boolean' },
            hasPrev: { type: 'boolean' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
};

const uiOptions = {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: true,
    showExtensions: true,
    showCommonExtensions: true,
  },
  transformSpecificationClone: true,
};

async function swaggerPluginFn(fastify: FastifyInstance) {
  await fastify.register(swagger, swaggerOptions);
  await fastify.register(swaggerUi, uiOptions);
}

export const swaggerPlugin = fp(swaggerPluginFn, {
  name: 'swagger',
  fastify: '4.x',
});
