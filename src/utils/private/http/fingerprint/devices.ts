import { createHash } from 'node:crypto'
import type { MobileDeviceBrand, MobileDeviceInfo, ScreenSpecs } from '../types'

/** Full device specification with screen and system info */
interface DeviceSpec {
  model: string
  modelCode: string
  screen: ScreenSpecs
  androidVersions: string[]
  cpuArch: string
  releaseYear: number
}

// ==================== Samsung Galaxy Devices ====================

/** Samsung Galaxy devices (2024-2025) with full specs */
const SAMSUNG_DEVICES: DeviceSpec[] = [
  // S25 Series (2025)
  {
    model: 'Galaxy S25 Ultra',
    modelCode: 'SM-S938B',
    screen: { width: 1440, height: 3120, density: 3.0, dpi: 505 },
    androidVersions: ['15'],
    cpuArch: 'arm64-v8a',
    releaseYear: 2025,
  },
  {
    model: 'Galaxy S25+',
    modelCode: 'SM-S936B',
    screen: { width: 1440, height: 3120, density: 3.0, dpi: 500 },
    androidVersions: ['15'],
    cpuArch: 'arm64-v8a',
    releaseYear: 2025,
  },
  {
    model: 'Galaxy S25',
    modelCode: 'SM-S931B',
    screen: { width: 1080, height: 2340, density: 2.625, dpi: 416 },
    androidVersions: ['15'],
    cpuArch: 'arm64-v8a',
    releaseYear: 2025,
  },
  // S24 Series (2024)
  {
    model: 'Galaxy S24 Ultra',
    modelCode: 'SM-S928B',
    screen: { width: 1440, height: 3120, density: 3.0, dpi: 505 },
    androidVersions: ['14', '15'],
    cpuArch: 'arm64-v8a',
    releaseYear: 2024,
  },
  {
    model: 'Galaxy S24+',
    modelCode: 'SM-S926B',
    screen: { width: 1440, height: 3120, density: 3.0, dpi: 500 },
    androidVersions: ['14', '15'],
    cpuArch: 'arm64-v8a',
    releaseYear: 2024,
  },
  {
    model: 'Galaxy S24',
    modelCode: 'SM-S921B',
    screen: { width: 1080, height: 2340, density: 2.625, dpi: 416 },
    androidVersions: ['14', '15'],
    cpuArch: 'arm64-v8a',
    releaseYear: 2024,
  },
  // S23 Series (2023)
  {
    model: 'Galaxy S23 Ultra',
    modelCode: 'SM-S918B',
    screen: { width: 1440, height: 3088, density: 3.0, dpi: 500 },
    androidVersions: ['13', '14', '15'],
    cpuArch: 'arm64-v8a',
    releaseYear: 2023,
  },
  {
    model: 'Galaxy S23+',
    modelCode: 'SM-S916B',
    screen: { width: 1080, height: 2340, density: 2.625, dpi: 393 },
    androidVersions: ['13', '14', '15'],
    cpuArch: 'arm64-v8a',
    releaseYear: 2023,
  },
  {
    model: 'Galaxy S23',
    modelCode: 'SM-S911B',
    screen: { width: 1080, height: 2340, density: 2.625, dpi: 425 },
    androidVersions: ['13', '14', '15'],
    cpuArch: 'arm64-v8a',
    releaseYear: 2023,
  },
  // A Series
  {
    model: 'Galaxy A55',
    modelCode: 'SM-A556B',
    screen: { width: 1080, height: 2340, density: 2.625, dpi: 390 },
    androidVersions: ['14', '15'],
    cpuArch: 'arm64-v8a',
    releaseYear: 2024,
  },
  {
    model: 'Galaxy A54',
    modelCode: 'SM-A546B',
    screen: { width: 1080, height: 2340, density: 2.625, dpi: 393 },
    androidVersions: ['13', '14', '15'],
    cpuArch: 'arm64-v8a',
    releaseYear: 2023,
  },
  {
    model: 'Galaxy A35',
    modelCode: 'SM-A356B',
    screen: { width: 1080, height: 2340, density: 2.625, dpi: 390 },
    androidVersions: ['14', '15'],
    cpuArch: 'arm64-v8a',
    releaseYear: 2024,
  },
  // Fold/Flip
  {
    model: 'Galaxy Z Fold6',
    modelCode: 'SM-F956B',
    screen: { width: 1856, height: 2160, density: 2.625, dpi: 374 },
    androidVersions: ['14', '15'],
    cpuArch: 'arm64-v8a',
    releaseYear: 2024,
  },
  {
    model: 'Galaxy Z Fold5',
    modelCode: 'SM-F946B',
    screen: { width: 1812, height: 2176, density: 2.625, dpi: 374 },
    androidVersions: ['13', '14', '15'],
    cpuArch: 'arm64-v8a',
    releaseYear: 2023,
  },
  {
    model: 'Galaxy Z Flip6',
    modelCode: 'SM-F741B',
    screen: { width: 1080, height: 2640, density: 3.0, dpi: 426 },
    androidVersions: ['14', '15'],
    cpuArch: 'arm64-v8a',
    releaseYear: 2024,
  },
  {
    model: 'Galaxy Z Flip5',
    modelCode: 'SM-F731B',
    screen: { width: 1080, height: 2640, density: 3.0, dpi: 426 },
    androidVersions: ['13', '14', '15'],
    cpuArch: 'arm64-v8a',
    releaseYear: 2023,
  },
]

// ==================== Google Pixel Devices ====================

/** Google Pixel devices (2024-2025) with full specs */
const PIXEL_DEVICES: DeviceSpec[] = [
  // Pixel 9 Series (2024)
  {
    model: 'Pixel 9 Pro XL',
    modelCode: 'Pixel 9 Pro XL',
    screen: { width: 1344, height: 2992, density: 2.625, dpi: 486 },
    androidVersions: ['14', '15'],
    cpuArch: 'arm64-v8a',
    releaseYear: 2024,
  },
  {
    model: 'Pixel 9 Pro',
    modelCode: 'Pixel 9 Pro',
    screen: { width: 1280, height: 2856, density: 2.625, dpi: 495 },
    androidVersions: ['14', '15'],
    cpuArch: 'arm64-v8a',
    releaseYear: 2024,
  },
  {
    model: 'Pixel 9',
    modelCode: 'Pixel 9',
    screen: { width: 1080, height: 2424, density: 2.625, dpi: 422 },
    androidVersions: ['14', '15'],
    cpuArch: 'arm64-v8a',
    releaseYear: 2024,
  },
  {
    model: 'Pixel 9 Pro Fold',
    modelCode: 'Pixel 9 Pro Fold',
    screen: { width: 2076, height: 2152, density: 2.625, dpi: 373 },
    androidVersions: ['14', '15'],
    cpuArch: 'arm64-v8a',
    releaseYear: 2024,
  },
  // Pixel 8 Series (2023)
  {
    model: 'Pixel 8 Pro',
    modelCode: 'Pixel 8 Pro',
    screen: { width: 1344, height: 2992, density: 2.625, dpi: 489 },
    androidVersions: ['14', '15'],
    cpuArch: 'arm64-v8a',
    releaseYear: 2023,
  },
  {
    model: 'Pixel 8',
    modelCode: 'Pixel 8',
    screen: { width: 1080, height: 2400, density: 2.625, dpi: 428 },
    androidVersions: ['14', '15'],
    cpuArch: 'arm64-v8a',
    releaseYear: 2023,
  },
  {
    model: 'Pixel 8a',
    modelCode: 'Pixel 8a',
    screen: { width: 1080, height: 2400, density: 2.625, dpi: 431 },
    androidVersions: ['14', '15'],
    cpuArch: 'arm64-v8a',
    releaseYear: 2024,
  },
  // Pixel 7 Series
  {
    model: 'Pixel 7 Pro',
    modelCode: 'Pixel 7 Pro',
    screen: { width: 1440, height: 3120, density: 3.5, dpi: 512 },
    androidVersions: ['13', '14', '15'],
    cpuArch: 'arm64-v8a',
    releaseYear: 2022,
  },
  {
    model: 'Pixel 7',
    modelCode: 'Pixel 7',
    screen: { width: 1080, height: 2400, density: 2.625, dpi: 416 },
    androidVersions: ['13', '14', '15'],
    cpuArch: 'arm64-v8a',
    releaseYear: 2022,
  },
  {
    model: 'Pixel 7a',
    modelCode: 'Pixel 7a',
    screen: { width: 1080, height: 2400, density: 2.625, dpi: 429 },
    androidVersions: ['13', '14', '15'],
    cpuArch: 'arm64-v8a',
    releaseYear: 2023,
  },
]

// ==================== Xiaomi Devices ====================

/** Xiaomi devices (2024-2025) with full specs */
const XIAOMI_DEVICES: DeviceSpec[] = [
  // Xiaomi 15 Series (2024-2025)
  {
    model: 'Xiaomi 15 Ultra',
    modelCode: '2501FPN6DG',
    screen: { width: 1440, height: 3200, density: 3.5, dpi: 522 },
    androidVersions: ['15'],
    cpuArch: 'arm64-v8a',
    releaseYear: 2025,
  },
  {
    model: 'Xiaomi 15 Pro',
    modelCode: '24117RK66G',
    screen: { width: 1440, height: 3200, density: 3.5, dpi: 521 },
    androidVersions: ['15'],
    cpuArch: 'arm64-v8a',
    releaseYear: 2024,
  },
  {
    model: 'Xiaomi 15',
    modelCode: '2410FPN6DG',
    screen: { width: 1200, height: 2670, density: 2.75, dpi: 460 },
    androidVersions: ['15'],
    cpuArch: 'arm64-v8a',
    releaseYear: 2024,
  },
  // Xiaomi 14 Series (2024)
  {
    model: 'Xiaomi 14 Ultra',
    modelCode: '24030PN60G',
    screen: { width: 1440, height: 3200, density: 3.5, dpi: 522 },
    androidVersions: ['14', '15'],
    cpuArch: 'arm64-v8a',
    releaseYear: 2024,
  },
  {
    model: 'Xiaomi 14 Pro',
    modelCode: '23116PN5BG',
    screen: { width: 1440, height: 3200, density: 3.5, dpi: 521 },
    androidVersions: ['14', '15'],
    cpuArch: 'arm64-v8a',
    releaseYear: 2023,
  },
  {
    model: 'Xiaomi 14',
    modelCode: '23127PN0CG',
    screen: { width: 1200, height: 2670, density: 2.75, dpi: 460 },
    androidVersions: ['14', '15'],
    cpuArch: 'arm64-v8a',
    releaseYear: 2023,
  },
  // Xiaomi 13 Series
  {
    model: 'Xiaomi 13T Pro',
    modelCode: '23078PND5G',
    screen: { width: 1220, height: 2712, density: 2.75, dpi: 446 },
    androidVersions: ['13', '14', '15'],
    cpuArch: 'arm64-v8a',
    releaseYear: 2023,
  },
  {
    model: 'Xiaomi 13T',
    modelCode: '23049PCD8G',
    screen: { width: 1220, height: 2712, density: 2.75, dpi: 446 },
    androidVersions: ['13', '14'],
    cpuArch: 'arm64-v8a',
    releaseYear: 2023,
  },
  // Redmi Series
  {
    model: 'Redmi Note 13 Pro+',
    modelCode: '2312DRAC8G',
    screen: { width: 1220, height: 2712, density: 2.75, dpi: 440 },
    androidVersions: ['13', '14'],
    cpuArch: 'arm64-v8a',
    releaseYear: 2024,
  },
  {
    model: 'Redmi Note 13 Pro',
    modelCode: '2312DRA50G',
    screen: { width: 1080, height: 2400, density: 2.625, dpi: 395 },
    androidVersions: ['13', '14'],
    cpuArch: 'arm64-v8a',
    releaseYear: 2024,
  },
]

// ==================== Oppo Devices ====================

/** Oppo devices (2024-2025) with full specs */
const OPPO_DEVICES: DeviceSpec[] = [
  {
    model: 'Find X8 Ultra',
    modelCode: 'PHB110',
    screen: { width: 1440, height: 3168, density: 3.5, dpi: 510 },
    androidVersions: ['15'],
    cpuArch: 'arm64-v8a',
    releaseYear: 2025,
  },
  {
    model: 'Find X8 Pro',
    modelCode: 'PHC110',
    screen: { width: 1264, height: 2780, density: 2.75, dpi: 450 },
    androidVersions: ['14', '15'],
    cpuArch: 'arm64-v8a',
    releaseYear: 2024,
  },
  {
    model: 'Find X8',
    modelCode: 'PHD110',
    screen: { width: 1080, height: 2412, density: 2.625, dpi: 394 },
    androidVersions: ['14', '15'],
    cpuArch: 'arm64-v8a',
    releaseYear: 2024,
  },
  {
    model: 'Find X7 Ultra',
    modelCode: 'PHZ110',
    screen: { width: 1440, height: 3168, density: 3.5, dpi: 510 },
    androidVersions: ['14'],
    cpuArch: 'arm64-v8a',
    releaseYear: 2024,
  },
  {
    model: 'Reno 12 Pro',
    modelCode: 'CPH2645',
    screen: { width: 1080, height: 2412, density: 2.625, dpi: 394 },
    androidVersions: ['14'],
    cpuArch: 'arm64-v8a',
    releaseYear: 2024,
  },
  {
    model: 'Reno 12',
    modelCode: 'CPH2643',
    screen: { width: 1080, height: 2412, density: 2.625, dpi: 394 },
    androidVersions: ['14'],
    cpuArch: 'arm64-v8a',
    releaseYear: 2024,
  },
  {
    model: 'Reno 11 Pro',
    modelCode: 'CPH2487',
    screen: { width: 1080, height: 2412, density: 2.625, dpi: 394 },
    androidVersions: ['13', '14'],
    cpuArch: 'arm64-v8a',
    releaseYear: 2023,
  },
]

// ==================== OnePlus Devices ====================

/** OnePlus devices (2024-2025) with full specs */
const ONEPLUS_DEVICES: DeviceSpec[] = [
  {
    model: 'OnePlus 13',
    modelCode: 'CPH2653',
    screen: { width: 1440, height: 3168, density: 3.5, dpi: 510 },
    androidVersions: ['15'],
    cpuArch: 'arm64-v8a',
    releaseYear: 2024,
  },
  {
    model: 'OnePlus 12',
    modelCode: 'CPH2573',
    screen: { width: 1440, height: 3168, density: 3.5, dpi: 510 },
    androidVersions: ['14', '15'],
    cpuArch: 'arm64-v8a',
    releaseYear: 2024,
  },
  {
    model: 'OnePlus 12R',
    modelCode: 'CPH2587',
    screen: { width: 1080, height: 2780, density: 2.75, dpi: 450 },
    androidVersions: ['14'],
    cpuArch: 'arm64-v8a',
    releaseYear: 2024,
  },
  {
    model: 'OnePlus 11',
    modelCode: 'CPH2449',
    screen: { width: 1440, height: 3216, density: 3.5, dpi: 525 },
    androidVersions: ['13', '14', '15'],
    cpuArch: 'arm64-v8a',
    releaseYear: 2023,
  },
  {
    model: 'OnePlus Nord 4',
    modelCode: 'CPH2631',
    screen: { width: 1080, height: 2412, density: 2.625, dpi: 394 },
    androidVersions: ['14'],
    cpuArch: 'arm64-v8a',
    releaseYear: 2024,
  },
  {
    model: 'OnePlus Nord 3',
    modelCode: 'CPH2491',
    screen: { width: 1080, height: 2412, density: 2.625, dpi: 394 },
    androidVersions: ['13', '14'],
    cpuArch: 'arm64-v8a',
    releaseYear: 2023,
  },
  {
    model: 'OnePlus Open',
    modelCode: 'CPH2551',
    screen: { width: 1840, height: 2120, density: 2.75, dpi: 426 },
    androidVersions: ['13', '14', '15'],
    cpuArch: 'arm64-v8a',
    releaseYear: 2023,
  },
]

// ==================== Huawei Devices ====================

/** Huawei devices (2024-2025) with full specs */
const HUAWEI_DEVICES: DeviceSpec[] = [
  {
    model: 'Mate 70 Pro+',
    modelCode: 'BRA-AL00',
    screen: { width: 1260, height: 2844, density: 2.75, dpi: 460 },
    androidVersions: ['14'],
    cpuArch: 'arm64-v8a',
    releaseYear: 2024,
  },
  {
    model: 'Mate 70 Pro',
    modelCode: 'CET-AL00',
    screen: { width: 1260, height: 2844, density: 2.75, dpi: 460 },
    androidVersions: ['14'],
    cpuArch: 'arm64-v8a',
    releaseYear: 2024,
  },
  {
    model: 'Mate 70',
    modelCode: 'CFR-AL00',
    screen: { width: 1216, height: 2688, density: 2.625, dpi: 423 },
    androidVersions: ['14'],
    cpuArch: 'arm64-v8a',
    releaseYear: 2024,
  },
  {
    model: 'Mate 60 Pro+',
    modelCode: 'BRA-AL10',
    screen: { width: 1260, height: 2720, density: 2.75, dpi: 453 },
    androidVersions: ['13', '14'],
    cpuArch: 'arm64-v8a',
    releaseYear: 2023,
  },
  {
    model: 'Mate 60 Pro',
    modelCode: 'ALN-AL00',
    screen: { width: 1260, height: 2720, density: 2.75, dpi: 453 },
    androidVersions: ['13', '14'],
    cpuArch: 'arm64-v8a',
    releaseYear: 2023,
  },
  {
    model: 'P60 Pro',
    modelCode: 'MNA-AL00',
    screen: { width: 1220, height: 2700, density: 2.75, dpi: 443 },
    androidVersions: ['13', '14'],
    cpuArch: 'arm64-v8a',
    releaseYear: 2023,
  },
  {
    model: 'Nova 12 Pro',
    modelCode: 'FOA-AL00',
    screen: { width: 1200, height: 2670, density: 2.75, dpi: 437 },
    androidVersions: ['14'],
    cpuArch: 'arm64-v8a',
    releaseYear: 2024,
  },
]

// ==================== iPhone Devices ====================

/** iPhone devices (2024-2025) with full specs - iOS uses different structure */
interface IOSDeviceSpec {
  model: string
  modelCode: string
  screen: ScreenSpecs
  iosVersions: string[]
  releaseYear: number
}

const IPHONE_DEVICES: IOSDeviceSpec[] = [
  // iPhone 16 Series (2024)
  {
    model: 'iPhone 16 Pro Max',
    modelCode: 'iPhone17,2',
    screen: { width: 1320, height: 2868, density: 3.0, dpi: 460 },
    iosVersions: ['18.0', '18.2', '18.3', '18.4'],
    releaseYear: 2024,
  },
  {
    model: 'iPhone 16 Pro',
    modelCode: 'iPhone17,1',
    screen: { width: 1206, height: 2622, density: 3.0, dpi: 460 },
    iosVersions: ['18.0', '18.2', '18.3', '18.4'],
    releaseYear: 2024,
  },
  {
    model: 'iPhone 16 Plus',
    modelCode: 'iPhone17,4',
    screen: { width: 1290, height: 2796, density: 3.0, dpi: 460 },
    iosVersions: ['18.0', '18.2', '18.3', '18.4'],
    releaseYear: 2024,
  },
  {
    model: 'iPhone 16',
    modelCode: 'iPhone17,3',
    screen: { width: 1179, height: 2556, density: 3.0, dpi: 460 },
    iosVersions: ['18.0', '18.2', '18.3', '18.4'],
    releaseYear: 2024,
  },
  // iPhone 15 Series (2023)
  {
    model: 'iPhone 15 Pro Max',
    modelCode: 'iPhone16,2',
    screen: { width: 1290, height: 2796, density: 3.0, dpi: 460 },
    iosVersions: ['17.0', '17.4', '17.5', '18.0', '18.2', '18.3'],
    releaseYear: 2023,
  },
  {
    model: 'iPhone 15 Pro',
    modelCode: 'iPhone16,1',
    screen: { width: 1179, height: 2556, density: 3.0, dpi: 460 },
    iosVersions: ['17.0', '17.4', '17.5', '18.0', '18.2', '18.3'],
    releaseYear: 2023,
  },
  {
    model: 'iPhone 15 Plus',
    modelCode: 'iPhone15,5',
    screen: { width: 1290, height: 2796, density: 3.0, dpi: 460 },
    iosVersions: ['17.0', '17.4', '17.5', '18.0', '18.2', '18.3'],
    releaseYear: 2023,
  },
  {
    model: 'iPhone 15',
    modelCode: 'iPhone15,4',
    screen: { width: 1179, height: 2556, density: 3.0, dpi: 460 },
    iosVersions: ['17.0', '17.4', '17.5', '18.0', '18.2', '18.3'],
    releaseYear: 2023,
  },
  // iPhone 14 Series (2022)
  {
    model: 'iPhone 14 Pro Max',
    modelCode: 'iPhone15,3',
    screen: { width: 1290, height: 2796, density: 3.0, dpi: 460 },
    iosVersions: ['17.0', '17.4', '17.5', '18.0', '18.2'],
    releaseYear: 2022,
  },
  {
    model: 'iPhone 14 Pro',
    modelCode: 'iPhone15,2',
    screen: { width: 1179, height: 2556, density: 3.0, dpi: 460 },
    iosVersions: ['17.0', '17.4', '17.5', '18.0', '18.2'],
    releaseYear: 2022,
  },
  {
    model: 'iPhone 14 Plus',
    modelCode: 'iPhone14,8',
    screen: { width: 1284, height: 2778, density: 3.0, dpi: 458 },
    iosVersions: ['17.0', '17.4', '17.5', '18.0', '18.2'],
    releaseYear: 2022,
  },
  {
    model: 'iPhone 14',
    modelCode: 'iPhone14,7',
    screen: { width: 1170, height: 2532, density: 3.0, dpi: 460 },
    iosVersions: ['17.0', '17.4', '17.5', '18.0', '18.2'],
    releaseYear: 2022,
  },
]

// ==================== iPad Devices ====================

/** iPad devices (2024-2025) with full specs */
const IPAD_DEVICES: IOSDeviceSpec[] = [
  // iPad Pro M4 (2024)
  {
    model: 'iPad Pro 13 M4',
    modelCode: 'iPad16,3',
    screen: { width: 2752, height: 2064, density: 2.0, dpi: 264 },
    iosVersions: ['17.4', '17.5', '18.0', '18.2', '18.3'],
    releaseYear: 2024,
  },
  {
    model: 'iPad Pro 11 M4',
    modelCode: 'iPad16,4',
    screen: { width: 2420, height: 1668, density: 2.0, dpi: 264 },
    iosVersions: ['17.4', '17.5', '18.0', '18.2', '18.3'],
    releaseYear: 2024,
  },
  // iPad Pro M2 (2022)
  {
    model: 'iPad Pro 12.9 (6th)',
    modelCode: 'iPad14,5',
    screen: { width: 2732, height: 2048, density: 2.0, dpi: 264 },
    iosVersions: ['17.0', '17.4', '17.5', '18.0', '18.2'],
    releaseYear: 2022,
  },
  {
    model: 'iPad Pro 11 (4th)',
    modelCode: 'iPad14,3',
    screen: { width: 2388, height: 1668, density: 2.0, dpi: 264 },
    iosVersions: ['17.0', '17.4', '17.5', '18.0', '18.2'],
    releaseYear: 2022,
  },
  // iPad Air M2 (2024)
  {
    model: 'iPad Air 13 M2',
    modelCode: 'iPad14,10',
    screen: { width: 2732, height: 2048, density: 2.0, dpi: 264 },
    iosVersions: ['17.4', '17.5', '18.0', '18.2', '18.3'],
    releaseYear: 2024,
  },
  {
    model: 'iPad Air 11 M2',
    modelCode: 'iPad14,8',
    screen: { width: 2360, height: 1640, density: 2.0, dpi: 264 },
    iosVersions: ['17.4', '17.5', '18.0', '18.2', '18.3'],
    releaseYear: 2024,
  },
  // Other iPads
  {
    model: 'iPad (10th)',
    modelCode: 'iPad13,18',
    screen: { width: 2360, height: 1640, density: 2.0, dpi: 264 },
    iosVersions: ['17.0', '17.4', '17.5', '18.0', '18.2'],
    releaseYear: 2022,
  },
  {
    model: 'iPad mini (6th)',
    modelCode: 'iPad14,1',
    screen: { width: 2266, height: 1488, density: 2.0, dpi: 326 },
    iosVersions: ['17.0', '17.4', '17.5', '18.0', '18.2'],
    releaseYear: 2021,
  },
]

// ==================== Generic Devices ====================

/** Generic Android devices */
const GENERIC_ANDROID_DEVICES: DeviceSpec[] = [
  {
    model: 'Android Phone',
    modelCode: 'generic',
    screen: { width: 1080, height: 2400, density: 2.625, dpi: 420 },
    androidVersions: ['13', '14', '15'],
    cpuArch: 'arm64-v8a',
    releaseYear: 2023,
  },
]

// ==================== Device Database ====================

/** Android device database by brand */
const ANDROID_DEVICE_DATABASE: Record<
  Exclude<MobileDeviceBrand, 'iphone' | 'ipad'>,
  DeviceSpec[]
> = {
  samsung: SAMSUNG_DEVICES,
  pixel: PIXEL_DEVICES,
  xiaomi: XIAOMI_DEVICES,
  oppo: OPPO_DEVICES,
  oneplus: ONEPLUS_DEVICES,
  huawei: HUAWEI_DEVICES,
  generic: GENERIC_ANDROID_DEVICES,
}

/** iOS device database by brand */
const IOS_DEVICE_DATABASE: Record<'iphone' | 'ipad', IOSDeviceSpec[]> = {
  iphone: IPHONE_DEVICES,
  ipad: IPAD_DEVICES,
}

// ==================== OS Versions ====================

/** Android versions (2024-2025) */
export const ANDROID_VERSIONS = ['13', '14', '15'] as const

/** iOS versions (2024-2025) */
export const IOS_VERSIONS = ['17.0', '17.4', '17.5', '18.0', '18.2', '18.3', '18.4'] as const

// ==================== Utility Functions ====================

/** Get random item from array */
function randomItem<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/** Check if brand is iOS */
function isIOSBrand(brand: MobileDeviceBrand): brand is 'iphone' | 'ipad' {
  return brand === 'iphone' || brand === 'ipad'
}

/**
 * Get random device by brand with full specs
 * @param brand - Device brand
 * @param seed - Optional seed for consistent selection
 */
export function getRandomDevice(brand: MobileDeviceBrand, seed?: string): MobileDeviceInfo {
  // Use seeded random if provided
  const random = seed
    ? (() => {
        const hash = createHash('sha256')
          .update(seed + brand)
          .digest('hex')
        return (arr: readonly unknown[]) => arr[Number.parseInt(hash.slice(0, 8), 16) % arr.length]
      })()
    : randomItem

  if (isIOSBrand(brand)) {
    const devices = IOS_DEVICE_DATABASE[brand]
    const device = random(devices) as IOSDeviceSpec
    const iosVersion = random(device.iosVersions) as string

    return {
      brand,
      model: device.model,
      modelCode: device.modelCode,
      screen: device.screen,
      osVersions: [iosVersion],
      releaseYear: device.releaseYear,
    }
  }

  const devices = ANDROID_DEVICE_DATABASE[brand]
  const device = random(devices) as DeviceSpec
  const androidVersion = random(device.androidVersions) as string

  return {
    brand,
    model: device.model,
    modelCode: device.modelCode,
    screen: device.screen,
    osVersions: [androidVersion],
    cpuArch: device.cpuArch,
    releaseYear: device.releaseYear,
  }
}

/**
 * Get random Android version compatible with device
 * @param device - Optional device to get compatible version
 */
export function getRandomAndroidVersion(device?: MobileDeviceInfo): string {
  if (device?.osVersions?.length) {
    return randomItem(device.osVersions)
  }
  return randomItem(ANDROID_VERSIONS)
}

/**
 * Get random iOS version compatible with device
 * @param device - Optional device to get compatible version
 */
export function getRandomIOSVersion(device?: MobileDeviceInfo): string {
  if (device?.osVersions?.length) {
    return randomItem(device.osVersions)
  }
  return randomItem(IOS_VERSIONS)
}

/** Get all device brands for a platform */
export function getDeviceBrands(platform: 'android' | 'ios'): MobileDeviceBrand[] {
  if (platform === 'ios') {
    return ['iphone', 'ipad']
  }
  return ['samsung', 'pixel', 'xiaomi', 'oppo', 'oneplus', 'huawei', 'generic']
}

/** Get devices by brand with full specs */
export function getDevicesByBrand(
  brand: MobileDeviceBrand,
): readonly DeviceSpec[] | readonly IOSDeviceSpec[] {
  if (isIOSBrand(brand)) {
    return IOS_DEVICE_DATABASE[brand]
  }
  return ANDROID_DEVICE_DATABASE[brand]
}
