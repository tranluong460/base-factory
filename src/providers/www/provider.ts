import type { IWWWProvider } from '../../interfaces'
import { WWWApiActions, WWWAutomatedActions, WWWScriptedActions } from './actions'

export class WWWProvider implements IWWWProvider {
  public get useAutomated(): WWWAutomatedActions {
    return new WWWAutomatedActions()
  }

  public get useScripted(): WWWScriptedActions {
    return new WWWScriptedActions()
  }

  public get useApi(): WWWApiActions {
    return new WWWApiActions()
  }
}
