import type { MobileDeviceBrand, MobileDeviceInfo } from '../types'

// ==================== Samsung Galaxy Devices ====================

/** Samsung Galaxy devices (2024-2025) */
const SAMSUNG_DEVICES = [
  // S25 Series (2025)
  { model: 'Galaxy S25 Ultra', modelCode: 'SM-S938B' },
  { model: 'Galaxy S25+', modelCode: 'SM-S936B' },
  { model: 'Galaxy S25', modelCode: 'SM-S931B' },
  // S24 Series (2024)
  { model: 'Galaxy S24 Ultra', modelCode: 'SM-S928B' },
  { model: 'Galaxy S24+', modelCode: 'SM-S926B' },
  { model: 'Galaxy S24', modelCode: 'SM-S921B' },
  // S23 Series (2023)
  { model: 'Galaxy S23 Ultra', modelCode: 'SM-S918B' },
  { model: 'Galaxy S23+', modelCode: 'SM-S916B' },
  { model: 'Galaxy S23', modelCode: 'SM-S911B' },
  // A Series
  { model: 'Galaxy A55', modelCode: 'SM-A556B' },
  { model: 'Galaxy A54', modelCode: 'SM-A546B' },
  { model: 'Galaxy A35', modelCode: 'SM-A356B' },
  // Fold/Flip
  { model: 'Galaxy Z Fold6', modelCode: 'SM-F956B' },
  { model: 'Galaxy Z Fold5', modelCode: 'SM-F946B' },
  { model: 'Galaxy Z Flip6', modelCode: 'SM-F741B' },
  { model: 'Galaxy Z Flip5', modelCode: 'SM-F731B' },
] as const

// ==================== Google Pixel Devices ====================

/** Google Pixel devices (2024-2025) */
const PIXEL_DEVICES = [
  // Pixel 9 Series (2024)
  { model: 'Pixel 9 Pro XL', modelCode: 'Pixel 9 Pro XL' },
  { model: 'Pixel 9 Pro', modelCode: 'Pixel 9 Pro' },
  { model: 'Pixel 9', modelCode: 'Pixel 9' },
  { model: 'Pixel 9 Pro Fold', modelCode: 'Pixel 9 Pro Fold' },
  // Pixel 8 Series (2023)
  { model: 'Pixel 8 Pro', modelCode: 'Pixel 8 Pro' },
  { model: 'Pixel 8', modelCode: 'Pixel 8' },
  { model: 'Pixel 8a', modelCode: 'Pixel 8a' },
  // Pixel 7 Series
  { model: 'Pixel 7 Pro', modelCode: 'Pixel 7 Pro' },
  { model: 'Pixel 7', modelCode: 'Pixel 7' },
  { model: 'Pixel 7a', modelCode: 'Pixel 7a' },
] as const

// ==================== Xiaomi Devices ====================

/** Xiaomi devices (2024-2025) */
const XIAOMI_DEVICES = [
  // Xiaomi 15 Series (2024-2025)
  { model: 'Xiaomi 15 Ultra', modelCode: '2501FPN6DG' },
  { model: 'Xiaomi 15 Pro', modelCode: '24117RK66G' },
  { model: 'Xiaomi 15', modelCode: '2410FPN6DG' },
  // Xiaomi 14 Series (2024)
  { model: 'Xiaomi 14 Ultra', modelCode: '24030PN60G' },
  { model: 'Xiaomi 14 Pro', modelCode: '23116PN5BG' },
  { model: 'Xiaomi 14', modelCode: '23127PN0CG' },
  // Xiaomi 13 Series
  { model: 'Xiaomi 13T Pro', modelCode: '23078PND5G' },
  { model: 'Xiaomi 13T', modelCode: '23049PCD8G' },
  // Redmi Series
  { model: 'Redmi Note 13 Pro+', modelCode: '2312DRAC8G' },
  { model: 'Redmi Note 13 Pro', modelCode: '2312DRA50G' },
] as const

// ==================== Oppo Devices ====================

/** Oppo devices (2024-2025) */
const OPPO_DEVICES = [
  { model: 'Find X8 Ultra', modelCode: 'PHB110' },
  { model: 'Find X8 Pro', modelCode: 'PHC110' },
  { model: 'Find X8', modelCode: 'PHD110' },
  { model: 'Find X7 Ultra', modelCode: 'PHZ110' },
  { model: 'Reno 12 Pro', modelCode: 'CPH2645' },
  { model: 'Reno 12', modelCode: 'CPH2643' },
  { model: 'Reno 11 Pro', modelCode: 'CPH2487' },
] as const

// ==================== OnePlus Devices ====================

/** OnePlus devices (2024-2025) */
const ONEPLUS_DEVICES = [
  { model: 'OnePlus 13', modelCode: 'CPH2653' },
  { model: 'OnePlus 12', modelCode: 'CPH2573' },
  { model: 'OnePlus 12R', modelCode: 'CPH2587' },
  { model: 'OnePlus 11', modelCode: 'CPH2449' },
  { model: 'OnePlus Nord 4', modelCode: 'CPH2631' },
  { model: 'OnePlus Nord 3', modelCode: 'CPH2491' },
  { model: 'OnePlus Open', modelCode: 'CPH2551' },
] as const

// ==================== Huawei Devices ====================

/** Huawei devices (2024-2025) */
const HUAWEI_DEVICES = [
  { model: 'Mate 70 Pro+', modelCode: 'BRA-AL00' },
  { model: 'Mate 70 Pro', modelCode: 'CET-AL00' },
  { model: 'Mate 70', modelCode: 'CFR-AL00' },
  { model: 'Mate 60 Pro+', modelCode: 'BRA-AL00' },
  { model: 'Mate 60 Pro', modelCode: 'ALN-AL00' },
  { model: 'P60 Pro', modelCode: 'MNA-AL00' },
  { model: 'Nova 12 Pro', modelCode: 'FOA-AL00' },
] as const

// ==================== iPhone Devices ====================

/** iPhone devices (2024-2025) - Internal identifiers */
const IPHONE_DEVICES = [
  // iPhone 16 Series (2024) - iPhone17,x
  { model: 'iPhone 16 Pro Max', modelCode: 'iPhone17,2' },
  { model: 'iPhone 16 Pro', modelCode: 'iPhone17,1' },
  { model: 'iPhone 16 Plus', modelCode: 'iPhone17,4' },
  { model: 'iPhone 16', modelCode: 'iPhone17,3' },
  // iPhone 15 Series (2023) - iPhone16,x / iPhone15,x
  { model: 'iPhone 15 Pro Max', modelCode: 'iPhone16,2' },
  { model: 'iPhone 15 Pro', modelCode: 'iPhone16,1' },
  { model: 'iPhone 15 Plus', modelCode: 'iPhone15,5' },
  { model: 'iPhone 15', modelCode: 'iPhone15,4' },
  // iPhone 14 Series (2022)
  { model: 'iPhone 14 Pro Max', modelCode: 'iPhone15,3' },
  { model: 'iPhone 14 Pro', modelCode: 'iPhone15,2' },
  { model: 'iPhone 14 Plus', modelCode: 'iPhone14,8' },
  { model: 'iPhone 14', modelCode: 'iPhone14,7' },
] as const

// ==================== iPad Devices ====================

/** iPad devices (2024-2025) */
const IPAD_DEVICES = [
  // iPad Pro M4 (2024)
  { model: 'iPad Pro 13 M4', modelCode: 'iPad16,3' },
  { model: 'iPad Pro 11 M4', modelCode: 'iPad16,4' },
  // iPad Pro M2 (2022)
  { model: 'iPad Pro 12.9 (6th)', modelCode: 'iPad14,5' },
  { model: 'iPad Pro 11 (4th)', modelCode: 'iPad14,3' },
  // iPad Air M2 (2024)
  { model: 'iPad Air 13 M2', modelCode: 'iPad14,10' },
  { model: 'iPad Air 11 M2', modelCode: 'iPad14,8' },
  // Other iPads
  { model: 'iPad (10th)', modelCode: 'iPad13,18' },
  { model: 'iPad mini (6th)', modelCode: 'iPad14,1' },
] as const

// ==================== Generic Devices ====================

/** Generic Android devices */
const GENERIC_ANDROID_DEVICES = [{ model: 'Android Phone', modelCode: 'generic' }] as const

// ==================== Device Database ====================

/** Device database by brand */
const DEVICE_DATABASE: Record<MobileDeviceBrand, readonly { model: string, modelCode: string }[]>
  = {
    samsung: SAMSUNG_DEVICES,
    pixel: PIXEL_DEVICES,
    xiaomi: XIAOMI_DEVICES,
    oppo: OPPO_DEVICES,
    oneplus: ONEPLUS_DEVICES,
    huawei: HUAWEI_DEVICES,
    iphone: IPHONE_DEVICES,
    ipad: IPAD_DEVICES,
    generic: GENERIC_ANDROID_DEVICES,
  }

// ==================== OS Versions ====================

/** Android versions (2024-2025) */
export const ANDROID_VERSIONS = ['13', '14', '15', '16'] as const

/** iOS versions (2024-2025) */
export const IOS_VERSIONS = ['17.0', '17.4', '17.5', '18.0', '18.2', '18.3', '18.4'] as const

// ==================== Utility Functions ====================

/** Get random item from array */
function randomItem<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/** Get random device by brand */
export function getRandomDevice(brand: MobileDeviceBrand): MobileDeviceInfo {
  const devices = DEVICE_DATABASE[brand]
  const device = randomItem(devices)
  return {
    brand,
    model: device.model,
    modelCode: device.modelCode,
  }
}

/** Get random Android version */
export function getRandomAndroidVersion(): string {
  return randomItem(ANDROID_VERSIONS)
}

/** Get random iOS version */
export function getRandomIOSVersion(): string {
  return randomItem(IOS_VERSIONS)
}

/** Get all device brands for a platform */
export function getDeviceBrands(platform: 'android' | 'ios'): MobileDeviceBrand[] {
  if (platform === 'ios') {
    return ['iphone', 'ipad']
  }
  return ['samsung', 'pixel', 'xiaomi', 'oppo', 'oneplus', 'huawei', 'generic']
}

/** Get devices by brand */
export function getDevicesByBrand(
  brand: MobileDeviceBrand,
): readonly { model: string, modelCode: string }[] {
  return DEVICE_DATABASE[brand]
}
