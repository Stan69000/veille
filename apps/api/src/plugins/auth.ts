import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import jwt from '@fastify/jwt';

async function authPluginFn(fastify: FastifyInstance) {
  const jwtSecret =
    process.env.AUTH_SECRET || 'development-secret-change-in-production';
  if (process.env.NODE_ENV === 'production' && !process.env.AUTH_SECRET) {
    throw new Error('AUTH_SECRET is required in production');
  }

  await fastify.register(jwt, {
    secret: jwtSecret,
    sign: {
      expiresIn: process.env.AUTH_SESSION_DURATION || '7d',
    },
    verify: {
      maxAge: process.env.AUTH_SESSION_DURATION || '7d',
    },
  });

  fastify.decorate('authenticate', async function (request: any, reply: any) {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid or expired token',
        },
      });
    }
  });
}

export const authPlugin = fp(authPluginFn, {
  name: 'auth',
  fastify: '4.x',
});
