# Browser Fingerprint

Emulate real browser fingerprints to avoid bot detection.

## Table of Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Presets](#presets)
- [Configuration](#configuration)
- [Usage Examples](#usage-examples)
- [Generated Headers](#generated-headers)
- [Seed System](#seed-system)
- [Header Ordering](#header-ordering)
- [Limitations](#limitations)
- [Best Practices](#best-practices)

---

## Overview

The fingerprint module generates realistic HTTP headers that mimic real browsers:

| Component | Description |
|-----------|-------------|
| User-Agent | Browser, OS, version (UA Reduction format) |
| Client Hints | sec-ch-ua, platform, mobile, full-version-list |
| Sec-Fetch | Request context headers |
| Accept headers | Content type preferences |
| Priority | RFC 9218 priority hints (Chrome 124+) |
| Header Order | Browser-specific header ordering |

---

## How It Works

### HTTP Fingerprinting

Websites detect bots by analyzing HTTP headers. Real browsers send specific header patterns:

```
# Bot (easily detected)
User-Agent: axios/1.6.0

# Real Browser (what we generate)
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36
sec-ch-ua: "Not)A;Brand";v="8", "Chromium";v="139", "Google Chrome";v="139"
sec-ch-ua-mobile: ?0
sec-ch-ua-platform: "Windows"
sec-ch-ua-full-version-list: "Not)A;Brand";v="8.0.0.0", "Chromium";v="139.0.7258.88", "Google Chrome";v="139.0.7258.88"
priority: u=0, i
accept-encoding: gzip, deflate, br, zstd
```

### Key Techniques

| Technique | Description |
|-----------|-------------|
| UA Reduction | Chrome 110+ uses `Chrome/xxx.0.0.0` format |
| GREASE Brands | Rotating fake brands per version to prevent fingerprinting |
| Client Hints | Low entropy (default) + High entropy headers |
| Header Order | Browser-specific ordering (Chrome, Firefox, Safari have different orders) |
| Priority Header | Chrome/Firefox 124+ send `u=0, i` |
| zstd Encoding | Chrome 123+ supports zstd compression |

---

## Presets

### Browser Versions (2024-2026)

| Browser | Version Range |
|---------|---------------|
| Chrome | 130 - 145 |
| Firefox | 130 - 147 |
| Safari | 18 - 26 |
| Edge | 130 - 144 |

### Desktop Presets

| Preset | Browser | OS | Use Case |
|--------|---------|-----|----------|
| `CHROME_WINDOWS` | Chrome | Windows 10/11 | Most common, best compatibility |
| `CHROME_MACOS` | Chrome | macOS | Mac users |
| `CHROME_LINUX` | Chrome | Linux | Developer persona |
| `FIREFOX_WINDOWS` | Firefox | Windows | Privacy-focused |
| `FIREFOX_MACOS` | Firefox | macOS | Mac + privacy |
| `FIREFOX_LINUX` | Firefox | Linux | Linux developer |
| `SAFARI_MACOS` | Safari | macOS | Apple ecosystem |
| `EDGE_WINDOWS` | Edge | Windows | Enterprise |

### Mobile Presets

| Preset | Browser | OS | Use Case |
|--------|---------|-----|----------|
| `CHROME_ANDROID` | Chrome | Android | General Android |
| `CHROME_IOS` | Chrome | iOS | iOS + Google services |
| `FIREFOX_ANDROID` | Firefox | Android | Mobile privacy |
| `SAFARI_IOS` | Safari | iOS | iPhone/iPad |

---

## Configuration

### FingerprintConfig Interface

```typescript
interface FingerprintConfig {
  /** Enable fingerprint generation */
  enabled?: boolean

  /** Use preset (recommended) */
  preset?: FingerprintPreset

  /** Locale preferences (e.g., 'en-US', 'vi-VN') */
  locales?: string[]

  /** Shuffle TLS ciphers */
  shuffleCiphers?: boolean

  /**
   * Seed for consistent fingerprint generation.
   * Same seed = same fingerprint every time.
   * Useful for maintaining consistent identity per account.
   */
  seed?: string
}
```

### Available Presets

```typescript
type DesktopPreset =
  | 'CHROME_WINDOWS'
  | 'CHROME_MACOS'
  | 'CHROME_LINUX'
  | 'FIREFOX_WINDOWS'
  | 'FIREFOX_MACOS'
  | 'FIREFOX_LINUX'
  | 'SAFARI_MACOS'
  | 'EDGE_WINDOWS'

type MobilePreset =
  | 'CHROME_ANDROID'
  | 'CHROME_IOS'
  | 'FIREFOX_ANDROID'
  | 'SAFARI_IOS'

type FingerprintPreset = DesktopPreset | MobilePreset
```

---

## Usage Examples

### Basic Preset Usage

```typescript
import { HttpClient } from './http'

// Chrome on Windows (most common)
const client = new HttpClient({
  baseURL: 'https://api.example.com',
  fingerprint: {
    preset: 'CHROME_WINDOWS',
  },
})
```

### With Consistent Fingerprint (Seed)

```typescript
// Same seed = same fingerprint every time
const client = new HttpClient({
  baseURL: 'https://api.example.com',
  fingerprint: {
    preset: 'CHROME_WINDOWS',
    seed: 'account-123@email.com', // Use account ID as seed
  },
})

// Each account gets unique but consistent fingerprint
const client1 = new HttpClient({
  fingerprint: { preset: 'CHROME_WINDOWS', seed: 'user-1' },
}) // Always same fingerprint for user-1

const client2 = new HttpClient({
  fingerprint: { preset: 'CHROME_WINDOWS', seed: 'user-2' },
}) // Different fingerprint for user-2
```

### Mobile Emulation

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

### With Custom Locale

```typescript
// Vietnamese locale
const client = new HttpClient({
  baseURL: 'https://api.example.com',
  fingerprint: {
    preset: 'CHROME_WINDOWS',
    locales: ['vi-VN', 'en-US'],
  },
})
```

### Direct Header Generation

```typescript
import { generateFromPreset, generateHeaders } from './http'

// From preset
const headers = generateFromPreset('CHROME_WINDOWS', 'my-seed')

// From config
const headers = generateHeaders({
  enabled: true,
  preset: 'CHROME_WINDOWS',
  seed: 'my-seed',
})
```

---

## Generated Headers

### Chrome Windows Example

```http
connection: keep-alive
sec-ch-ua: "Not)A;Brand";v="8", "Chromium";v="139", "Google Chrome";v="139"
sec-ch-ua-mobile: ?0
sec-ch-ua-platform: "Windows"
upgrade-insecure-requests: 1
user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36
accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7
sec-fetch-site: none
sec-fetch-mode: navigate
sec-fetch-user: ?1
sec-fetch-dest: document
accept-encoding: gzip, deflate, br, zstd
accept-language: en-US,en;q=0.9
priority: u=0, i
sec-ch-ua-full-version-list: "Not)A;Brand";v="8.0.0.0", "Chromium";v="139.0.7258.88", "Google Chrome";v="139.0.7258.88"
```

### Firefox Windows Example

```http
user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:139.0) Gecko/20100101 Firefox/139.0
accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8
accept-language: en-US,en;q=0.9
accept-encoding: gzip, deflate, br
dnt: 1
connection: keep-alive
upgrade-insecure-requests: 1
sec-fetch-dest: document
sec-fetch-mode: navigate
sec-fetch-site: none
sec-fetch-user: ?1
priority: u=0, i
```

### Safari macOS Example

```http
accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
accept-language: en-US,en;q=0.9
accept-encoding: gzip, deflate, br
connection: keep-alive
user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15
upgrade-insecure-requests: 1
```

### Browser-Specific Differences

| Header | Chrome | Firefox | Safari | Edge |
|--------|--------|---------|--------|------|
| sec-ch-ua | Yes | No | No | Yes |
| sec-ch-ua-full-version-list | Yes | No | No | Yes |
| sec-fetch-* | Yes | Yes | No | Yes |
| priority | Yes | Yes | No | Yes |
| dnt | No | Yes | No | No |
| accept-encoding (zstd) | Yes | No | No | Yes |

---

## Seed System

The seed system ensures consistent fingerprints for the same account:

### How It Works

```typescript
// Same seed always produces same:
// - Browser version (e.g., Chrome 139)
// - Patch version (e.g., 139.0.7258.88)
// - GREASE brand (e.g., "Not)A;Brand")

const h1 = generateFromPreset('CHROME_WINDOWS', 'account@email.com')
const h2 = generateFromPreset('CHROME_WINDOWS', 'account@email.com')
// h1 === h2 (identical headers)

const h3 = generateFromPreset('CHROME_WINDOWS', 'other@email.com')
// h3 !== h1 (different version/patch)
```

### Why Use Seeds?

| Without Seed | With Seed |
|--------------|-----------|
| Random version each time | Consistent version per account |
| Bot detection: "Why does this user change browser every request?" | Natural: "Same user, same browser" |
| Fingerprint changes on every request | Fingerprint persists across sessions |

### Best Practice

```typescript
// Use account identifier as seed
const client = new HttpClient({
  fingerprint: {
    preset: 'CHROME_WINDOWS',
    seed: account.email, // or account.id
  },
})
```

---

## Header Ordering

Real browsers send headers in specific order. This module replicates browser-specific ordering:

### Chrome Order

```
connection → sec-ch-ua → sec-ch-ua-mobile → sec-ch-ua-platform →
upgrade-insecure-requests → user-agent → accept → sec-fetch-site →
sec-fetch-mode → sec-fetch-user → sec-fetch-dest → accept-encoding →
accept-language → priority → sec-ch-ua-full-version-list
```

### Firefox Order

```
user-agent → accept → accept-language → accept-encoding →
dnt → connection → upgrade-insecure-requests → sec-fetch-dest →
sec-fetch-mode → sec-fetch-site → sec-fetch-user → priority
```

### Safari Order

```
accept → accept-language → accept-encoding → connection →
user-agent → upgrade-insecure-requests
```

### Why Order Matters

Some bot detection systems check header order. Wrong order = detected as bot.

```typescript
// Generated headers are already properly ordered
const headers = generateFromPreset('CHROME_WINDOWS')
// Headers object maintains insertion order (ES2015+)
```

---

## Limitations

### What We CAN Bypass

| Detection Method | Status |
|-----------------|--------|
| User-Agent checking | ✅ Bypassed |
| sec-ch-ua checking | ✅ Bypassed |
| Missing headers detection | ✅ Bypassed |
| Header order checking | ✅ Bypassed |
| Client Hints validation | ✅ Bypassed |
| GREASE brand detection | ✅ Bypassed |

### What We CANNOT Bypass

| Detection Method | Reason |
|-----------------|--------|
| TLS/JA3/JA4 fingerprint | Node.js limitation - cannot control TLS handshake |
| HTTP/2 fingerprint | Node.js uses HTTP/1.1 by default |
| JavaScript challenges | No JS execution in HTTP client |
| Canvas fingerprint | No browser rendering |
| WebGL fingerprint | No browser rendering |
| Behavioral analysis | Timing, mouse patterns not applicable |

### For Advanced Anti-Bot Systems

For Cloudflare, PerimeterX, DataDome, etc:

1. Use real browser automation (Puppeteer, Playwright)
2. Use specialized libraries like `impit` or `curl-impersonate`
3. Use residential proxies
4. Add human-like delays and patterns

### Sufficient For

| Service | Status |
|---------|--------|
| Hotmail/Outlook | ✅ Works |
| Gmail | ✅ Works |
| Basic APIs | ✅ Works |
| Simple websites | ✅ Works |

---

## Best Practices

### 1. Use Seed Per Account

```typescript
// Each account maintains its own identity
const client = new HttpClient({
  fingerprint: {
    preset: 'CHROME_WINDOWS',
    seed: account.email,
  },
})
```

### 2. Match Fingerprint to Proxy Location

```typescript
// Vietnamese proxy → Vietnamese locale
const client = new HttpClient({
  proxy: { host: 'vn-proxy.example.com', port: 8080 },
  fingerprint: {
    preset: 'CHROME_WINDOWS',
    locales: ['vi-VN', 'en-US'],
  },
})
```

### 3. Use Consistent Device Type

```typescript
// Don't mix desktop and mobile in same session
// Choose one and stick with it

// Desktop session
fingerprint: { preset: 'CHROME_WINDOWS' }

// Mobile session
fingerprint: { preset: 'CHROME_ANDROID' }
```

### 4. Add Human-like Delays

```typescript
async function humanDelay() {
  const delay = Math.floor(Math.random() * 3000) + 1000 // 1-4 seconds
  await new Promise(r => setTimeout(r, delay))
}

for (const url of urls) {
  await client.get(url)
  await humanDelay()
}
```

### 5. Handle Detection Gracefully

```typescript
try {
  await client.get(url)
} catch (error) {
  if (error.statusCode === 403 || error.statusCode === 429) {
    // Possibly detected - wait and retry with same fingerprint
    // (don't change fingerprint as that looks even more suspicious)
    await delay(30000)
    await client.get(url)
  }
}
```
