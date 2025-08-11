export interface IProjectLogger {
  log: (...args: any[]) => void
  warn: (...args: any[]) => void
  error: (...args: any[]) => void
  info: (...args: any[]) => void
  debug: (...args: any[]) => void
}

export interface IProjectLoggerOption {
  logger?: IProjectLogger
  debug?: boolean
}
