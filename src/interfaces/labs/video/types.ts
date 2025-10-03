import type { IResponseBatchCheckGenerateVideo } from './response'

export interface IPayloadGenerateVideo {
  projectId: string
  prompt: string
}

export interface IPayloadBatchCheckGenerateVideo extends IResponseBatchCheckGenerateVideo {}
