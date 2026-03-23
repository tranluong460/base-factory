export class HttpError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly headers: Record<string, string> = {},
    public readonly body: string = '',
  ) {
    super(message)
    this.name = this.constructor.name
  }
}

export class NetworkError extends HttpError {
  constructor(message: string) {
    super(message, 0)
  }
}

export class TimeoutError extends HttpError {
  constructor(
    message: string,
    public readonly timeoutMs: number,
  ) {
    super(message, 408)
  }
}

export class BlockedError extends HttpError {}

export class RateLimitError extends HttpError {
  public readonly retryAfter: number | undefined

  constructor(message: string, headers: Record<string, string> = {}, body: string = '') {
    super(message, 429, headers, body)
    const retryHeader = headers['retry-after'] ?? headers['Retry-After']
    this.retryAfter = retryHeader ? Number(retryHeader) || undefined : undefined
  }
}

export class ValidationError extends HttpError {}

export class AuthenticationError extends HttpError {
  constructor(message: string, headers: Record<string, string> = {}, body: string = '') {
    super(message, 401, headers, body)
  }
}

export class NotFoundError extends HttpError {
  constructor(message: string, headers: Record<string, string> = {}, body: string = '') {
    super(message, 404, headers, body)
  }
}

export class ServerError extends HttpError {}

// ─── Type Guards ───────────────────────────────────────────────

export function isHttpError(error: unknown): error is HttpError {
  return error instanceof HttpError
}

export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof NetworkError
}

export function isTimeoutError(error: unknown): error is TimeoutError {
  return error instanceof TimeoutError
}

export function isBlockedError(error: unknown): error is BlockedError {
  return error instanceof BlockedError
}

export function isRateLimitError(error: unknown): error is RateLimitError {
  return error instanceof RateLimitError
}

export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError
}

export function isAuthenticationError(error: unknown): error is AuthenticationError {
  return error instanceof AuthenticationError
}

export function isNotFoundError(error: unknown): error is NotFoundError {
  return error instanceof NotFoundError
}

export function isServerError(error: unknown): error is ServerError {
  return error instanceof ServerError
}

// ─── Error Classification ──────────────────────────────────────

export function isCloudflareBlock(status: number, headers: Record<string, string>): boolean {
  if (status !== 403) {
    return false
  }
  const cfMitigated = headers['cf-mitigated'] ?? headers['Cf-Mitigated']
  const server = String(headers.server ?? headers.Server ?? '')
  return cfMitigated === 'challenge' || server.toLowerCase().includes('cloudflare')
}

export function classifyError(
  status: number,
  headers: Record<string, string>,
  body: string,
  url: string,
): HttpError {
  if (isCloudflareBlock(status, headers)) {
    return new BlockedError(
      `[HttpClient] Cloudflare blocked request to ${url}`,
      status,
      headers,
      body,
    )
  }

  if (status === 401) {
    return new AuthenticationError(`[HttpClient] Authentication failed for ${url}`, headers, body)
  }

  if (status === 404) {
    return new NotFoundError(`[HttpClient] Not found: ${url}`, headers, body)
  }

  if (status === 429) {
    return new RateLimitError(`[HttpClient] Rate limited for ${url}`, headers, body)
  }

  if (status >= 400 && status < 500) {
    return new ValidationError(
      `[HttpClient] Client error ${status} for ${url}`,
      status,
      headers,
      body,
    )
  }

  if (status >= 500) {
    return new ServerError(`[HttpClient] Server error ${status} for ${url}`, status, headers, body)
  }

  return new HttpError(`[HttpClient] Unexpected status ${status} for ${url}`, status, headers, body)
}
