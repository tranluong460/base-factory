import type { IDirectApiProvider, IPayloadProvider } from '../../interfaces'
import type { EnumLabsProvider } from '../../utils'
import {
  DirectApiAccountActions,
  DirectApiProjectsActions,
  DirectApiVideoActions,
  UtilDirectApiActions,
} from './actions'

export class DirectApiProvider implements IDirectApiProvider {
  private utils: UtilDirectApiActions
  private projects: DirectApiProjectsActions
  private accounts: DirectApiAccountActions
  private videos: DirectApiVideoActions

  constructor(payload: IPayloadProvider<EnumLabsProvider.DIRECT_API>) {
    this.utils = new UtilDirectApiActions(payload.labsConfig, payload.logUpdate)
    this.projects = new DirectApiProjectsActions(this.utils)
    this.accounts = new DirectApiAccountActions(this.utils)
    this.videos = new DirectApiVideoActions(this.utils, this.accounts)
  }

  public get useUtils(): UtilDirectApiActions {
    return this.utils
  }

  public get useProjects(): DirectApiProjectsActions {
    return this.projects
  }

  public get useAccounts(): DirectApiAccountActions {
    return this.accounts
  }

  public get useVideos(): DirectApiVideoActions {
    return this.videos
  }
}
