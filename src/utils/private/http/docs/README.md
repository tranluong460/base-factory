# HTTP Client Module

HTTP client with proxy support, browser fingerprint emulation, and error handling.

## Quick Start

```typescript
import { HttpClient } from './http'

// Basic usage
const client = new HttpClient({
  baseURL: 'https://api.example.com',
  timeout: 30000,
})

const data = await client.get('/users')
```

## Features

- **HTTP Methods**: GET, POST, PUT, PATCH, DELETE
- **Proxy Support**: HTTP, HTTPS, SOCKS4, SOCKS5
- **Browser Fingerprint**: Emulate real browsers (Chrome, Firefox, Safari, Edge)
- **Mobile Support**: Android and iOS device emulation
- **Error Handling**: Typed errors with type guards
- **Progress Tracking**: Upload/download progress callbacks

## Documentation

| Document | Description |
|----------|-------------|
| [Client](./client.md) | HttpClient configuration and methods |
| [Fingerprint](./fingerprint.md) | Browser fingerprint emulation |
| [Proxy](./proxy.md) | Proxy configuration |
| [Errors](./errors.md) | Error types and handling |

## Basic Examples

### With Proxy

```typescript
const client = new HttpClient({
  baseURL: 'https://api.example.com',
  proxy: {
    host: '192.168.1.100',
    port: 8080,
    protocol: 'http',
  },
})
```

### With Fingerprint

```typescript
const client = new HttpClient({
  baseURL: 'https://api.example.com',
  fingerprint: {
    preset: 'CHROME_WINDOWS', // Emulate Chrome on Windows
  },
})
```

### Mobile Fingerprint

```typescript
const client = new HttpClient({
  baseURL: 'https://api.example.com',
  fingerprint: {
    preset: 'SAFARI_IPHONE', // Emulate Safari on iPhone
  },
})
```
