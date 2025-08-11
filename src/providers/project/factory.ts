import type { IProjectProvider, IProjectProviderFactory } from '../../interfaces'
import { ProjectProvider } from './provider'

export class ProjectFactory implements IProjectProviderFactory {
  create(): IProjectProvider {
    return new ProjectProvider()
  }
}
