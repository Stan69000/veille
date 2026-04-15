import type { FastifyRequest, FastifyReply } from 'fastify';
import { HTTP_STATUS, ERROR_CODES } from '@core/errors';
import type { ApiError, ApiResponse } from '@core/types';

export function notFoundHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const apiError: ApiError = {
    code: ERROR_CODES.NOT_FOUND,
    message: `Route ${request.method} ${request.url} not found`,
  };

  return reply.status(HTTP_STATUS.NOT_FOUND).send({
    success: false,
    error: apiError,
  } satisfies ApiResponse<never>);
}
