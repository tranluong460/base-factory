# HttpClient

HTTP client with proxy and fingerprint support.

## Table of Contents

- [Configuration](#configuration)
- [HTTP Methods](#http-methods)
- [Generic Types](#generic-types)
- [Request Config](#request-config)
- [Progress Callbacks](#progress-callbacks)
- [Proxy Methods](#proxy-methods)
- [Fingerprint Methods](#fingerprint-methods)
- [Utility Methods](#utility-methods)
- [Interceptors](#interceptors)
- [Logging](#logging)
- [Examples](#examples)

---

## Configuration

```typescript
interface HttpClientConfig {
  baseURL: string
  timeout?: number // Default: 30000ms
  headers?: Record<string, string>
  proxy?: ProxyConfig
  fingerprint?: FingerprintConfig
  logging?: LoggingConfig
  transformRequest?: (data, headers) => data
  transformResponse?: (data) => data
  onRequest?: (config) => config
  onResponse?: (response) => response
  onError?: (error) => never
}
```

### Basic Setup

```typescript
import { HttpClient } from './http'

const client = new HttpClient({
  baseURL: 'https://api.example.com',
  timeout: 30000,
})
```

### With Fingerprint

```typescript
const client = new HttpClient({
  baseURL: 'https://api.example.com',
  fingerprint: {
    preset: 'CHROME_WINDOWS',
    seed: 'account@email.com',
  },
})
```

### With Proxy

```typescript
const client = new HttpClient({
  baseURL: 'https://api.example.com',
  proxy: {
    host: '192.168.1.100',
    port: 8080,
    protocol: 'socks5',
  },
})
```

---

## HTTP Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `get` | `get<T>(url, config?, progress?): Promise<T>` | GET request |
| `post` | `post<T, D>(url, data?, config?, progress?): Promise<T>` | POST request |
| `put` | `put<T, D>(url, data?, config?, progress?): Promise<T>` | PUT request |
| `patch` | `patch<T, D>(url, data?, config?, progress?): Promise<T>` | PATCH request |
| `delete` | `delete<T>(url, config?, progress?): Promise<T>` | DELETE request |
| `request` | `request<T>(config, progress?): Promise<T>` | Custom request |

### Basic Usage

```typescript
// GET
const users = await client.get<User[]>('/users')

// POST
const newUser = await client.post<User>('/users', { name: 'John' })

// PUT (full update)
await client.put('/users/1', { name: 'Jane', email: 'jane@example.com' })

// PATCH (partial update)
await client.patch('/users/1', { name: 'Jane' })

// DELETE
await client.delete('/users/1')

// Custom request
const result = await client.request<Data>({
  method: 'POST',
  url: '/custom',
  data: { foo: 'bar' },
})
```

---

## Generic Types

```typescript
// T = Response type, D = Data type

interface User {
  id: number
  name: string
  email: string
}

// Response typed as User[]
const users = await client.get<User[]>('/users')

// Request body typed as CreateUserDto, response as User
interface CreateUserDto {
  name: string
  email: string
}

const newUser = await client.post<User, CreateUserDto>('/users', {
  name: 'John',
  email: 'john@example.com',
})
```

---

## Request Config

Common options passed to HTTP methods:

```typescript
// Query parameters
const users = await client.get<User[]>('/users', {
  params: { page: 1, limit: 10 },
})
// Request: GET /users?page=1&limit=10

// Custom headers
const data = await client.get('/protected', {
  headers: {
    'Authorization': 'Bearer token123',
  },
})

// Response type
const blob = await client.get<Blob>('/file.pdf', {
  responseType: 'blob',
})

// Timeout override
const data = await client.get('/slow-endpoint', {
  timeout: 60000,
})

// Status validation
const data = await client.get('/endpoint', {
  validateStatus: (status) => status < 500,
})
```

---

## Progress Callbacks

Track upload and download progress:

```typescript
interface ProgressEvent {
  loaded: number // Bytes transferred
  total: number  // Total bytes (0 if unknown)
  percentage: number // 0-100
}

// Track upload progress
await client.post('/upload', formData, undefined, {
  onUploadProgress: ({ loaded, total, percentage }) => {
    console.log(`Upload: ${percentage}%`)
  },
})

// Track download progress
await client.get('/large-file', undefined, {
  onDownloadProgress: ({ percentage }) => {
    console.log(`Download: ${percentage}%`)
  },
})
```

---

## Proxy Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `setProxy` | `setProxy(proxy: ProxyConfig): void` | Set proxy at runtime |
| `removeProxy` | `removeProxy(): void` | Remove proxy |
| `getProxy` | `getProxy(): ProxyConfig \| undefined` | Get current proxy |
| `hasProxy` | `hasProxy(): boolean` | Check if proxy set |

```typescript
// Initially no proxy
await client.get('/public')

// Add proxy for sensitive requests
client.setProxy({
  host: 'proxy.example.com',
  port: 8080,
})
await client.get('/sensitive')

// Remove proxy
client.removeProxy()

// Check proxy status
if (client.hasProxy()) {
  const config = client.getProxy()
  console.log(`Proxy: ${config.host}:${config.port}`)
}
```

---

## Fingerprint Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `getFingerprintConfig` | `getFingerprintConfig(): FingerprintConfig \| undefined` | Get config |
| `generateBrowserHeaders` | `generateBrowserHeaders(): BrowserHeaders \| undefined` | Generate new headers |
| `rotateFingerprintHeaders` | `rotateFingerprintHeaders(): void` | Rotate headers |

```typescript
// Get current config
const config = client.getFingerprintConfig()

// Generate new headers (for inspection)
const headers = client.generateBrowserHeaders()
console.log(headers['user-agent'])

// Rotate fingerprint between requests (for session variety)
client.rotateFingerprintHeaders()
await client.get('/page2')
```

> **Note**: When using `seed`, rotation will always produce the same fingerprint. Remove `seed` if you want different fingerprints on rotation.

---

## Utility Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `getAxiosInstance` | `getAxiosInstance(): AxiosInstance` | Get Axios instance |
| `setHeaders` | `setHeaders(headers): void` | Set multiple headers |
| `removeHeader` | `removeHeader(key): void` | Remove a header |
| `setTimeout` | `setTimeout(timeout): void` | Set timeout |

```typescript
// Set headers
client.setHeaders({
  'Authorization': 'Bearer token',
  'X-Custom': 'value',
})

// Remove header
client.removeHeader('X-Custom')

// Set timeout
client.setTimeout(60000)

// Access axios instance
const axios = client.getAxiosInstance()
axios.interceptors.request.use((config) => {
  // Custom logic
  return config
})
```

---

## Interceptors

Configure request/response interceptors in constructor:

```typescript
const client = new HttpClient({
  baseURL: 'https://api.example.com',

  onRequest: (config) => {
    config.headers['X-Request-Time'] = Date.now().toString()
    return config
  },

  onResponse: (response) => {
    console.log('Response received:', response.status)
    return response
  },

  onError: async (error) => {
    if (error.statusCode === 401) {
      // Handle unauthorized
    }
    throw error
  },
})
```

---

## Logging

```typescript
const client = new HttpClient({
  baseURL: 'https://api.example.com',
  logging: {
    logRequests: true,   // Log outgoing requests
    logResponses: true,  // Log responses
    logErrors: true,     // Log errors (default: true)
    logPerformance: true, // Log request duration
  },
})
```

---

## Examples

### Authentication

```typescript
// Bearer token
client.setHeaders({
  Authorization: `Bearer ${accessToken}`,
})

// API key
client.setHeaders({
  'X-API-Key': 'your-api-key',
})

// Basic auth in request
const data = await client.get('/protected', {
  auth: {
    username: 'user',
    password: 'pass',
  },
})
```

### File Upload

```typescript
const formData = new FormData()
formData.append('file', file)
formData.append('description', 'My document')

const result = await client.post<UploadResponse>('/upload', formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
}, {
  onUploadProgress: ({ percentage }) => {
    updateProgressBar(percentage)
  },
})
```

### File Download

```typescript
const blob = await client.get<Blob>('/files/document.pdf', {
  responseType: 'blob',
}, {
  onDownloadProgress: ({ percentage }) => {
    console.log(`Download: ${percentage}%`)
  },
})

// Save in browser
const url = URL.createObjectURL(blob)
const a = document.createElement('a')
a.href = url
a.download = 'document.pdf'
a.click()
URL.revokeObjectURL(url)
```

### Error Handling

```typescript
import {
  isAuthenticationError,
  isNetworkError,
  isNotFoundError,
  isServerError,
  isTimeoutError,
  isValidationError,
} from './http'

try {
  const user = await client.get<User>('/users/1')
} catch (error) {
  if (isAuthenticationError(error)) {
    redirectToLogin()
  } else if (isNotFoundError(error)) {
    showNotFound()
  } else if (isValidationError(error)) {
    showValidationErrors(error.errors)
  } else if (isNetworkError(error)) {
    showOfflineMessage()
  } else if (isTimeoutError(error)) {
    showTimeoutMessage()
  } else if (isServerError(error)) {
    showServerError()
  }
}
```

### Retry Pattern

```typescript
async function fetchWithRetry<T>(
  url: string,
  maxRetries = 3,
  delay = 1000,
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await client.get<T>(url)
    } catch (error) {
      if (attempt === maxRetries) throw error
      if (isServerError(error) || isNetworkError(error)) {
        await new Promise(r => setTimeout(r, delay * attempt))
        continue
      }
      throw error // Don't retry client errors
    }
  }
  throw new Error('Max retries exceeded')
}
```

### Pagination

```typescript
interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  totalPages: number
}

async function fetchAllUsers(): Promise<User[]> {
  const allUsers: User[] = []
  let page = 1

  while (true) {
    const response = await client.get<PaginatedResponse<User>>('/users', {
      params: { page, limit: 100 },
    })

    allUsers.push(...response.data)

    if (page >= response.totalPages) break
    page++
  }

  return allUsers
}
```
