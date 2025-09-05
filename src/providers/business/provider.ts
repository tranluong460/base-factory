import type { IBusinessProvider } from '../../interfaces'
import { BusinessApiActions, BusinessAutomatedActions, BusinessScriptedActions } from './actions'

export class BusinessProvider implements IBusinessProvider {
  public get useApi(): BusinessApiActions {
    return new BusinessApiActions()
  }

  public get useAutomated(): BusinessAutomatedActions {
    return new BusinessAutomatedActions()
  }

  public get useScripted(): BusinessScriptedActions {
    return new BusinessScriptedActions()
  }
}
