/** Supported browser names */
export type BrowserName = 'chrome' | 'firefox' | 'safari' | 'edge'

/** Supported operating systems */
export type OperatingSystem = 'windows' | 'macos' | 'linux' | 'android' | 'ios'

/** Device type */
export type DeviceType = 'desktop' | 'mobile'

/** Mobile device brands */
export type MobileDeviceBrand =
  | 'samsung'
  | 'pixel'
  | 'xiaomi'
  | 'oppo'
  | 'huawei'
  | 'oneplus'
  | 'iphone'
  | 'ipad'
  | 'generic'

/** Browser version specification */
export interface BrowserSpec {
  name: BrowserName
  minVersion?: number
  maxVersion?: number
}

/** Desktop presets */
export type DesktopPreset =
  | 'CHROME_WINDOWS'
  | 'CHROME_MACOS'
  | 'CHROME_LINUX'
  | 'FIREFOX_WINDOWS'
  | 'FIREFOX_MACOS'
  | 'FIREFOX_LINUX'
  | 'SAFARI_MACOS'
  | 'EDGE_WINDOWS'

/** Android presets */
export type AndroidPreset =
  | 'CHROME_ANDROID'
  | 'CHROME_ANDROID_SAMSUNG'
  | 'CHROME_ANDROID_PIXEL'
  | 'CHROME_ANDROID_XIAOMI'
  | 'FIREFOX_ANDROID'

/** iOS presets */
export type IOSPreset = 'SAFARI_IOS' | 'SAFARI_IPHONE' | 'SAFARI_IPAD' | 'CHROME_IOS'

/** All available presets */
export type FingerprintPreset = DesktopPreset | AndroidPreset | IOSPreset

/** Fingerprint configuration */
export interface FingerprintConfig {
  /** Enable fingerprint generation */
  enabled?: boolean
  /** Use preset configuration */
  preset?: FingerprintPreset
  /** Browser specifications (ignored if preset is set) */
  browsers?: (BrowserSpec | BrowserName)[]
  /** Target operating systems */
  operatingSystems?: OperatingSystem[]
  /** Target device types */
  devices?: DeviceType[]
  /** Mobile device brands (for mobile devices) */
  mobileDevices?: MobileDeviceBrand[]
  /** Locale preferences (e.g., 'en-US', 'vi-VN') */
  locales?: string[]
  /** Shuffle TLS ciphers for partial fingerprint evasion */
  shuffleCiphers?: boolean
}

/** Generated browser headers */
export interface BrowserHeaders {
  'user-agent': string
  'accept': string
  'accept-language': string
  'accept-encoding': string
  'sec-ch-ua'?: string
  'sec-ch-ua-mobile'?: string
  'sec-ch-ua-platform'?: string
  'sec-ch-ua-model'?: string
  'sec-fetch-dest'?: string
  'sec-fetch-mode'?: string
  'sec-fetch-site'?: string
  'sec-fetch-user'?: string
  'upgrade-insecure-requests'?: string
  'dnt'?: string
  'connection'?: string
  [key: string]: string | undefined
}

/** Mobile device info */
export interface MobileDeviceInfo {
  brand: MobileDeviceBrand
  model: string
  /** Android: 'SM-S918B', iOS: 'iPhone15,2' */
  modelCode: string
}

/** Browser info for header generation */
export interface BrowserInfo {
  name: BrowserName
  version: number
  os: OperatingSystem
  device: DeviceType
  mobile?: MobileDeviceInfo
}

/** Preset configuration data */
export interface PresetData {
  browser: BrowserName
  minVersion: number
  maxVersion: number
  os: OperatingSystem
  device: DeviceType
  mobile?: {
    brands: MobileDeviceBrand[]
  }
}
