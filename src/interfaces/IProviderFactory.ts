import type { IProvider } from '../interfaces'

export interface IProviderFactory {
  create: () => IProvider
}
