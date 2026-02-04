import type { ICoreLogger } from '@vitechgroup/mkt-elec-core'

/** Logging configuration */
export interface LoggingConfig {
  logRequests?: boolean
  logResponses?: boolean
  logErrors?: boolean
  logPerformance?: boolean
  logger?: ICoreLogger
}

/** Resolved logging config with all fields required */
export type ResolvedLoggingConfig = Required<LoggingConfig>
