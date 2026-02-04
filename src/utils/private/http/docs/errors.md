# Error Handling

Typed error classes with type guards for precise error handling.

## Table of Contents

- [Overview](#overview)
- [Error Hierarchy](#error-hierarchy)
- [API Reference](#api-reference)
- [Error Classes](#error-classes)
- [Type Guards](#type-guards)
- [Error Classification](#error-classification)
- [Usage Examples](#usage-examples)
- [Common Patterns](#common-patterns)
- [Retry Strategies](#retry-strategies)
- [Logging](#logging)
- [Best Practices](#best-practices)

---

## Overview

The error module provides:

| Feature | Description |
|---------|-------------|
| Typed Errors | Specific classes for each error type |
| Type Guards | Runtime type checking functions |
| Auto Classification | Convert AxiosError to typed errors |
| Original Error Access | Access underlying axios error |

---

## Error Hierarchy

```
Error
└── HttpError (base class)
    ├── NetworkError (no connection)
    ├── TimeoutError (request timeout)
    ├── AuthenticationError (401)
    ├── AuthorizationError (403)
    ├── NotFoundError (404)
    ├── ValidationError (4xx)
    └── ServerError (5xx)
```

---

## API Reference

### Error Classes

| Class | Constructor | Status Code |
|-------|-------------|-------------|
| `HttpError` | `(message: string, statusCode?: number, originalError?: AxiosError)` | Any |
| `NetworkError` | `(message?: string, originalError?: AxiosError)` | - |
| `TimeoutError` | `(message?: string, originalError?: AxiosError)` | 408 |
| `AuthenticationError` | `(message?: string, originalError?: AxiosError)` | 401 |
| `AuthorizationError` | `(message?: string, originalError?: AxiosError)` | 403 |
| `NotFoundError` | `(message?: string, originalError?: AxiosError)` | 404 |
| `ValidationError` | `(message: string, statusCode: number, errors?: Record<string, string[]>, originalError?: AxiosError)` | 4xx |
| `ServerError` | `(message: string, statusCode: number, originalError?: AxiosError)` | 5xx |

### Type Guards

| Function | Signature | Description |
|----------|-----------|-------------|
| `isHttpError` | `(error: Error): error is HttpError` | Check if HttpError |
| `isNetworkError` | `(error: Error): error is NetworkError` | Check if network failure |
| `isTimeoutError` | `(error: Error): error is TimeoutError` | Check if timeout |
| `isAuthenticationError` | `(error: Error): error is AuthenticationError` | Check if 401 |
| `isAuthorizationError` | `(error: Error): error is AuthorizationError` | Check if 403 |
| `isNotFoundError` | `(error: Error): error is NotFoundError` | Check if 404 |
| `isValidationError` | `(error: Error): error is ValidationError` | Check if 4xx validation |
| `isServerError` | `(error: Error): error is ServerError` | Check if 5xx |

### Utility Functions

| Function | Signature | Description |
|----------|-----------|-------------|
| `classifyError` | `(error: AxiosError): HttpError` | Convert AxiosError to typed error |

---

## Error Classes

### HttpError (Base Class)

Base class for all HTTP errors.

```typescript
class HttpError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly originalError?: AxiosError,
  )
}
```

**Properties:**
- `message: string` - Error message
- `name: string` - Class name (e.g., "AuthenticationError")
- `statusCode?: number` - HTTP status code
- `originalError?: AxiosError` - Original axios error

### NetworkError

Connection failed (no internet, DNS failure, etc.)

```typescript
class NetworkError extends HttpError {
  constructor(message = 'Network error', originalError?: AxiosError)
}
```

**When thrown:**
- No internet connection
- DNS resolution failed
- Server unreachable
- Connection refused

### TimeoutError

Request exceeded timeout limit.

```typescript
class TimeoutError extends HttpError {
  constructor(message = 'Request timeout', originalError?: AxiosError)
}
```

**When thrown:**
- Request takes longer than configured timeout
- `ECONNABORTED` error code

### AuthenticationError

HTTP 401 Unauthorized.

```typescript
class AuthenticationError extends HttpError {
  constructor(message = 'Unauthorized', originalError?: AxiosError)
}
```

**When thrown:**
- Missing or invalid credentials
- Expired token
- Invalid API key

### AuthorizationError

HTTP 403 Forbidden.

```typescript
class AuthorizationError extends HttpError {
  constructor(message = 'Forbidden', originalError?: AxiosError)
}
```

**When thrown:**
- Valid credentials but insufficient permissions
- Resource access denied
- Rate limited (some APIs)

### NotFoundError

HTTP 404 Not Found.

```typescript
class NotFoundError extends HttpError {
  constructor(message = 'Resource not found', originalError?: AxiosError)
}
```

**When thrown:**
- Resource doesn't exist
- Invalid endpoint
- Deleted resource

### ValidationError

HTTP 4xx client errors with validation details.

```typescript
class ValidationError extends HttpError {
  constructor(
    message: string,
    statusCode: number,
    public readonly errors?: Record<string, string[]>,
    originalError?: AxiosError,
  )
}
```

**Properties:**
- `errors?: Record<string, string[]>` - Field-level validation errors

**When thrown:**
- 400 Bad Request
- 422 Unprocessable Entity
- Other 4xx errors (except 401, 403, 404)

### ServerError

HTTP 5xx server errors.

```typescript
class ServerError extends HttpError {
  constructor(message: string, statusCode: number, originalError?: AxiosError)
}
```

**When thrown:**
- 500 Internal Server Error
- 502 Bad Gateway
- 503 Service Unavailable
- 504 Gateway Timeout

---

## Type Guards

Type guards narrow the error type for TypeScript.

### Import

```typescript
import {
  isAuthenticationError,
  isAuthorizationError,
  isHttpError,
  isNetworkError,
  isNotFoundError,
  isServerError,
  isTimeoutError,
  isValidationError,
} from './http'
```

### Usage

```typescript
try {
  await client.get('/users')
} catch (error) {
  // TypeScript knows 'error' is 'unknown' here

  if (isAuthenticationError(error)) {
    // TypeScript knows 'error' is AuthenticationError
    console.log(error.statusCode) // 401
    console.log(error.message) // "Unauthorized"
  }

  if (isValidationError(error)) {
    // TypeScript knows 'error' is ValidationError
    console.log(error.errors) // { email: ['Invalid format'] }
  }
}
```

### Check Order Matters

```typescript
// CORRECT - Check specific errors first
if (isAuthenticationError(error)) {
  // 401
} else if (isAuthorizationError(error)) {
  // 403
} else if (isNotFoundError(error)) {
  // 404
} else if (isValidationError(error)) {
  // Other 4xx
} else if (isServerError(error)) {
  // 5xx
} else if (isNetworkError(error)) {
  // No connection
} else if (isTimeoutError(error)) {
  // Timeout
} else if (isHttpError(error)) {
  // Any other HTTP error
}
```

---

## Error Classification

The `classifyError` function automatically converts AxiosError to typed errors.

### Import

```typescript
import { classifyError } from './http'
```

### Classification Rules

| Condition | Result |
|-----------|--------|
| No response + timeout message | `TimeoutError` |
| No response + `ECONNABORTED` | `TimeoutError` |
| No response (other) | `NetworkError` |
| Status 401 | `AuthenticationError` |
| Status 403 | `AuthorizationError` |
| Status 404 | `NotFoundError` |
| Status 400-499 | `ValidationError` |
| Status 500-599 | `ServerError` |
| Other | `HttpError` |

### Usage

```typescript
import axios from 'axios'
import { classifyError } from './http'

try {
  await axios.get('/users')
} catch (axiosError) {
  const error = classifyError(axiosError as AxiosError)
  // error is now a typed HttpError subclass

  if (isAuthenticationError(error)) {
    // Handle 401
  }
}
```

### Message Extraction

`classifyError` extracts the message from response data:

```typescript
// If server returns: { message: "User not found" }
// error.message = "User not found"

// If server returns: { errors: { email: ["Invalid"] } }
// ValidationError.errors = { email: ["Invalid"] }
```

---

## Usage Examples

### Basic Error Handling

```typescript
try {
  await client.get('/users')
} catch (error) {
  if (isAuthenticationError(error)) {
    // 401 - Redirect to login
    redirectToLogin()
  } else if (isAuthorizationError(error)) {
    // 403 - Show permission denied
    showPermissionDenied()
  } else if (isNotFoundError(error)) {
    // 404 - Show not found page
    showNotFound()
  } else if (isValidationError(error)) {
    // 4xx - Show validation errors
    showValidationErrors(error.errors)
  } else if (isServerError(error)) {
    // 5xx - Show server error
    showServerError()
  } else if (isNetworkError(error)) {
    // No connection
    showOfflineMessage()
  } else if (isTimeoutError(error)) {
    // Timeout
    showTimeoutMessage()
  } else {
    // Unknown error
    showGenericError()
  }
}
```

### Form Validation Errors

```typescript
interface FormErrors {
  [field: string]: string | undefined
}

async function submitForm(data: FormData): Promise<FormErrors | null> {
  try {
    await client.post('/users', data)
    return null // Success
  } catch (error) {
    if (isValidationError(error) && error.errors) {
      // Convert { field: ['error1', 'error2'] } to { field: 'error1' }
      const formErrors: FormErrors = {}
      for (const [field, messages] of Object.entries(error.errors)) {
        formErrors[field] = messages[0]
      }
      return formErrors
    }
    throw error // Re-throw non-validation errors
  }
}

// Usage
const errors = await submitForm(formData)
if (errors) {
  setFieldError('email', errors.email)
  setFieldError('password', errors.password)
}
```

### Access Original Error

```typescript
try {
  await client.get('/users')
} catch (error) {
  if (isHttpError(error) && error.originalError) {
    const axiosError = error.originalError

    // Access response data
    console.log('Response data:', axiosError.response?.data)
    console.log('Response headers:', axiosError.response?.headers)

    // Access request config
    console.log('Request URL:', axiosError.config?.url)
    console.log('Request method:', axiosError.config?.method)
    console.log('Request headers:', axiosError.config?.headers)
  }
}
```

### Custom onError Handler

```typescript
const client = new HttpClient({
  baseURL: 'https://api.example.com',
  onError: async (error) => {
    // Log all errors
    console.error('HTTP Error:', {
      type: error.name,
      status: error.statusCode,
      message: error.message,
    })

    // Handle authentication globally
    if (isAuthenticationError(error)) {
      // Try to refresh token
      const refreshed = await tryRefreshToken()
      if (!refreshed) {
        redirectToLogin()
      }
    }

    // Handle rate limiting
    if (error.statusCode === 429) {
      await delay(5000)
      // Could retry here...
    }

    throw error // Re-throw after handling
  },
})
```

### Error Boundary Pattern

```typescript
async function safeRequest<T>(
  request: () => Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    return await request()
  } catch (error) {
    if (isNetworkError(error) || isTimeoutError(error)) {
      // Use cached/fallback data for transient errors
      console.warn('Using fallback data:', error.message)
      return fallback
    }
    throw error // Re-throw other errors
  }
}

// Usage
const users = await safeRequest(
  () => client.get<User[]>('/users'),
  cachedUsers, // Fallback
)
```

---

## Common Patterns

### Switch Statement

```typescript
function handleError(error: unknown): void {
  if (!isHttpError(error)) {
    console.error('Unknown error:', error)
    return
  }

  switch (true) {
    case isAuthenticationError(error):
      redirectToLogin()
      break
    case isAuthorizationError(error):
      showPermissionDenied()
      break
    case isNotFoundError(error):
      showNotFound()
      break
    case isValidationError(error):
      showValidationErrors(error.errors)
      break
    case isServerError(error):
      showServerError(error.statusCode)
      break
    case isNetworkError(error):
      showOffline()
      break
    case isTimeoutError(error):
      showTimeout()
      break
    default:
      showGenericError(error.message)
  }
}
```

### Error Handler Map

```typescript
type ErrorHandler = (error: HttpError) => void

const errorHandlers: Map<string, ErrorHandler> = new Map([
  ['AuthenticationError', () => redirectToLogin()],
  ['AuthorizationError', () => showPermissionDenied()],
  ['NotFoundError', () => showNotFound()],
  ['ValidationError', (e) => showValidationErrors((e as ValidationError).errors)],
  ['ServerError', () => showServerError()],
  ['NetworkError', () => showOffline()],
  ['TimeoutError', () => showTimeout()],
])

function handleError(error: unknown): void {
  if (!isHttpError(error)) {
    showGenericError()
    return
  }

  const handler = errorHandlers.get(error.name)
  if (handler) {
    handler(error)
  } else {
    showGenericError()
  }
}
```

### Centralized Error Handler

```typescript
class ErrorHandler {
  private listeners: Map<string, ((error: HttpError) => void)[]> = new Map()

  on(errorType: string, handler: (error: HttpError) => void): void {
    const handlers = this.listeners.get(errorType) || []
    handlers.push(handler)
    this.listeners.set(errorType, handlers)
  }

  handle(error: unknown): void {
    if (!isHttpError(error)) {
      console.error('Unknown error:', error)
      return
    }

    const handlers = this.listeners.get(error.name) || []
    handlers.forEach((handler) => handler(error))

    // Always call 'all' handlers
    const allHandlers = this.listeners.get('all') || []
    allHandlers.forEach((handler) => handler(error))
  }
}

// Usage
const errorHandler = new ErrorHandler()
errorHandler.on('AuthenticationError', () => redirectToLogin())
errorHandler.on('all', (error) => logError(error))

try {
  await client.get('/users')
} catch (error) {
  errorHandler.handle(error)
}
```

---

## Retry Strategies

### Simple Retry

```typescript
async function fetchWithRetry<T>(
  request: () => Promise<T>,
  maxRetries = 3,
): Promise<T> {
  let lastError: Error | undefined

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await request()
    } catch (error) {
      lastError = error as Error

      // Don't retry client errors (4xx)
      if (isValidationError(error)
        || isAuthenticationError(error)
        || isAuthorizationError(error)
        || isNotFoundError(error)) {
        throw error
      }

      // Retry server/network/timeout errors
      if (attempt < maxRetries) {
        console.log(`Retry ${attempt}/${maxRetries}...`)
        await delay(1000 * attempt) // Exponential backoff
      }
    }
  }

  throw lastError
}
```

### Retry with Exponential Backoff

```typescript
interface RetryConfig {
  maxRetries: number
  baseDelay: number
  maxDelay: number
  retryOn: (error: HttpError) => boolean
}

const defaultRetryConfig: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  retryOn: (error) => {
    // Retry on server errors, network errors, timeout
    return isServerError(error)
      || isNetworkError(error)
      || isTimeoutError(error)
  },
}

async function fetchWithBackoff<T>(
  request: () => Promise<T>,
  config: Partial<RetryConfig> = {},
): Promise<T> {
  const { maxRetries, baseDelay, maxDelay, retryOn } = {
    ...defaultRetryConfig,
    ...config,
  }

  let lastError: HttpError | undefined

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await request()
    } catch (error) {
      if (!isHttpError(error)) {
        throw error
      }

      lastError = error

      if (!retryOn(error) || attempt === maxRetries) {
        throw error
      }

      // Exponential backoff with jitter
      const delay = Math.min(
        baseDelay * 2 ** attempt + Math.random() * 1000,
        maxDelay,
      )

      console.log(`Retry ${attempt + 1}/${maxRetries} in ${delay}ms...`)
      await new Promise((r) => setTimeout(r, delay))
    }
  }

  throw lastError
}
```

### Retry on 429 (Rate Limit)

```typescript
async function fetchWithRateLimitRetry<T>(
  request: () => Promise<T>,
): Promise<T> {
  try {
    return await request()
  } catch (error) {
    if (isHttpError(error) && error.statusCode === 429) {
      // Check Retry-After header
      const retryAfter = error.originalError?.response?.headers['retry-after']
      const delay = retryAfter ? Number.parseInt(retryAfter, 10) * 1000 : 5000

      console.log(`Rate limited, waiting ${delay}ms...`)
      await new Promise((r) => setTimeout(r, delay))

      return request() // Retry once
    }
    throw error
  }
}
```

---

## Logging

### Basic Logging

```typescript
function logError(error: HttpError): void {
  console.error('HTTP Error:', {
    type: error.name,
    status: error.statusCode,
    message: error.message,
    url: error.originalError?.config?.url,
    method: error.originalError?.config?.method,
  })
}
```

### Structured Logging

```typescript
interface ErrorLog {
  timestamp: string
  type: string
  status?: number
  message: string
  url?: string
  method?: string
  requestId?: string
  userId?: string
  responseData?: unknown
}

function createErrorLog(error: HttpError, context?: { userId?: string }): ErrorLog {
  const config = error.originalError?.config
  const response = error.originalError?.response

  return {
    timestamp: new Date().toISOString(),
    type: error.name,
    status: error.statusCode,
    message: error.message,
    url: config?.url,
    method: config?.method?.toUpperCase(),
    requestId: response?.headers['x-request-id'],
    userId: context?.userId,
    responseData: response?.data,
  }
}

// Usage
try {
  await client.get('/users')
} catch (error) {
  if (isHttpError(error)) {
    const log = createErrorLog(error, { userId: currentUser.id })
    logger.error(log)
  }
}
```

### Error Reporting Service

```typescript
async function reportError(error: HttpError): Promise<void> {
  // Send to error tracking service (Sentry, Bugsnag, etc.)
  await errorReportingService.capture({
    name: error.name,
    message: error.message,
    extra: {
      statusCode: error.statusCode,
      url: error.originalError?.config?.url,
      method: error.originalError?.config?.method,
      responseData: error.originalError?.response?.data,
    },
  })
}
```

---

## Best Practices

### 1. Always Use Type Guards

```typescript
// BAD - Type unsafe
catch (error: any) {
  if (error.statusCode === 401) { ... }
}

// GOOD - Type safe
catch (error) {
  if (isAuthenticationError(error)) { ... }
}
```

### 2. Handle All Error Types

```typescript
try {
  await client.get('/users')
} catch (error) {
  // Handle specific errors
  if (isAuthenticationError(error)) { ... }
  else if (isNotFoundError(error)) { ... }
  // ...

  // Always have a fallback
  else {
    console.error('Unexpected error:', error)
    showGenericError()
  }
}
```

### 3. Don't Swallow Errors

```typescript
// BAD - Error hidden
try {
  await client.get('/users')
} catch (error) {
  // Nothing here
}

// GOOD - Error handled or re-thrown
try {
  await client.get('/users')
} catch (error) {
  if (isNotFoundError(error)) {
    return [] // Expected case
  }
  throw error // Unexpected case
}
```

### 4. Use onError for Global Handling

```typescript
const client = new HttpClient({
  baseURL: 'https://api.example.com',
  onError: (error) => {
    // Log all errors
    logError(error)

    // Report to monitoring
    if (isServerError(error)) {
      reportError(error)
    }

    // Handle auth globally
    if (isAuthenticationError(error)) {
      handleAuthError()
    }

    throw error // Don't forget to re-throw!
  },
})
```

### 5. Provide User-Friendly Messages

```typescript
function getUserMessage(error: HttpError): string {
  if (isNetworkError(error)) {
    return 'Please check your internet connection'
  }
  if (isTimeoutError(error)) {
    return 'Request timed out. Please try again'
  }
  if (isAuthenticationError(error)) {
    return 'Your session has expired. Please log in again'
  }
  if (isAuthorizationError(error)) {
    return 'You don\'t have permission to access this resource'
  }
  if (isNotFoundError(error)) {
    return 'The requested resource was not found'
  }
  if (isServerError(error)) {
    return 'Server error. Please try again later'
  }
  return 'Something went wrong. Please try again'
}
```

### 6. Preserve Error Context

```typescript
// BAD - Context lost
throw new Error('Failed to load users')

// GOOD - Context preserved
throw new HttpError(
  `Failed to load users: ${originalError.message}`,
  originalError.response?.status,
  originalError,
)
```
