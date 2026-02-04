/** Progress event data */
export interface ProgressEvent {
  loaded: number
  total?: number
  percentage: number
}

/** Progress callbacks for upload/download tracking */
export interface ProgressCallbacks {
  onUploadProgress?: (event: ProgressEvent) => void
  onDownloadProgress?: (event: ProgressEvent) => void
}
