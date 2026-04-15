import type { Prisma } from '@prisma/client';
import { prisma } from './client.js';

type Include<T> = T extends object ? T | boolean | undefined : never;

export async function findManyPaginated<
  T extends Prisma.ModelName,
  Args extends object
>(
  model: T,
  args: {
    where?: Args['where'];
    orderBy?: Args['orderBy'];
    include?: Args['include'];
    select?: Args['select'];
  },
  pagination: {
    page: number;
    limit: number;
  }
) {
  const { page, limit } = pagination;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    (prisma[model.charAt(0).toLowerCase() + model.slice(1) as keyof typeof prisma] as unknown as {
      findMany: (args: object) => Promise<unknown[]>;
    }).findMany({
      ...args,
      skip,
      take: limit,
    }),
    (prisma[model.charAt(0).toLowerCase() + model.slice(1) as keyof typeof prisma] as unknown as {
      count: (args: { where?: Args['where'] }) => Promise<number>;
    }).count({
      where: args.where,
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    data,
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

export async function transaction<T>(
  fn: (tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0]) => Promise<T>
): Promise<T> {
  return prisma.$transaction(fn);
}

export async function withTransaction<T>(
  fn: () => Promise<T>,
  options?: { timeout?: number }
): Promise<T> {
  return prisma.$transaction(fn, {
    timeout: options?.timeout ?? 10000,
  });
}

export function buildWhereClause(
  filters: Record<string, unknown>
): Record<string, unknown> {
  const where: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null) continue;

    if (Array.isArray(value)) {
      if (value.length > 0) {
        where[key] = { in: value };
      }
    } else if (typeof value === 'object') {
      where[key] = value;
    } else {
      where[key] = value;
    }
  }

  return where;
}

export function buildOrderBy(
  sort?: string,
  allowedFields?: string[]
): Record<string, 'asc' | 'desc'> | undefined {
  if (!sort) return undefined;

  const [field, order] = sort.split(':');
  
  if (allowedFields && !allowedFields.includes(field)) {
    return undefined;
  }

  return {
    [field]: order === 'desc' ? 'desc' : 'asc',
  };
}
