import { isEmpty } from 'lodash'
import type { IResponseGetTokenAccount } from '../../../interfaces'
import { BaseProvider } from '../../../utils'
import type { UtilDirectApiActions } from './utils'

export class DirectApiAccountActions extends BaseProvider<UtilDirectApiActions> {
  constructor(utilActions: UtilDirectApiActions) {
    super(utilActions)
  }

  public async getTokenAccount(): Promise<IResponseGetTokenAccount | undefined> {
    try {
      const response = await this.utilActions.labsClient.get<IResponseGetTokenAccount>({
        endPoint: 'auth/session',
      })

      const isFailed = isEmpty(response?.access_token)

      const key = isFailed ? 'get_token_account_failed' : 'get_token_account_success'
      await this.utilActions.logUpdate({
        action: 'get_token_account',
        key,
        mess: `get_token_account_${key}`,
      })

      return isFailed ? undefined : response
    } catch (error) {
      this.logger.error('[DirectApiAccountActions] Get token account error', error)
      return undefined
    }
  }
}
