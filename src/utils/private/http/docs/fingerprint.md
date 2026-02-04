# Browser Fingerprint

Emulate real browser fingerprints to avoid bot detection.

## Table of Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [API Reference](#api-reference)
- [Presets](#presets)
- [Configuration Options](#configuration-options)
- [Usage Examples](#usage-examples)
- [Header Rotation](#header-rotation)
- [TLS Fingerprint Evasion](#tls-fingerprint-evasion)
- [Device Database](#device-database)
- [Direct API Usage](#direct-api-usage)
- [Generated Headers Explained](#generated-headers-explained)
- [Limitations](#limitations)
- [Best Practices](#best-practices)

---

## Overview

The fingerprint module generates realistic HTTP headers that mimic real browsers:

| Component | Description |
|-----------|-------------|
| User-Agent | Browser, OS, device information |
| sec-ch-ua | Client Hints (Chrome/Edge) |
| Accept headers | Content type preferences |
| Sec-Fetch headers | Request context |
| TLS Ciphers | Shuffled cipher order |

---

## How It Works

### HTTP Fingerprinting

Websites detect bots by analyzing HTTP headers. Real browsers send specific header patterns:

```
# Bot (easily detected)
User-Agent: axios/1.6.0

# Real Browser (what we generate)
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36...
sec-ch-ua: "Chromium";v="131", "Google Chrome";v="131"
sec-ch-ua-mobile: ?0
sec-ch-ua-platform: "Windows"
```

### TLS Fingerprinting (JA3/JA4)

Websites can also fingerprint TLS handshake parameters:
- Cipher suite order
- TLS extensions
- Supported curves

**Our solution**: Shuffle cipher order to vary TLS fingerprint. This bypasses basic JA3 detection but not advanced JA4+ systems.

---

## API Reference

### HttpClient Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `getFingerprintConfig` | `getFingerprintConfig(): FingerprintConfig \| undefined` | Get current config |
| `generateBrowserHeaders` | `generateBrowserHeaders(): BrowserHeaders \| undefined` | Generate new headers |
| `rotateFingerprintHeaders` | `rotateFingerprintHeaders(): void` | Apply new random headers |

### Header Generation Functions

| Function | Signature | Description |
|----------|-----------|-------------|
| `generateHeaders` | `generateHeaders(config: FingerprintConfig): BrowserHeaders` | Generate from config |
| `generateFromPreset` | `generateFromPreset(preset: FingerprintPreset): BrowserHeaders` | Generate from preset |
| `createHeaderGenerator` | `createHeaderGenerator(config: FingerprintConfig): HeaderGenerator` | Create reusable generator |

### Preset Functions

| Function | Signature | Description |
|----------|-----------|-------------|
| `getPreset` | `getPreset(name: FingerprintPreset): PresetData` | Get preset data |
| `getPresetNames` | `getPresetNames(): FingerprintPreset[]` | List all preset names |
| `getPresetsByDevice` | `getPresetsByDevice(device: 'desktop' \| 'mobile'): FingerprintPreset[]` | Filter by device |
| `getPresetsByOS` | `getPresetsByOS(os: string): FingerprintPreset[]` | Filter by OS |
| `getPresetsByBrowser` | `getPresetsByBrowser(browser: string): FingerprintPreset[]` | Filter by browser |

### Device Functions

| Function | Signature | Description |
|----------|-----------|-------------|
| `getRandomDevice` | `getRandomDevice(brand: MobileDeviceBrand): MobileDeviceInfo` | Random device by brand |
| `getRandomAndroidVersion` | `getRandomAndroidVersion(): string` | Random Android version |
| `getRandomIOSVersion` | `getRandomIOSVersion(): string` | Random iOS version |
| `getDeviceBrands` | `getDeviceBrands(platform: 'android' \| 'ios'): MobileDeviceBrand[]` | List brands |
| `getDevicesByBrand` | `getDevicesByBrand(brand: MobileDeviceBrand): DeviceInfo[]` | List devices |

### TLS Functions

| Function | Signature | Description |
|----------|-----------|-------------|
| `createStealthAgent` | `createStealthAgent(options?: AgentOptions): https.Agent` | Create agent with shuffled ciphers |
| `getShuffledCiphers` | `getShuffledCiphers(): string` | Get randomized cipher string |
| `getDefaultCiphers` | `getDefaultCiphers(): string[]` | Get Node.js default ciphers |
| `isCipherShufflingSupported` | `isCipherShufflingSupported(): boolean` | Check TLS support |

---

## Presets

### Desktop Presets

| Preset | Browser | Version | OS | Use Case |
|--------|---------|---------|-----|----------|
| `CHROME_WINDOWS` | Chrome | 130-133 | Windows 10/11 | Most common, best compatibility |
| `CHROME_MACOS` | Chrome | 130-133 | macOS | Mac users |
| `CHROME_LINUX` | Chrome | 130-133 | Linux | Developer persona |
| `FIREFOX_WINDOWS` | Firefox | 130-133 | Windows | Privacy-focused |
| `FIREFOX_MACOS` | Firefox | 130-133 | macOS | Mac + privacy |
| `FIREFOX_LINUX` | Firefox | 130-133 | Linux | Linux developer |
| `SAFARI_MACOS` | Safari | 17-18 | macOS | Apple ecosystem |
| `EDGE_WINDOWS` | Edge | 130-133 | Windows | Enterprise |

### Android Presets

| Preset | Browser | Devices | Use Case |
|--------|---------|---------|----------|
| `CHROME_ANDROID` | Chrome | All brands | General mobile |
| `CHROME_ANDROID_SAMSUNG` | Chrome | Samsung Galaxy | Premium Android |
| `CHROME_ANDROID_PIXEL` | Chrome | Google Pixel | Stock Android |
| `CHROME_ANDROID_XIAOMI` | Chrome | Xiaomi/Redmi | Asian markets |
| `FIREFOX_ANDROID` | Firefox | Various | Mobile privacy |

### iOS Presets

| Preset | Browser | Devices | Use Case |
|--------|---------|---------|----------|
| `SAFARI_IOS` | Safari | iPhone + iPad | General iOS |
| `SAFARI_IPHONE` | Safari | iPhone only | Mobile iOS |
| `SAFARI_IPAD` | Safari | iPad only | Tablet |
| `CHROME_IOS` | Chrome | iPhone | iOS + Google services |

---

## Configuration Options

### FingerprintConfig Interface

```typescript
interface FingerprintConfig {
  /** Enable fingerprint generation */
  enabled?: boolean

  /** Use preset (overrides other options) */
  preset?: FingerprintPreset

  /** Browser specifications */
  browsers?: (BrowserName | BrowserSpec)[]

  /** Target operating systems */
  operatingSystems?: OperatingSystem[]

  /** Device types */
  devices?: DeviceType[]

  /** Mobile device brands */
  mobileDevices?: MobileDeviceBrand[]

  /** Locale preferences */
  locales?: string[]

  /** TLS cipher shuffling */
  shuffleCiphers?: boolean
}
```

### BrowserSpec Interface

```typescript
interface BrowserSpec {
  name: BrowserName // 'chrome' | 'firefox' | 'safari' | 'edge'
  minVersion?: number // Minimum version (default: 120)
  maxVersion?: number // Maximum version (default: 125)
}
```

### Type Definitions

```typescript
type BrowserName = 'chrome' | 'firefox' | 'safari' | 'edge'

type OperatingSystem = 'windows' | 'macos' | 'linux' | 'android' | 'ios'

type DeviceType = 'desktop' | 'mobile'

type MobileDeviceBrand =
  | 'samsung' | 'pixel' | 'xiaomi' | 'oppo'
  | 'huawei' | 'oneplus' | 'iphone' | 'ipad' | 'generic'
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

### Custom Configuration

```typescript
// Random between Chrome and Firefox on Windows/macOS
const client = new HttpClient({
  baseURL: 'https://api.example.com',
  fingerprint: {
    enabled: true,
    browsers: ['chrome', 'firefox'],
    operatingSystems: ['windows', 'macos'],
    devices: ['desktop'],
  },
})
```

### Specific Browser Version

```typescript
// Chrome version 130-131 only
const client = new HttpClient({
  baseURL: 'https://api.example.com',
  fingerprint: {
    enabled: true,
    browsers: [{ name: 'chrome', minVersion: 130, maxVersion: 131 }],
    operatingSystems: ['windows'],
  },
})
```

### Mobile Emulation

```typescript
// Android Samsung/Pixel
const client = new HttpClient({
  baseURL: 'https://api.example.com',
  fingerprint: {
    enabled: true,
    browsers: ['chrome'],
    operatingSystems: ['android'],
    devices: ['mobile'],
    mobileDevices: ['samsung', 'pixel'],
  },
})

// iOS iPhone
const client = new HttpClient({
  baseURL: 'https://api.example.com',
  fingerprint: {
    preset: 'SAFARI_IPHONE',
  },
})

// iPad
const client = new HttpClient({
  baseURL: 'https://api.example.com',
  fingerprint: {
    preset: 'SAFARI_IPAD',
  },
})
```

### With TLS Cipher Shuffling

```typescript
const client = new HttpClient({
  baseURL: 'https://api.example.com',
  fingerprint: {
    preset: 'CHROME_WINDOWS',
    shuffleCiphers: true, // Randomize TLS fingerprint
  },
})
```

### Full Stealth Mode

```typescript
const client = new HttpClient({
  baseURL: 'https://api.example.com',
  fingerprint: {
    preset: 'CHROME_WINDOWS',
    shuffleCiphers: true,
  },
  proxy: {
    host: 'proxy.example.com',
    port: 8080,
    protocol: 'socks5',
  },
})
```

---

## Header Rotation

Rotate fingerprint between requests to avoid pattern detection:

### Basic Rotation

```typescript
const client = new HttpClient({
  baseURL: 'https://api.example.com',
  fingerprint: { preset: 'CHROME_WINDOWS' },
})

// Make first request
await client.get('/page1')

// Rotate headers (new User-Agent, sec-ch-ua, etc.)
client.rotateFingerprintHeaders()

// Make request with different fingerprint
await client.get('/page2')
```

### Rotation per Request

```typescript
const urls = ['/page1', '/page2', '/page3', '/page4', '/page5']

for (const url of urls) {
  // Rotate before each request
  client.rotateFingerprintHeaders()
  await client.get(url)

  // Add delay to appear more human
  await delay(randomInt(1000, 3000))
}
```

### Inspect Generated Headers

```typescript
// Generate headers without applying
const headers = client.generateBrowserHeaders()
console.log(headers)
// {
//   'user-agent': 'Mozilla/5.0 (Windows NT 10.0...',
//   'sec-ch-ua': '"Chromium";v="131"...',
//   ...
// }
```

---

## TLS Fingerprint Evasion

### How Cipher Shuffling Works

```typescript
import { createStealthAgent, getDefaultCiphers, getShuffledCiphers } from './http'

// Default Node.js cipher order (always same = detectable)
const defaultCiphers = getDefaultCiphers()
console.log(defaultCiphers.slice(0, 5))
// ['TLS_AES_256_GCM_SHA384', 'TLS_CHACHA20_POLY1305_SHA256', ...]

// Shuffled ciphers (different each time)
const shuffled1 = getShuffledCiphers()
const shuffled2 = getShuffledCiphers()
// shuffled1 !== shuffled2
```

### Create Stealth Agent Manually

```typescript
import axios from 'axios'
import { createStealthAgent } from './http'

// Create agent with shuffled ciphers
const agent = createStealthAgent({
  keepAlive: true,
  timeout: 30000,
})

// Use with axios directly
const response = await axios.get('https://api.example.com', {
  httpsAgent: agent,
})
```

### Check TLS Support

```typescript
import { isCipherShufflingSupported } from './http'

if (isCipherShufflingSupported()) {
  // Use cipher shuffling
} else {
  // Fallback (older Node.js)
}
```

---

## Device Database

### Android Devices (2024-2025)

#### Samsung Galaxy

| Model | Model Code | Series |
|-------|------------|--------|
| Galaxy S25 Ultra | SM-S938B | S25 (2025) |
| Galaxy S25+ | SM-S936B | S25 (2025) |
| Galaxy S25 | SM-S931B | S25 (2025) |
| Galaxy S24 Ultra | SM-S928B | S24 (2024) |
| Galaxy S24+ | SM-S926B | S24 (2024) |
| Galaxy S24 | SM-S921B | S24 (2024) |
| Galaxy Z Fold6 | SM-F956B | Foldable |
| Galaxy Z Flip6 | SM-F741B | Foldable |
| Galaxy A55 | SM-A556B | A Series |

#### Google Pixel

| Model | Model Code | Series |
|-------|------------|--------|
| Pixel 9 Pro XL | Pixel 9 Pro XL | 9 (2024) |
| Pixel 9 Pro | Pixel 9 Pro | 9 (2024) |
| Pixel 9 | Pixel 9 | 9 (2024) |
| Pixel 9 Pro Fold | Pixel 9 Pro Fold | 9 (2024) |
| Pixel 8 Pro | Pixel 8 Pro | 8 (2023) |
| Pixel 8 | Pixel 8 | 8 (2023) |
| Pixel 8a | Pixel 8a | 8 (2024) |

#### Xiaomi

| Model | Model Code | Series |
|-------|------------|--------|
| Xiaomi 15 Ultra | 2501FPN6DG | 15 (2025) |
| Xiaomi 15 Pro | 24117RK66G | 15 (2024) |
| Xiaomi 15 | 2410FPN6DG | 15 (2024) |
| Xiaomi 14 Ultra | 24030PN60G | 14 (2024) |
| Xiaomi 14 | 23127PN0CG | 14 (2024) |
| Redmi Note 13 Pro+ | 2312DRAC8G | Redmi |

#### Other Brands

| Brand | Models |
|-------|--------|
| OnePlus | OnePlus 13, 12, 12R, 11, Nord 4, Open |
| Oppo | Find X8 Ultra/Pro, Reno 12/11 |
| Huawei | Mate 70/60 Pro, P60 Pro, Nova 12 |

### iOS Devices (2024-2025)

#### iPhone

| Model | Model Code | Series |
|-------|------------|--------|
| iPhone 16 Pro Max | iPhone17,2 | 16 (2024) |
| iPhone 16 Pro | iPhone17,1 | 16 (2024) |
| iPhone 16 Plus | iPhone17,4 | 16 (2024) |
| iPhone 16 | iPhone17,3 | 16 (2024) |
| iPhone 15 Pro Max | iPhone16,2 | 15 (2023) |
| iPhone 15 Pro | iPhone16,1 | 15 (2023) |
| iPhone 15 Plus | iPhone15,5 | 15 (2023) |
| iPhone 15 | iPhone15,4 | 15 (2023) |

#### iPad

| Model | Model Code | Series |
|-------|------------|--------|
| iPad Pro 13 M4 | iPad16,3 | Pro (2024) |
| iPad Pro 11 M4 | iPad16,4 | Pro (2024) |
| iPad Air 13 M2 | iPad14,10 | Air (2024) |
| iPad Air 11 M2 | iPad14,8 | Air (2024) |
| iPad (10th) | iPad13,18 | Base |
| iPad mini (6th) | iPad14,1 | Mini |

### OS Versions

```typescript
// Android versions
const ANDROID_VERSIONS = ['13', '14', '15', '16']

// iOS versions
const IOS_VERSIONS = ['17.0', '17.4', '17.5', '18.0', '18.2', '18.3', '18.4']
```

---

## Direct API Usage

### Generate Headers Without HttpClient

```typescript
import { createHeaderGenerator, generateFromPreset, generateHeaders } from './http'

// From preset
const headers = generateFromPreset('CHROME_WINDOWS')

// From config
const headers = generateHeaders({
  enabled: true,
  browsers: ['chrome'],
  operatingSystems: ['windows'],
})
```

### Header Generator Instance

```typescript
import { createHeaderGenerator } from './http'

const generator = createHeaderGenerator({
  browsers: ['chrome', 'firefox'],
  operatingSystems: ['windows', 'macos'],
})

// Generate multiple different headers
const h1 = generator.generate() // Chrome/Windows
const h2 = generator.generate() // Firefox/macOS
const h3 = generator.generate() // Chrome/macOS

// Generate from specific preset
const h4 = generator.generateFromPreset('SAFARI_IPHONE')
```

### Query Presets

```typescript
import {
  getPresetNames,
  getPresetsByBrowser,
  getPresetsByDevice,
  getPresetsByOS
} from './http'

// All presets
const all = getPresetNames()
// ['CHROME_WINDOWS', 'CHROME_MACOS', 'SAFARI_IPHONE', ...]

// Desktop only
const desktop = getPresetsByDevice('desktop')
// ['CHROME_WINDOWS', 'CHROME_MACOS', 'FIREFOX_WINDOWS', ...]

// Mobile only
const mobile = getPresetsByDevice('mobile')
// ['CHROME_ANDROID', 'SAFARI_IOS', 'SAFARI_IPHONE', ...]

// iOS presets
const ios = getPresetsByOS('ios')
// ['SAFARI_IOS', 'SAFARI_IPHONE', 'SAFARI_IPAD', 'CHROME_IOS']

// Chrome presets
const chrome = getPresetsByBrowser('chrome')
// ['CHROME_WINDOWS', 'CHROME_MACOS', 'CHROME_ANDROID', ...]
```

### Query Devices

```typescript
import { getDeviceBrands, getDevicesByBrand, getRandomDevice } from './http'

// Android brands
const androidBrands = getDeviceBrands('android')
// ['samsung', 'pixel', 'xiaomi', 'oppo', 'oneplus', 'huawei', 'generic']

// iOS brands
const iosBrands = getDeviceBrands('ios')
// ['iphone', 'ipad']

// Samsung devices
const samsungDevices = getDevicesByBrand('samsung')
// [{ model: 'Galaxy S25 Ultra', modelCode: 'SM-S938B' }, ...]

// Random Samsung device
const device = getRandomDevice('samsung')
// { brand: 'samsung', model: 'Galaxy S24', modelCode: 'SM-S921B' }
```

---

## Generated Headers Explained

### Chrome on Windows Example

```http
user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36
accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8
accept-language: en-US,en;q=0.9
accept-encoding: gzip, deflate, br
sec-ch-ua: "Not_A Brand";v="8", "Chromium";v="131", "Google Chrome";v="131"
sec-ch-ua-mobile: ?0
sec-ch-ua-platform: "Windows"
sec-fetch-dest: document
sec-fetch-mode: navigate
sec-fetch-site: none
sec-fetch-user: ?1
upgrade-insecure-requests: 1
connection: keep-alive
```

### Header Explanation

| Header | Purpose | Example |
|--------|---------|---------|
| `user-agent` | Browser/OS identification | Chrome/131 on Windows |
| `sec-ch-ua` | Client Hints brand list | Chromium + Chrome versions |
| `sec-ch-ua-mobile` | Mobile indicator | ?0 (desktop), ?1 (mobile) |
| `sec-ch-ua-platform` | OS platform | "Windows", "Android" |
| `sec-ch-ua-model` | Device model (mobile) | "SM-S928B" |
| `sec-fetch-*` | Request context | navigate, document |
| `accept` | Content preferences | HTML, images, etc. |
| `accept-encoding` | Compression support | gzip, br |

### Browser-Specific Differences

| Browser | sec-ch-ua | DNT | Accept |
|---------|-----------|-----|--------|
| Chrome | Yes | No | Full MIME list |
| Edge | Yes | No | Full MIME list |
| Firefox | No | Yes | Shorter list |
| Safari | No | No | Minimal list |

---

## Limitations

### What We CAN Bypass

| Detection Method | Status |
|-----------------|--------|
| User-Agent checking | ✅ Bypassed |
| sec-ch-ua checking | ✅ Bypassed |
| Missing headers detection | ✅ Bypassed |
| Header order checking | ✅ Bypassed |
| Basic JA3 fingerprint | ✅ Partial (cipher shuffling) |

### What We CANNOT Bypass

| Detection Method | Reason |
|-----------------|--------|
| JA4+ fingerprint | TLS extensions not controllable |
| HTTP/2 fingerprint | Node.js limitation |
| JavaScript challenges | No JS execution |
| Canvas fingerprint | No browser rendering |
| WebGL fingerprint | No browser rendering |
| Behavioral analysis | Timing, mouse patterns |

### Recommendations

For advanced anti-bot systems (Cloudflare, PerimeterX, DataDome):
1. Use real browser automation (Puppeteer, Playwright)
2. Use residential proxies
3. Add human-like delays and patterns
4. Consider specialized services

---

## Best Practices

### 1. Match Fingerprint to Proxy Location

```typescript
// Vietnamese proxy → Vietnamese locale
const client = new HttpClient({
  baseURL: 'https://api.example.com',
  proxy: { host: 'vn-proxy.example.com', port: 8080 },
  fingerprint: {
    preset: 'CHROME_WINDOWS',
    locales: ['vi-VN', 'en-US'],
  },
})
```

### 2. Rotate Both Fingerprint and Proxy

```typescript
for (const url of urls) {
  client.rotateFingerprintHeaders()
  rotateProxy()
  await client.get(url)
  await delay(randomInt(2000, 5000))
}
```

### 3. Use Consistent Device Type

```typescript
// Don't mix desktop and mobile in same session
// BAD
fingerprint: { browsers: ['chrome'], devices: ['desktop', 'mobile'] }

// GOOD - choose one
fingerprint: { preset: 'CHROME_WINDOWS' }  // desktop session
fingerprint: { preset: 'CHROME_ANDROID' }  // mobile session
```

### 4. Add Human-like Delays

```typescript
async function humanDelay() {
  const delay = Math.floor(Math.random() * 3000) + 1000 // 1-4 seconds
  await new Promise((r) => setTimeout(r, delay))
}

for (const url of urls) {
  await client.get(url)
  await humanDelay()
}
```

### 5. Handle Blocks Gracefully

```typescript
try {
  await client.get(url)
} catch (error) {
  if (error.statusCode === 403 || error.statusCode === 429) {
    // Rotate fingerprint and retry
    client.rotateFingerprintHeaders()
    await delay(5000)
    await client.get(url)
  }
}
```
