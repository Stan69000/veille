import type { FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import { ZodError } from 'zod';
import { AppError, handleError, HTTP_STATUS, ERROR_CODES } from '@core/errors';
import type { ApiError, ApiResponse } from '@core/types';

export function errorHandler(
  error: FastifyError | Error,
  request: FastifyRequest,
  reply: FastifyReply
) {
  request.log.error(error);

  if (error instanceof ZodError) {
    const apiError: ApiError = {
      code: ERROR_CODES.VALIDATION_ERROR,
      message: 'Validation failed',
      details: {
        errors: error.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
          code: e.code,
        })),
      },
    };

    return reply.status(HTTP_STATUS.BAD_REQUEST).send({
      success: false,
      error: apiError,
    } satisfies ApiResponse<never>);
  }

  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      success: false,
      error: error.toJSON(),
    } satisfies ApiResponse<never>);
  }

  const handled = handleError(error);
  return reply.status(handled.statusCode).send({
    success: false,
    error: handled.toJSON(),
  } satisfies ApiResponse<never>);
}
