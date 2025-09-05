import type { IFacebookLogger, IFacebookLoggerOption } from '../interfaces'

export class FacebookLogger {
  private static instance: FacebookLogger
  private readonly loggerApi: IFacebookLogger
  private isDebug = false

  private constructor(loggerOptions?: IFacebookLoggerOption) {
    this.loggerApi = loggerOptions?.logger ?? console
    this.isDebug = loggerOptions?.debug ?? false
  }

  public static getInstance(loggerOptions?: IFacebookLoggerOption): FacebookLogger {
    if (!FacebookLogger.instance) {
      FacebookLogger.instance = new FacebookLogger(loggerOptions)
    }
    return FacebookLogger.instance
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
