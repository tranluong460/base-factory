import type { Buffer } from 'node:buffer'

export function truncateUrl(url: string, maxLength: number = 80): string {
  if (url.length <= maxLength) {
    return url
  }
  return `${url.substring(0, maxLength)}...`
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) {
    return '0 B'
  }
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / k ** i).toFixed(2)} ${sizes[i]}`
}

export function getExpiryDate(url: string): Date | null {
  const match = url.match(/Expires=(\d+)/)
  if (!match) {
    return null
  }

  const timestamp = Number.parseInt(match[1], 10)
  return new Date(timestamp * 1000)
}

export function generateFilename(url: string): string {
  // Extract UUID from URL
  const match = url.match(/\/([a-f0-9-]{36})\?/)
  if (match) {
    return `video_${match[1]}`
  }

  // Fallback to timestamp
  return `video_${Date.now()}`
}

export function isUrlExpired(url: string): boolean {
  const match = url.match(/Expires=(\d+)/)
  if (!match) {
    return false
  }

  const expiresTimestamp = Number.parseInt(match[1], 10)
  const now = Math.floor(Date.now() / 1000)

  return now > expiresTimestamp
}

export function isValidGCSUrl(url: string): boolean {
  return (
    url.includes('storage.googleapis.com')
    && url.includes('GoogleAccessId=')
    && url.includes('Expires=')
    && url.includes('Signature=')
  )
}

export function detectFileType(buffer: Buffer): string {
  const hex = buffer.toString('hex', 0, 12)

  // MP4 video
  if (hex.startsWith('000000') && buffer.toString('ascii', 4, 8) === 'ftyp') {
    return '.mp4'
  }

  // WebM
  if (hex.startsWith('1a45dfa3')) {
    return '.webm'
  }

  // MOV/QuickTime
  if (buffer.toString('ascii', 4, 8) === 'ftyp' && buffer.toString('ascii', 8, 12) === 'qt  ') {
    return '.mov'
  }

  return '.unknown'
}
