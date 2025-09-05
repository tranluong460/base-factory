export interface IFacebookLogger {
  log: (...args: any[]) => void
  warn: (...args: any[]) => void
  error: (...args: any[]) => void
  info: (...args: any[]) => void
  debug: (...args: any[]) => void
}

export interface IFacebookLoggerOption {
  logger?: IFacebookLogger
  debug?: boolean
}
