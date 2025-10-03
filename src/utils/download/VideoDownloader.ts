import { Buffer } from 'node:buffer'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import type { IDownloadOptions, IDownloadProgress, IDownloadResult } from '../../interfaces'
import { Base } from '../common'
import {
  detectFileType,
  formatBytes,
  generateFilename,
  isUrlExpired,
  isValidGCSUrl,
  truncateUrl,
} from './func'

export class VideoDownloader extends Base {
  private defaultOutputDir: string

  constructor(defaultOutputDir: string = './downloads') {
    super()

    this.defaultOutputDir = defaultOutputDir
    this.ensureDirectoryExists(defaultOutputDir)
  }

  /**
   * Tải video từ Google Cloud Storage signed URL
   */
  async download(url: string, options: IDownloadOptions = {}): Promise<IDownloadResult> {
    const startTime = Date.now()

    // Validate URL
    if (!isValidGCSUrl(url)) {
      throw new Error('Invalid Google Cloud Storage URL')
    }

    // Check if URL expired
    if (isUrlExpired(url)) {
      throw new Error('Signed URL has expired')
    }

    // Setup paths
    const outputDir = options.outputDir || this.defaultOutputDir
    this.ensureDirectoryExists(outputDir)

    const filename = options.filename || generateFilename(url)
    const tempPath = path.join(outputDir, `${filename}.tmp`)
    const finalPath = path.join(outputDir, `${filename}.mp4`)

    try {
      // Fetch video
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Failed to download: ${response.status} ${response.statusText}`)
      }

      const contentType = response.headers.get('content-type') || 'unknown'
      const contentLength = Number.parseInt(response.headers.get('content-length') || '0', 10)

      this.logger.debug(`📥 Downloading video...`)
      this.logger.debug(`   URL: ${truncateUrl(url)}`)
      this.logger.debug(`   Content-Type: ${contentType}`)
      this.logger.debug(`   Size: ${formatBytes(contentLength)}`)

      // Download with progress tracking
      if (response.body) {
        await this.downloadWithProgress(response.body, tempPath, contentLength, options.onProgress)
      } else {
        throw new Error('Response body is null')
      }

      // Verify file type and rename
      const buffer = fs.readFileSync(tempPath)
      const detectedType = detectFileType(buffer)

      if (detectedType !== '.mp4') {
        this.logger.warn(`⚠️  Warning: Detected file type is ${detectedType}, not .mp4`)
      }

      // Move temp file to final path
      fs.renameSync(tempPath, finalPath)

      const duration = Date.now() - startTime
      const fileSize = fs.statSync(finalPath).size

      this.logger.debug(`✅ Downloaded successfully!`)
      this.logger.debug(`   Path: ${finalPath}`)
      this.logger.debug(`   Size: ${formatBytes(fileSize)}`)
      this.logger.debug(`   Duration: ${(duration / 1000).toFixed(2)}s`)
      this.logger.debug(`   Speed: ${formatBytes(fileSize / (duration / 1000))}/s`)

      return {
        filePath: finalPath,
        size: fileSize,
        duration,
        contentType,
      }
    } catch (error) {
      // Cleanup temp file on error
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath)
      }
      throw error
    }
  }

  /**
   * Download multiple videos
   */
  async downloadMultiple(
    urls: string[],
    options: IDownloadOptions = {},
  ): Promise<IDownloadResult[]> {
    const results: IDownloadResult[] = []

    for (let i = 0; i < urls.length; i++) {
      this.logger.debug(`\n[${i + 1}/${urls.length}] Downloading...`)
      try {
        const result = await this.download(urls[i], {
          ...options,
          filename: options.filename ? `${options.filename}_${i + 1}` : undefined,
        })
        results.push(result)
      } catch (error) {
        this.logger.error(`❌ Failed to download video ${i + 1}:`, error)
      }
    }

    return results
  }

  /**
   * Download với progress tracking
   */
  private async downloadWithProgress(
    body: ReadableStream<Uint8Array>,
    outputPath: string,
    totalSize: number,
    onProgress?: (progress: IDownloadProgress) => void,
  ): Promise<void> {
    const reader = body.getReader()
    const writer = fs.createWriteStream(outputPath)

    let downloaded = 0
    const startTime = Date.now()
    let lastUpdateTime = startTime

    try {
      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          break
        }

        if (value) {
          // Handle backpressure
          if (!writer.write(Buffer.from(value))) {
            await new Promise<void>((resolve) => writer.once('drain', resolve))
          }

          downloaded += value.length

          // Update progress every 500ms
          const now = Date.now()
          if (now - lastUpdateTime > 500 || downloaded === totalSize) {
            const elapsed = (now - startTime) / 1000
            const speed = downloaded / elapsed
            const percentage = totalSize > 0 ? (downloaded / totalSize) * 100 : 0

            const progress: IDownloadProgress = {
              downloaded,
              total: totalSize,
              percentage,
              speed,
            }

            if (onProgress) {
              onProgress(progress)
            }

            // Console progress
            process.stdout.write(
              `\r   Progress: ${percentage.toFixed(1)}% `
              + `(${formatBytes(downloaded)}/${formatBytes(totalSize)}) `
              + `- ${formatBytes(speed)}/s`,
            )

            lastUpdateTime = now
          }
        }
      }

      writer.end()

      // Wait for write stream to finish
      await new Promise<void>((resolve, reject) => {
        writer.once('finish', () => resolve())
        writer.once('error', (err) => reject(err))
      })
    } catch (error) {
      // Cleanup: close both reader and writer
      writer.destroy()
      await reader.cancel().catch(() => {}) // Ignore cancel errors
      throw error
    }
  }

  /**
   * Ensure directory exists
   */
  private ensureDirectoryExists(dir: string): void {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
  }
}
