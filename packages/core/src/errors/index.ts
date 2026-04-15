import { ERROR_CODES, HTTP_STATUS } from '../constants/index.js';

export { ERROR_CODES, HTTP_STATUS };

export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    code: string = ERROR_CODES.INTERNAL_ERROR,
    statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      ...(this.details && { details: this.details }),
    };
  }

  toString() {
    return `[${this.code}] ${this.message}`;
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, ERROR_CODES.VALIDATION_ERROR, HTTP_STATUS.BAD_REQUEST, details);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, identifier?: string) {
    const msg = identifier
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`;
    super(msg, ERROR_CODES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, ERROR_CODES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
  }
}

export class InvalidCredentialsError extends AppError {
  constructor(message: string = 'Invalid email or password') {
    super(message, ERROR_CODES.INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED);
  }
}

export class AccountLockedError extends AppError {
  public readonly lockedUntil: Date;

  constructor(lockedUntil: Date) {
    super(
      `Account locked until ${lockedUntil.toISOString()}`,
      ERROR_CODES.ACCOUNT_LOCKED,
      HTTP_STATUS.FORBIDDEN
    );
    this.lockedUntil = lockedUntil;
  }
}

export class AccountDisabledError extends AppError {
  constructor() {
    super('Account is disabled', ERROR_CODES.ACCOUNT_DISABLED, HTTP_STATUS.FORBIDDEN);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, ERROR_CODES.FORBIDDEN, HTTP_STATUS.FORBIDDEN);
  }
}

export class DuplicateError extends AppError {
  constructor(resource: string, field: string, value: string) {
    super(
      `${resource} with ${field} '${value}' already exists`,
      ERROR_CODES.DUPLICATE_ERROR,
      HTTP_STATUS.CONFLICT
    );
  }
}

export class RateLimitError extends AppError {
  public readonly retryAfter: number;

  constructor(retryAfter: number = 60) {
    super('Too many requests', ERROR_CODES.RATE_LIMIT_EXCEEDED, HTTP_STATUS.TOO_MANY_REQUESTS);
    this.retryAfter = retryAfter;
  }
}

export class QuotaExceededError extends AppError {
  public readonly quotaType: string;
  public readonly limit: number;

  constructor(quotaType: string, limit: number) {
    super(
      `${quotaType} limit exceeded (${limit})`,
      ERROR_CODES.QUOTA_EXCEEDED,
      HTTP_STATUS.UNPROCESSABLE_ENTITY
    );
    this.quotaType = quotaType;
    this.limit = limit;
  }
}

export class EntitlementError extends AppError {
  public readonly feature: string;

  constructor(feature: string) {
    super(
      `Feature '${feature}' is not included in your current plan`,
      ERROR_CODES.ENTITLEMENT_REQUIRED,
      HTTP_STATUS.FORBIDDEN
    );
    this.feature = feature;
  }
}

export class ServiceUnavailableError extends AppError {
  public readonly service: string;

  constructor(service: string, message?: string) {
    super(
      message || `Service '${service}' is unavailable`,
      ERROR_CODES.SERVICE_UNAVAILABLE,
      HTTP_STATUS.SERVICE_UNAVAILABLE
    );
    this.service = service;
  }
}

export class ExternalServiceError extends AppError {
  public readonly service: string;
  public readonly originalError?: Error;

  constructor(service: string, message: string, originalError?: Error) {
    super(message, ERROR_CODES.INTERNAL_ERROR, HTTP_STATUS.BAD_REQUEST);
    this.service = service;
    this.originalError = originalError;
  }
}

export class SSRFError extends AppError {
  constructor(url: string) {
    super(
      `Potentially malicious URL detected: ${url}`,
      ERROR_CODES.SSRF_DETECTED,
      HTTP_STATUS.FORBIDDEN
    );
  }
}

export class UploadError extends AppError {
  public readonly allowedTypes: readonly string[];
  public readonly maxSize: number;

  constructor(message: string, allowedTypes?: readonly string[], maxSize?: number) {
    super(message, ERROR_CODES.VALIDATION_ERROR, HTTP_STATUS.BAD_REQUEST);
    this.allowedTypes = allowedTypes || [];
    this.maxSize = maxSize || 0;
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function handleError(error: unknown): AppError {
  if (isAppError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError(
      error.message,
      ERROR_CODES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }

  return new AppError(
    'An unexpected error occurred',
    ERROR_CODES.INTERNAL_ERROR,
    HTTP_STATUS.INTERNAL_SERVER_ERROR
  );
}
