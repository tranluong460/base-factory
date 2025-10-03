export interface IDownloadOptions {
  outputDir?: string
  filename?: string
  onProgress?: (progress: IDownloadProgress) => void
}

export interface IDownloadProgress {
  downloaded: number
  total: number
  percentage: number
  speed: number
}

export interface IDownloadResult {
  filePath: string
  size: number
  duration: number
  contentType: string
}
