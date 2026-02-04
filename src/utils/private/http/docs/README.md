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
- **Mobile Support**: Android and iOS emulation
- **Seed System**: Consistent fingerprints per account
- **Header Ordering**: Browser-specific header order
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
    preset: 'CHROME_WINDOWS',
    seed: 'account@email.com', // Consistent fingerprint per account
  },
})
```

### Mobile Fingerprint

```typescript
// Android
const client = new HttpClient({
  baseURL: 'https://api.example.com',
  fingerprint: {
    preset: 'CHROME_ANDROID',
  },
})

// iOS
const client = new HttpClient({
  baseURL: 'https://api.example.com',
  fingerprint: {
    preset: 'SAFARI_IOS',
  },
})
```

### Full Stealth Mode

```typescript
const client = new HttpClient({
  baseURL: 'https://api.example.com',
  proxy: {
    host: 'proxy.example.com',
    port: 8080,
    protocol: 'socks5',
  },
  fingerprint: {
    preset: 'CHROME_WINDOWS',
    seed: 'account@email.com',
    locales: ['vi-VN', 'en-US'],
  },
})
```

## Available Presets

### Desktop

| Preset | Description |
|--------|-------------|
| `CHROME_WINDOWS` | Chrome on Windows (most common) |
| `CHROME_MACOS` | Chrome on macOS |
| `CHROME_LINUX` | Chrome on Linux |
| `FIREFOX_WINDOWS` | Firefox on Windows |
| `FIREFOX_MACOS` | Firefox on macOS |
| `FIREFOX_LINUX` | Firefox on Linux |
| `SAFARI_MACOS` | Safari on macOS |
| `EDGE_WINDOWS` | Edge on Windows |

### Mobile

| Preset | Description |
|--------|-------------|
| `CHROME_ANDROID` | Chrome on Android |
| `CHROME_IOS` | Chrome on iOS |
| `FIREFOX_ANDROID` | Firefox on Android |
| `SAFARI_IOS` | Safari on iOS |

## Direct Header Generation

```typescript
import { generateFromPreset } from './http'

// Generate headers without HttpClient
const headers = generateFromPreset('CHROME_WINDOWS', 'my-seed')

// Use with any HTTP library
const response = await fetch(url, { headers })
```

## Limitations

| Feature | Status |
|---------|--------|
| HTTP Headers | ✅ Full browser emulation |
| Client Hints | ✅ Low + High entropy |
| Header Order | ✅ Browser-specific |
| Seed System | ✅ Consistent per account |
| TLS/JA3/JA4 | ❌ Node.js limitation |
| HTTP/2 | ❌ Node.js limitation |

For TLS fingerprint spoofing, consider `impit` or `curl-impersonate`.
