import type { IDirectApiProvider, IPayloadProvider } from '../../interfaces'
import type { EnumLabsProvider } from '../../utils'
import { DirectApiProjectsActions, UtilDirectApiActions } from './actions'

export class DirectApiProvider implements IDirectApiProvider {
  private utils: UtilDirectApiActions
  private projects: DirectApiProjectsActions

  constructor(payload: IPayloadProvider<EnumLabsProvider.DIRECT_API>) {
    this.utils = new UtilDirectApiActions(payload.labsConfig, payload.logUpdate)
    this.projects = new DirectApiProjectsActions(this.utils)
  }

  public get useUtils(): UtilDirectApiActions {
    return this.utils
  }

  public get useProjects(): DirectApiProjectsActions {
    return this.projects
  }
}
