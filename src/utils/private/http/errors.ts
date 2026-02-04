import type { AxiosError } from 'axios'

// ==================== Error Classes ====================

/** Base HTTP error class */
export class HttpError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly originalError?: AxiosError,
  ) {
    super(message)
    this.name = this.constructor.name
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

/** Network connection error */
export class NetworkError extends HttpError {
  constructor(message = 'Network error', originalError?: AxiosError) {
    super(message, undefined, originalError)
  }
}

/** Request timeout error */
export class TimeoutError extends HttpError {
  constructor(message = 'Request timeout', originalError?: AxiosError) {
    super(message, 408, originalError)
  }
}

/** Validation error (4xx) */
export class ValidationError extends HttpError {
  constructor(
    message: string,
    statusCode: number,
    public readonly errors?: Record<string, string[]>,
    originalError?: AxiosError,
  ) {
    super(message, statusCode, originalError)
  }
}

/** Authentication error (401) */
export class AuthenticationError extends HttpError {
  constructor(message = 'Unauthorized', originalError?: AxiosError) {
    super(message, 401, originalError)
  }
}

/** Authorization error (403) */
export class AuthorizationError extends HttpError {
  constructor(message = 'Forbidden', originalError?: AxiosError) {
    super(message, 403, originalError)
  }
}

/** Not found error (404) */
export class NotFoundError extends HttpError {
  constructor(message = 'Resource not found', originalError?: AxiosError) {
    super(message, 404, originalError)
  }
}

/** Server error (5xx) */
export class ServerError extends HttpError {
  constructor(message: string, statusCode: number, originalError?: AxiosError) {
    super(message, statusCode, originalError)
  }
}

// ==================== Type Guards ====================

export const isHttpError = (error: Error): error is HttpError => error instanceof HttpError
export const isNetworkError = (error: Error): error is NetworkError => error instanceof NetworkError
export const isTimeoutError = (error: Error): error is TimeoutError => error instanceof TimeoutError
export function isValidationError(error: Error): error is ValidationError {
  return error instanceof ValidationError
}
export function isAuthenticationError(error: Error): error is AuthenticationError {
  return error instanceof AuthenticationError
}
export function isAuthorizationError(error: Error): error is AuthorizationError {
  return error instanceof AuthorizationError
}
export function isNotFoundError(error: Error): error is NotFoundError {
  return error instanceof NotFoundError
}
export const isServerError = (error: Error): error is ServerError => error instanceof ServerError

// ==================== Error Classifier ====================

/** Classify AxiosError into specific error type */
export function classifyError(error: AxiosError): HttpError {
  // No response = network/timeout error
  if (!error.response) {
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return new TimeoutError(error.message, error)
    }
    return new NetworkError(error.message, error)
  }

  const status = error.response.status
  const message = (error.response.data as { message?: string })?.message || error.message

  // Classify by status code
  switch (status) {
    case 401:
      return new AuthenticationError(message, error)
    case 403:
      return new AuthorizationError(message, error)
    case 404:
      return new NotFoundError(message, error)
  }

  if (status >= 400 && status < 500) {
    const errors = (error.response.data as { errors?: Record<string, string[]> })?.errors
    return new ValidationError(message, status, errors, error)
  }

  if (status >= 500) {
    return new ServerError(message, status, error)
  }

  return new HttpError(message, status, error)
}
