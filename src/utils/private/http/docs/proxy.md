# Proxy Configuration

Support for HTTP, HTTPS, SOCKS4, and SOCKS5 proxies.

## Table of Contents

- [Overview](#overview)
- [API Reference](#api-reference)
- [Configuration](#configuration)
- [Protocol Types](#protocol-types)
- [Usage Examples](#usage-examples)
- [Runtime Management](#runtime-management)
- [Proxy Rotation](#proxy-rotation)
- [Error Handling](#error-handling)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

---

## Overview

The proxy module provides:

| Feature | Description |
|---------|-------------|
| Multiple Protocols | HTTP, HTTPS, SOCKS4, SOCKS5 |
| Authentication | Username/password support |
| Runtime Changes | Set/remove proxy dynamically |
| Proxy Rotation | Easy proxy pool management |

### Use Cases

| Use Case | Recommended Protocol |
|----------|---------------------|
| Basic web scraping | HTTP |
| Secure connections | HTTPS or SOCKS5 |
| Anonymity | SOCKS5 |
| Legacy systems | SOCKS4 |
| Geo-restriction bypass | Any (with correct location) |

---

## API Reference

### HttpClient Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `setProxy` | `setProxy(proxy: ProxyConfig): void` | Set proxy at runtime |
| `removeProxy` | `removeProxy(): void` | Remove current proxy |
| `getProxy` | `getProxy(): ProxyConfig \| undefined` | Get current proxy config |
| `hasProxy` | `hasProxy(): boolean` | Check if proxy is set |

### Helper Functions

| Function | Signature | Description |
|----------|-----------|-------------|
| `createProxyAgents` | `createProxyAgents(proxy: ProxyConfig): ProxyAgents` | Create HTTP/HTTPS agents |

### Types

```typescript
interface ProxyConfig {
  host: string
  port: number
  auth?: ProxyAuth
  protocol?: 'http' | 'https' | 'socks4' | 'socks5'
}

interface ProxyAuth {
  username: string
  password: string
}

interface ProxyAgents {
  httpAgent: Agent
  httpsAgent: Agent
}
```

---

## Configuration

### Basic Structure

```typescript
interface ProxyConfig {
  /** Proxy server hostname or IP */
  host: string

  /** Proxy server port */
  port: number

  /** Optional authentication */
  auth?: {
    username: string
    password: string
  }

  /** Protocol type (default: 'http') */
  protocol?: 'http' | 'https' | 'socks4' | 'socks5'
}
```

### Configuration Examples

```typescript
// Minimal config (HTTP proxy)
const proxy = {
  host: '192.168.1.100',
  port: 8080,
}

// With authentication
const proxy = {
  host: '192.168.1.100',
  port: 8080,
  auth: {
    username: 'user',
    password: 'pass',
  },
}

// SOCKS5 with auth
const proxy = {
  host: '192.168.1.100',
  port: 1080,
  protocol: 'socks5',
  auth: {
    username: 'user',
    password: 'pass',
  },
}
```

---

## Protocol Types

### HTTP Proxy

Standard HTTP proxy, most common type.

```typescript
const client = new HttpClient({
  baseURL: 'https://api.example.com',
  proxy: {
    host: '192.168.1.100',
    port: 8080,
    protocol: 'http', // optional, default
  },
})
```

**Characteristics:**
- Widely supported
- Easy to set up
- Traffic visible to proxy server
- Good for general use

### HTTPS Proxy

Encrypted connection to proxy server.

```typescript
const client = new HttpClient({
  baseURL: 'https://api.example.com',
  proxy: {
    host: 'secure-proxy.example.com',
    port: 443,
    protocol: 'https',
  },
})
```

**Characteristics:**
- Encrypted proxy connection
- More secure than HTTP proxy
- Slightly higher overhead

### SOCKS5 Proxy

Most versatile and secure option.

```typescript
const client = new HttpClient({
  baseURL: 'https://api.example.com',
  proxy: {
    host: '192.168.1.100',
    port: 1080,
    protocol: 'socks5',
  },
})
```

**Characteristics:**
- Supports any protocol (HTTP, HTTPS, FTP, etc.)
- Optional authentication
- Better anonymity
- Works at TCP level
- Supports UDP (not in this implementation)

### SOCKS4 Proxy

Legacy SOCKS protocol.

```typescript
const client = new HttpClient({
  baseURL: 'https://api.example.com',
  proxy: {
    host: '192.168.1.100',
    port: 1080,
    protocol: 'socks4',
  },
})
```

**Characteristics:**
- No authentication support
- IPv4 only
- Older but still widely available

### Protocol Comparison

| Feature | HTTP | HTTPS | SOCKS4 | SOCKS5 |
|---------|------|-------|--------|--------|
| Authentication | Yes | Yes | No | Yes |
| Encryption | No | Yes | No | No* |
| IPv6 | Yes | Yes | No | Yes |
| UDP | No | No | No | Yes |
| Performance | Fast | Medium | Fast | Fast |
| Anonymity | Low | Medium | Medium | High |

*SOCKS5 doesn't encrypt traffic, but can tunnel encrypted connections

---

## Usage Examples

### Basic HTTP Proxy

```typescript
const client = new HttpClient({
  baseURL: 'https://api.example.com',
  proxy: {
    host: '192.168.1.100',
    port: 8080,
  },
})

const data = await client.get('/users')
```

### HTTP Proxy with Authentication

```typescript
const client = new HttpClient({
  baseURL: 'https://api.example.com',
  proxy: {
    host: 'proxy.example.com',
    port: 8080,
    auth: {
      username: 'proxyuser',
      password: 'proxypass123',
    },
  },
})
```

### SOCKS5 Proxy

```typescript
const client = new HttpClient({
  baseURL: 'https://api.example.com',
  proxy: {
    host: 'socks.example.com',
    port: 1080,
    protocol: 'socks5',
    auth: {
      username: 'user',
      password: 'pass',
    },
  },
})
```

### Combined with Fingerprint

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
    shuffleCiphers: true,
  },
})
```

### From Environment Variables

```typescript
const client = new HttpClient({
  baseURL: 'https://api.example.com',
  proxy: {
    host: process.env.PROXY_HOST!,
    port: Number.parseInt(process.env.PROXY_PORT!, 10),
    protocol: process.env.PROXY_PROTOCOL as 'http' | 'socks5',
    auth: process.env.PROXY_USER
      ? {
          username: process.env.PROXY_USER,
          password: process.env.PROXY_PASS!,
        }
      : undefined,
  },
})
```

### Parse Proxy URL

```typescript
function parseProxyUrl(url: string): ProxyConfig {
  const parsed = new URL(url)
  return {
    host: parsed.hostname,
    port: Number.parseInt(parsed.port, 10),
    protocol: parsed.protocol.replace(':', '') as any,
    auth: parsed.username
      ? {
          username: decodeURIComponent(parsed.username),
          password: decodeURIComponent(parsed.password),
        }
      : undefined,
  }
}

// Usage
const proxy = parseProxyUrl('socks5://user:pass@192.168.1.100:1080')
const client = new HttpClient({
  baseURL: 'https://api.example.com',
  proxy,
})
```

---

## Runtime Management

### Set Proxy Dynamically

```typescript
const client = new HttpClient({
  baseURL: 'https://api.example.com',
})

// Initially no proxy
await client.get('/public-endpoint')

// Add proxy for sensitive requests
client.setProxy({
  host: 'proxy.example.com',
  port: 8080,
})
await client.get('/sensitive-endpoint')

// Remove proxy
client.removeProxy()
await client.get('/public-endpoint')
```

### Check Proxy Status

```typescript
// Check if proxy is configured
if (client.hasProxy()) {
  const config = client.getProxy()
  console.log(`Proxy: ${config.protocol}://${config.host}:${config.port}`)
} else {
  console.log('No proxy configured')
}
```

### Switch Between Proxies

```typescript
const usProxy = { host: 'us.proxy.com', port: 8080 }
const euProxy = { host: 'eu.proxy.com', port: 8080 }
const asiaProxy = { host: 'asia.proxy.com', port: 8080 }

// US requests
client.setProxy(usProxy)
await client.get('/us-content')

// EU requests
client.setProxy(euProxy)
await client.get('/eu-content')

// Asia requests
client.setProxy(asiaProxy)
await client.get('/asia-content')
```

---

## Proxy Rotation

### Basic Rotation

```typescript
const proxies: ProxyConfig[] = [
  { host: '192.168.1.100', port: 8080 },
  { host: '192.168.1.101', port: 8080 },
  { host: '192.168.1.102', port: 8080 },
]

let proxyIndex = 0

function rotateProxy() {
  proxyIndex = (proxyIndex + 1) % proxies.length
  client.setProxy(proxies[proxyIndex])
}

// Use different proxy for each request
for (const url of urls) {
  rotateProxy()
  await client.get(url)
}
```

### Random Rotation

```typescript
function getRandomProxy(): ProxyConfig {
  return proxies[Math.floor(Math.random() * proxies.length)]
}

for (const url of urls) {
  client.setProxy(getRandomProxy())
  await client.get(url)
}
```

### Weighted Rotation

```typescript
interface WeightedProxy {
  proxy: ProxyConfig
  weight: number // Higher = more likely
}

const weightedProxies: WeightedProxy[] = [
  { proxy: { host: 'fast.proxy.com', port: 8080 }, weight: 10 },
  { proxy: { host: 'medium.proxy.com', port: 8080 }, weight: 5 },
  { proxy: { host: 'slow.proxy.com', port: 8080 }, weight: 1 },
]

function getWeightedProxy(): ProxyConfig {
  const totalWeight = weightedProxies.reduce((sum, p) => sum + p.weight, 0)
  let random = Math.random() * totalWeight

  for (const { proxy, weight } of weightedProxies) {
    random -= weight
    if (random <= 0) {
      return proxy
    }
  }
  return weightedProxies[0].proxy
}
```

### Proxy Pool with Health Checking

```typescript
class ProxyPool {
  private proxies: ProxyConfig[]
  private healthy: Set<string> = new Set()
  private client: HttpClient

  constructor(proxies: ProxyConfig[]) {
    this.proxies = proxies
    this.client = new HttpClient({ baseURL: '' })
    this.proxies.forEach((p) => this.healthy.add(this.key(p)))
  }

  private key(p: ProxyConfig): string {
    return `${p.host}:${p.port}`
  }

  async checkHealth(proxy: ProxyConfig): Promise<boolean> {
    try {
      this.client.setProxy(proxy)
      await this.client.get('https://httpbin.org/ip', { timeout: 5000 })
      return true
    } catch {
      return false
    }
  }

  markUnhealthy(proxy: ProxyConfig): void {
    this.healthy.delete(this.key(proxy))
  }

  markHealthy(proxy: ProxyConfig): void {
    this.healthy.add(this.key(proxy))
  }

  getHealthyProxy(): ProxyConfig | undefined {
    const healthyProxies = this.proxies.filter((p) => this.healthy.has(this.key(p)))
    if (healthyProxies.length === 0) {
      return undefined
    }
    return healthyProxies[Math.floor(Math.random() * healthyProxies.length)]
  }

  async refreshHealth(): Promise<void> {
    for (const proxy of this.proxies) {
      const isHealthy = await this.checkHealth(proxy)
      if (isHealthy) {
        this.markHealthy(proxy)
      } else {
        this.markUnhealthy(proxy)
      }
    }
  }
}
```

---

## Error Handling

### Proxy Connection Errors

```typescript
import { isNetworkError, isTimeoutError } from './http'

try {
  await client.get('/endpoint')
} catch (error) {
  if (isNetworkError(error)) {
    console.error('Proxy connection failed')
    // Try different proxy
    client.setProxy(backupProxy)
    await client.get('/endpoint')
  } else if (isTimeoutError(error)) {
    console.error('Proxy timeout')
    // Increase timeout or switch proxy
  }
}
```

### Automatic Retry with Fallback

```typescript
async function fetchWithProxyFallback<T>(
  client: HttpClient,
  url: string,
  proxies: ProxyConfig[],
): Promise<T> {
  for (const proxy of proxies) {
    try {
      client.setProxy(proxy)
      return await client.get<T>(url)
    } catch (error) {
      console.warn(`Proxy ${proxy.host} failed, trying next...`)
      continue
    }
  }
  throw new Error('All proxies failed')
}
```

### Handle Proxy Authentication Errors

```typescript
try {
  await client.get('/endpoint')
} catch (error) {
  if (error.statusCode === 407) {
    console.error('Proxy authentication failed')
    // Check credentials
  }
}
```

---

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Connection refused | Wrong host/port | Verify proxy address |
| Connection timeout | Proxy overloaded | Try different proxy |
| 407 Proxy Auth Required | Wrong credentials | Check username/password |
| SSL errors | Proxy doesn't support HTTPS | Use SOCKS5 instead |
| Slow responses | Proxy location far away | Use closer proxy |

### Debug Proxy Connection

```typescript
const client = new HttpClient({
  baseURL: 'https://api.example.com',
  proxy: {
    host: 'proxy.example.com',
    port: 8080,
  },
  logging: {
    logRequests: true,
    logResponses: true,
    logErrors: true,
    logPerformance: true,
  },
})
```

### Verify Proxy is Working

```typescript
// Check your IP through proxy
const client = new HttpClient({
  baseURL: 'https://httpbin.org',
  proxy: yourProxy,
})

const result = await client.get<{ origin: string }>('/ip')
console.log('Request IP:', result.origin)
// Should show proxy IP, not your real IP
```

### Test Proxy Latency

```typescript
async function testProxyLatency(proxy: ProxyConfig): Promise<number> {
  const client = new HttpClient({
    baseURL: 'https://httpbin.org',
    proxy,
  })

  const start = Date.now()
  await client.get('/get')
  return Date.now() - start
}

// Test all proxies
for (const proxy of proxies) {
  const latency = await testProxyLatency(proxy)
  console.log(`${proxy.host}: ${latency}ms`)
}
```

---

## Best Practices

### 1. Always Have Fallback Proxies

```typescript
const primaryProxy = { host: 'primary.proxy.com', port: 8080 }
const fallbackProxies = [
  { host: 'backup1.proxy.com', port: 8080 },
  { host: 'backup2.proxy.com', port: 8080 },
]

try {
  client.setProxy(primaryProxy)
  await client.get(url)
} catch {
  for (const proxy of fallbackProxies) {
    try {
      client.setProxy(proxy)
      await client.get(url)
      break
    } catch {
      continue
    }
  }
}
```

### 2. Match Proxy Location to Target

```typescript
// Accessing US content → use US proxy
const usProxy = { host: 'us.proxy.com', port: 8080 }

// Accessing Japanese content → use JP proxy
const jpProxy = { host: 'jp.proxy.com', port: 8080 }
```

### 3. Rotate Proxies for Scraping

```typescript
const urls = ['url1', 'url2', 'url3',]

for (let i = 0; i < urls.length; i++) {
  // Use different proxy for each request
  client.setProxy(proxies[i % proxies.length])

  // Also rotate fingerprint
  client.rotateFingerprintHeaders()

  await client.get(urls[i])

  // Add delay between requests
  await delay(1000 + Math.random() * 2000)
}
```

### 4. Monitor Proxy Health

```typescript
// Periodically check proxy health
setInterval(async () => {
  for (const proxy of proxies) {
    const isHealthy = await checkProxyHealth(proxy)
    if (!isHealthy) {
      console.warn(`Proxy ${proxy.host} is down`)
      removeFromPool(proxy)
    }
  }
}, 60000) // Every minute
```

### 5. Secure Credential Storage

```typescript
// DON'T hardcode credentials
const proxy = {
  host: 'proxy.com',
  port: 8080,
  auth: {
    username: 'admin', // Bad!
    password: 'password123', // Bad!
  },
}

// DO use environment variables
const proxy = {
  host: process.env.PROXY_HOST!,
  port: Number.parseInt(process.env.PROXY_PORT!, 10),
  auth: {
    username: process.env.PROXY_USER!,
    password: process.env.PROXY_PASS!,
  },
}
```

### 6. Set Appropriate Timeouts

```typescript
const client = new HttpClient({
  baseURL: 'https://api.example.com',
  timeout: 30000, // 30 seconds for proxy connections
  proxy: {
    host: 'slow-proxy.com',
    port: 8080,
  },
})

// Or per-request
await client.get('/slow-endpoint', {
  timeout: 60000, // 60 seconds for this request
})
```
