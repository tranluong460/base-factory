import type { IProjectProvider } from '.'

export interface IProjectProviderFactory {
  create: () => IProjectProvider
}
