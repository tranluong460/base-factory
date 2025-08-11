import { ProjectLogger } from '../../core'
import type { IProjectProvider } from '../../interfaces'

export class ProjectProvider implements IProjectProvider {
  private readonly logger: ProjectLogger

  constructor() {
    this.logger = ProjectLogger.getInstance()
  }

  async start(): Promise<boolean> {
    this.logger.info('ProjectProvider start')

    return true
  }
}
