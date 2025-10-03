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

      const isSuccess = !isEmpty(response?.access_token)
      await this.log(isSuccess, 'get_token_account')

      return isSuccess ? response : undefined
    } catch (error) {
      this.logger.error('[DirectApiAccountActions] Get token account error', error)
      return undefined
    }
  }
}
