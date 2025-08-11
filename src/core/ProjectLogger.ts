import type { IProjectLogger, IProjectLoggerOption } from '../interfaces'

export class ProjectLogger {
  private static instance: ProjectLogger
  private readonly loggerApi: IProjectLogger
  private isDebug = false

  private constructor(loggerOptions?: IProjectLoggerOption) {
    this.loggerApi = loggerOptions?.logger ?? console
    this.isDebug = loggerOptions?.debug ?? false
  }

  public static getInstance(loggerOptions?: IProjectLoggerOption): ProjectLogger {
    if (!ProjectLogger.instance) {
      ProjectLogger.instance = new ProjectLogger(loggerOptions)
    }
    return ProjectLogger.instance
  }

  private formatArgsForWinston(message: string, args: any[]): string {
    if (!args || args.length === 0) {
      return message
    }

    const formattedArgs = args.map((arg) => {
      if (arg === null) {
        return 'null'
      }
      if (arg === undefined) {
        return 'undefined'
      }
      if (typeof arg === 'string') {
        return arg
      }
      if (typeof arg === 'number' || typeof arg === 'boolean') {
        return String(arg)
      }
      if (arg instanceof Error) {
        return `Error: ${arg.name} - ${arg.message}`
      }
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg, null, 2)
        } catch {
          return '[Object (circular)]'
        }
      }
      return String(arg)
    })

    return `${message} ${formattedArgs.join(' ')}`
  }

  private supportsMultipleArgs(): boolean {
    if (this.loggerApi === console || this.loggerApi.constructor?.name === 'Console') {
      return true
    }

    try {
      const debugMethod = this.loggerApi.debug
      if (debugMethod && debugMethod.length !== undefined) {
        return debugMethod.length === 0
      }
    } catch {
      // Fallback: assume không hỗ trợ multiple args
    }

    return false
  }

  private callLogger(method: 'debug' | 'info' | 'warn' | 'error', message: string, args: any[]) {
    const loggerMethod = this.loggerApi[method]

    if (this.supportsMultipleArgs()) {
      loggerMethod.call(this.loggerApi, message, ...args)
    } else {
      const formattedMessage = this.formatArgsForWinston(message, args)
      loggerMethod.call(this.loggerApi, formattedMessage)
    }
  }

  public debug(message: string, ...args: any[]) {
    if (this.isDebug) {
      this.callLogger('debug', message, args)
    }
  }

  public info(message: string, ...args: any[]) {
    this.callLogger('info', message, args)
  }

  public warn(message: string, ...args: any[]) {
    this.callLogger('warn', message, args)
  }

  public error(message: string, ...args: any[]) {
    this.callLogger('error', message, args)
  }
}
