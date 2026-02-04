# HttpClient

HTTP client with proxy and fingerprint support.

## Table of Contents

- [Configuration](#configuration)
- [API Reference](#api-reference)
- [Generic Types](#generic-types)
- [AxiosRequestConfig Options](#axiosrequestconfig-options)
- [ProgressCallbacks](#progresscallbacks)
- [HTTP Methods](#http-methods)
- [Real-world Examples](#real-world-examples)
- [Runtime Configuration](#runtime-configuration)
- [Fingerprint Methods](#fingerprint-methods)
- [Interceptors](#interceptors)
- [Logging](#logging)

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

---

## API Reference

### HTTP Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `get` | `get<T>(url: string, config?: AxiosRequestConfig, progress?: ProgressCallbacks): Promise<T>` | GET request |
| `post` | `post<T, D>(url: string, data?: D, config?: AxiosRequestConfig, progress?: ProgressCallbacks): Promise<T>` | POST request |
| `put` | `put<T, D>(url: string, data?: D, config?: AxiosRequestConfig, progress?: ProgressCallbacks): Promise<T>` | PUT request |
| `patch` | `patch<T, D>(url: string, data?: D, config?: AxiosRequestConfig, progress?: ProgressCallbacks): Promise<T>` | PATCH request |
| `delete` | `delete<T>(url: string, config?: AxiosRequestConfig, progress?: ProgressCallbacks): Promise<T>` | DELETE request |
| `request` | `request<T>(config: AxiosRequestConfig, progress?: ProgressCallbacks): Promise<T>` | Custom request |

### Utility Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `getAxiosInstance` | `getAxiosInstance(): AxiosInstance` | Get underlying Axios instance |
| `setHeaders` | `setHeaders(headers: Record<string, string \| number \| boolean>): void` | Set multiple headers |
| `removeHeader` | `removeHeader(key: string): void` | Remove a header |
| `setTimeout` | `setTimeout(timeout: number): void` | Set request timeout |

### Proxy Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `setProxy` | `setProxy(proxy: ProxyConfig): void` | Set proxy at runtime |
| `removeProxy` | `removeProxy(): void` | Remove proxy |
| `getProxy` | `getProxy(): ProxyConfig \| undefined` | Get current proxy config |
| `hasProxy` | `hasProxy(): boolean` | Check if proxy is configured |

### Fingerprint Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `getFingerprintConfig` | `getFingerprintConfig(): FingerprintConfig \| undefined` | Get fingerprint config |
| `generateBrowserHeaders` | `generateBrowserHeaders(): BrowserHeaders \| undefined` | Generate new browser headers |
| `rotateFingerprintHeaders` | `rotateFingerprintHeaders(): void` | Rotate fingerprint headers |

---

## Generic Types

HttpClient methods use TypeScript generics for type-safe responses:

```typescript
// T = Response type (what you expect to receive)
// D = Data type (what you send in request body)

// Example: Get a list of users
interface User {
  id: number
  name: string
  email: string
}

// T = User[] (response will be array of User)
const users = await client.get<User[]>('/users')
// users is typed as User[]

// T = User, D = CreateUserDto
interface CreateUserDto {
  name: string
  email: string
}

const newUser = await client.post<User, CreateUserDto>('/users', {
  name: 'John',
  email: 'john@example.com',
})
// newUser is typed as User
```

### Common Patterns

```typescript
// Response with wrapper
interface ApiResponse<T> {
  data: T
  message: string
  success: boolean
}

const response = await client.get<ApiResponse<User[]>>('/users')
// response.data is User[]

// Void response (no body expected)
await client.delete<void>('/users/1')

// Unknown response (when type is not known)
const data = await client.get<unknown>('/dynamic-endpoint')
```

---

## AxiosRequestConfig Options

Common options you can pass to HTTP methods:

```typescript
interface AxiosRequestConfig {
  // Query parameters
  params?: Record<string, string | number | boolean>

  // Request headers
  headers?: Record<string, string>

  // Response type
  responseType?: 'json' | 'text' | 'blob' | 'arraybuffer' | 'document' | 'stream'

  // Request timeout (ms)
  timeout?: number

  // Base URL override
  baseURL?: string

  // Authentication
  auth?: {
    username: string
    password: string
  }

  // Max content length
  maxContentLength?: number
  maxBodyLength?: number

  // Validate status
  validateStatus?: (status: number) => boolean
}
```

### Examples

```typescript
// With query parameters
const users = await client.get<User[]>('/users', {
  params: {
    page: 1,
    limit: 10,
    status: 'active',
  },
})
// Request: GET /users?page=1&limit=10&status=active

// With custom headers
const data = await client.get('/protected', {
  headers: {
    'Authorization': 'Bearer token123',
    'X-Custom-Header': 'value',
  },
})

// With response type
const blob = await client.get<Blob>('/file.pdf', {
  responseType: 'blob',
})

// With timeout override
const data = await client.get('/slow-endpoint', {
  timeout: 60000, // 60 seconds
})

// With custom status validation
const data = await client.get('/endpoint', {
  validateStatus: (status) => status < 500, // Accept 4xx as valid
})
```

---

## ProgressCallbacks

Track upload and download progress:

```typescript
interface ProgressEvent {
  loaded: number // Bytes transferred
  total: number // Total bytes (0 if unknown)
  percentage: number // 0-100
}

interface ProgressCallbacks {
  onUploadProgress?: (event: ProgressEvent) => void
  onDownloadProgress?: (event: ProgressEvent) => void
}
```

### Examples

```typescript
// Track upload progress
await client.post('/upload', formData, undefined, {
  onUploadProgress: ({ loaded, total, percentage }) => {
    console.log(`Uploaded: ${loaded}/${total} bytes (${percentage}%)`)
    updateProgressBar(percentage)
  },
})

// Track download progress
await client.get('/large-file', undefined, {
  onDownloadProgress: ({ loaded, total, percentage }) => {
    console.log(`Downloaded: ${percentage}%`)
  },
})

// Both upload and download
await client.post('/process', data, undefined, {
  onUploadProgress: (e) => console.log(`Upload: ${e.percentage}%`),
  onDownloadProgress: (e) => console.log(`Download: ${e.percentage}%`),
})
```

---

## HTTP Methods

### Basic Usage

```typescript
const client = new HttpClient({ baseURL: 'https://api.example.com' })

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

## Real-world Examples

### File Upload with FormData

```typescript
// Single file upload
const file = document.getElementById('fileInput').files[0]
const formData = new FormData()
formData.append('file', file)
formData.append('description', 'My document')

const result = await client.post<UploadResponse>('/upload', formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
}, {
  onUploadProgress: ({ percentage }) => {
    console.log(`Upload progress: ${percentage}%`)
  },
})

// Multiple files upload
const files = document.getElementById('filesInput').files
const formData = new FormData()
for (let i = 0; i < files.length; i++) {
  formData.append('files', files[i])
}

await client.post('/upload-multiple', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
})
```

### File Download

```typescript
// Download as Blob
const blob = await client.get<Blob>('/files/document.pdf', {
  responseType: 'blob',
}, {
  onDownloadProgress: ({ percentage }) => {
    console.log(`Download: ${percentage}%`)
  },
})

// Save file in browser
const url = URL.createObjectURL(blob)
const a = document.createElement('a')
a.href = url
a.download = 'document.pdf'
a.click()
URL.revokeObjectURL(url)

// Download as ArrayBuffer
const buffer = await client.get<ArrayBuffer>('/files/data.bin', {
  responseType: 'arraybuffer',
})
```

### Query Parameters

```typescript
// Simple params
const users = await client.get<User[]>('/users', {
  params: {
    page: 1,
    limit: 20,
  },
})

// Search with filters
const products = await client.get<Product[]>('/products', {
  params: {
    search: 'laptop',
    category: 'electronics',
    minPrice: 100,
    maxPrice: 1000,
    inStock: true,
  },
})

// Array params
const items = await client.get<Item[]>('/items', {
  params: {
    ids: [1, 2, 3].join(','), // ids=1,2,3
  },
})
```

### JSON Request with Custom Headers

```typescript
const response = await client.post<ApiResponse>(
  '/api/data',
  {
    name: 'Test',
    value: 123,
  },
  {
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Request-ID': generateUUID(),
      'X-Client-Version': '1.0.0',
    },
  },
)
```

### Authentication

```typescript
// Bearer token
client.setHeaders({
  Authorization: `Bearer ${accessToken}`,
})

// Basic auth in request
const data = await client.get('/protected', {
  auth: {
    username: 'user',
    password: 'pass',
  },
})

// API key
client.setHeaders({
  'X-API-Key': 'your-api-key',
})
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
    // 401 - Redirect to login
    redirectToLogin()
  } else if (isNotFoundError(error)) {
    // 404 - Show not found
    showNotFound()
  } else if (isValidationError(error)) {
    // 400, 422 - Show validation errors
    console.log(error.errors) // { field: ['error message'] }
  } else if (isNetworkError(error)) {
    // No connection
    showOfflineMessage()
  } else if (isTimeoutError(error)) {
    // Request timeout
    showTimeoutMessage()
  } else if (isServerError(error)) {
    // 5xx - Show server error
    showServerError()
  }
}
```

### Pagination

```typescript
interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

async function fetchAllUsers(): Promise<User[]> {
  const allUsers: User[] = []
  let page = 1
  const limit = 100

  while (true) {
    const response = await client.get<PaginatedResponse<User>>('/users', {
      params: { page, limit },
    })

    allUsers.push(...response.data)

    if (page >= response.totalPages) {
      break
    }
    page++
  }

  return allUsers
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
      if (attempt === maxRetries) {
        throw error
      }
      if (isServerError(error) || isNetworkError(error)) {
        await new Promise((r) => setTimeout(r, delay * attempt))
        continue
      }
      throw error // Don't retry client errors
    }
  }
  throw new Error('Max retries exceeded')
}
```

---

## Runtime Configuration

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

// Set proxy at runtime
client.setProxy({
  host: '192.168.1.100',
  port: 8080,
})

// Remove proxy
client.removeProxy()

// Get proxy info
const proxy = client.getProxy()
const hasProxy = client.hasProxy()
```

---

## Fingerprint Methods

```typescript
// Get current config
const config = client.getFingerprintConfig()

// Generate new headers (for inspection)
const headers = client.generateBrowserHeaders()

// Rotate fingerprint headers (between requests)
client.rotateFingerprintHeaders()
```

---

## Access Axios Instance

```typescript
const axios = client.getAxiosInstance()

// Add custom interceptor
axios.interceptors.request.use((config) => {
  // Custom logic
  return config
})
```

---

## Interceptors

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
    logRequests: true, // Log outgoing requests
    logResponses: true, // Log responses
    logErrors: true, // Log errors (default: true)
    logPerformance: true, // Log request duration
  },
})
```
