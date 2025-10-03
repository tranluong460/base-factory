export interface IOperations {
  operation: {
    name: string
    metadata: {
      '@type': string
      'name': string
      'video': {
        seed: number
        mediaGenerationId: string
        prompt: string
        fifeUrl: string
        servingBaseUri: string
        model: string
        aspectRatio: string
      }
    }
  }
  sceneId: string
  mediaGenerationId: string
  status:
    | 'MEDIA_GENERATION_STATUS_PENDING'
    | 'MEDIA_GENERATION_STATUS_ACTIVE'
    | 'MEDIA_GENERATION_STATUS_SUCCESSFUL'
}

export interface IResponseCreateVideo extends IResponseBatchCheckGenerateVideo {
  remainingCredits: number
}

export interface IResponseBatchCheckGenerateVideo {
  operations: IOperations[]
}
