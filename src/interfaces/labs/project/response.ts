import type { ICustomResponseLabs } from '../../api'

export interface IResponseCreateProject
  extends ICustomResponseLabs<{
    projectId: string
    projectInfo: {
      projectTitle: string
    }
  }> {}

export interface IResponseDeleteProject extends ICustomResponseLabs<object> {}

export interface IResponseGetInfoProject
  extends ICustomResponseLabs<{
    workflows: {
      workflowId: string
      workflowSteps: {
        workflowStepId: string
        toolInfo: {
          toolName: string
        }
        mediaGenerations: {
          mediaGenerationId: {
            mediaType: string
            projectId: string
            workflowId: string
            workflowStepId: string
            mediaKey: string
          }
          mediaData: {
            videoData: {
              generatedVideo: {
                seed: number
                mediaGenerationId: string
                prompt: string
                aspectRatio: string
              }
              fifeUri: string
              servingBaseUri: string
            }
          }
          mediaExtraData: {
            mediaTitle: string
            toolName: string
            mediaType: string
            videoExtraData: object
          }
          audioGenerationSafetyFilters: string[]
        }[]
        workflowStepLog: {
          stepCreationTime: string
          requestData: {
            videoGenerationRequestData: {
              videoModelControlInput: {
                videoModelName: string
                videoGenerationMode: string
                videoModelDisplayName: string
                videoAspectRatio: string
              }
            }
            promptInputs: {
              textInput: string
            }[]
          }
        }
      }[]
      createTime: string
    }[]
  }> {}
