import type { PaginationParams, PaginatedResponse } from '../types/index.js';
import { DEFAULT_PAGINATION } from '@core/constants';

export function normalizePagination(params: PaginationParams): {
  page: number;
  limit: number;
  offset: number;
} {
  const page = Math.max(1, params.page ?? DEFAULT_PAGINATION.PAGE);
  const limit = Math.min(
    Math.max(1, params.limit ?? DEFAULT_PAGINATION.LIMIT),
    DEFAULT_PAGINATION.MAX_LIMIT
  );
  const offset = params.offset ?? (page - 1) * limit;

  return { page, limit, offset };
}

export function createPaginatedResult<T>(
  data: T[],
  total: number,
  params: PaginationParams
): PaginatedResponse<T> {
  const { page, limit } = normalizePagination(params);
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}
