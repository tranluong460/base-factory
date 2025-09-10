import type { IPayloadProvider, IWWWProvider } from '../../interfaces'
import { WWWApiActions, WWWAutomatedActions, WWWScriptedActions } from './actions'

export class WWWProvider implements IWWWProvider {
  private automated: WWWAutomatedActions
  private scripted: WWWScriptedActions
  private api: WWWApiActions

  constructor(payload: IPayloadProvider) {
    this.automated = new WWWAutomatedActions(payload)
    this.scripted = new WWWScriptedActions(payload)
    this.api = new WWWApiActions(payload)
  }

  public get useAutomated(): WWWAutomatedActions {
    return this.automated
  }

  public get useScripted(): WWWScriptedActions {
    return this.scripted
  }

  public get useApi(): WWWApiActions {
    return this.api
  }
}
