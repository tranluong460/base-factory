import crypto from 'node:crypto'
import { delay } from '@vitechgroup/mkt-key-client'
import { isEmpty } from 'lodash'
import type {
  IPayloadBatchCheckGenerateVideo,
  IPayloadGenerateVideo,
  IResponseBatchCheckGenerateVideo,
  IResponseCreateVideo,
  TCreateFrom,
} from '../../../interfaces'
import { BaseProvider, LABS_TOOL_NAME } from '../../../utils'
import type { DirectApiAccountActions } from './accounts'
import type { UtilDirectApiActions } from './utils'

export class DirectApiVideoActions extends BaseProvider<UtilDirectApiActions> {
  constructor(
    utilActions: UtilDirectApiActions,
    private useAccounts: DirectApiAccountActions,
  ) {
    super(utilActions)
  }

  public async generateVideo(
    payload: IPayloadGenerateVideo,
    createFrom: TCreateFrom,
  ): Promise<void> {
    switch (createFrom) {
      case 'text': {
        const result1 = await this.createVideoText(payload)
        if (!result1) {
          return
        }

        const result2 = await this.batchCheckGenerateVideo({
          operations: result1.operations,
        })

        console.log('result', result2)

        break
      }
    }
  }

  private async createVideoText(
    payload: IPayloadGenerateVideo,
  ): Promise<IResponseCreateVideo | undefined> {
    try {
      const result = await this.useAccounts.getTokenAccount()
      if (!result) {
        return undefined
      }

      await this.utilActions.logUpdate({
        action: 'create_video',
        key: 'wait_create_video',
        mess: `wait_create_video|${payload.projectId}`,
      })

      const response = await this.utilActions.labsClient.postAisandbox<IResponseCreateVideo>({
        endPoint: 'video:batchAsyncGenerateVideoText',
        accessToken: result.access_token,
        data: {
          clientContext: {
            projectId: payload.projectId,
            tool: LABS_TOOL_NAME,
            userPaygateTier: 'PAYGATE_TIER_TWO',
          },
          requests: [
            {
              aspectRatio: 'VIDEO_ASPECT_RATIO_LANDSCAPE',
              seed: 25047,
              textInput: {
                prompt: payload.prompt,
              },
              videoModelKey: 'veo_3_0_t2v_fast_ultra',
              metadata: {
                sceneId: crypto.randomUUID(),
              },
            },
            {
              aspectRatio: 'VIDEO_ASPECT_RATIO_LANDSCAPE',
              seed: 26426,
              textInput: {
                prompt: payload.prompt,
              },
              videoModelKey: 'veo_3_0_t2v_fast_ultra',
              metadata: {
                sceneId: crypto.randomUUID(),
              },
            },
          ],
        },
      })

      const isSuccess = !isEmpty(response?.operations)
      await this.log(isSuccess, 'create_video', [payload.projectId])

      return isSuccess ? response : undefined
    } catch (error) {
      this.logger.error('[DirectApiVideoActions] Create video error', error)
      return undefined
    }
  }

  private async batchCheckGenerateVideo(
    payload: IPayloadBatchCheckGenerateVideo,
  ): Promise<IResponseBatchCheckGenerateVideo | undefined> {
    try {
      const result = await this.useAccounts.getTokenAccount()
      if (!result) {
        return undefined
      }

      let loop: boolean = true
      let errorCount: number = 0
      let response: IResponseBatchCheckGenerateVideo | undefined

      while (loop) {
        await this.utilActions.logUpdate({
          action: 'batch_check_generate_video',
          key: 'wait_batch_check_generate_video',
          mess: `wait_batch_check_generate_video`,
        })

        response
          = await this.utilActions.labsClient.postAisandbox<IResponseBatchCheckGenerateVideo>({
            endPoint: 'video:batchCheckAsyncVideoGenerationStatus',
            accessToken: result.access_token,
            data: payload,
          })

        if (isEmpty(response?.operations)) {
          errorCount++

          await this.utilActions.logUpdate({
            action: 'batch_check_generate_video',
            key: 'batch_check_generate_video_failed',
            mess: `batch_check_generate_video_failed|${errorCount}`,
          })

          if (errorCount >= 5) {
            await this.utilActions.logUpdate({
              action: 'batch_check_generate_video',
              key: 'prompt_violate_policy',
              mess: `prompt_violate_policy`,
            })

            loop = false
          }
        }

        if (
          response?.operations.every(
            (operation) => operation.status === 'MEDIA_GENERATION_STATUS_SUCCESSFUL',
          )
        ) {
          loop = false
        } else {
          await delay(10000)
        }
      }

      return errorCount >= 5 ? undefined : response
    } catch (error) {
      this.logger.error('[DirectApiVideoActions] Batch check generate video error', error)
      return undefined
    }
  }
}
