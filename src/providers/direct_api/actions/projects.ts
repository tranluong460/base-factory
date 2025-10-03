import type {
  IPayloadCreateProject,
  IResponseCreateProject,
  IResponseDeleteProject,
  IResponseGetInfoProject,
} from '../../../interfaces'
import { BaseProvider, LABS_TOOL_NAME, LABS_URLS, checkResultResponse } from '../../../utils'
import type { UtilDirectApiActions } from './utils'

export class DirectApiProjectsActions extends BaseProvider<UtilDirectApiActions> {
  constructor(utilActions: UtilDirectApiActions) {
    super(utilActions)
  }

  public async createProject(
    payload: IPayloadCreateProject,
  ): Promise<IResponseCreateProject | undefined> {
    try {
      await this.utilActions.logUpdate({
        action: 'create_project',
        key: 'wait_create_project',
        mess: `wait_create_project|${payload.projectTitle}`,
      })

      const response = await this.utilActions.labsClient.postTrpc<IResponseCreateProject>({
        endPoint: 'project.createProject',
        data: {
          json: {
            projectTitle: payload.projectTitle,
            toolName: LABS_TOOL_NAME,
          },
        },
      })

      const isSuccess = checkResultResponse(response)
      await this.log(isSuccess, 'create_project', [payload.projectTitle])

      return isSuccess ? response : undefined
    } catch (error) {
      this.logger.error('[DirectApiProjectsActions] Create project error', error)
      return undefined
    }
  }

  public async deleteProject(projectId: string): Promise<boolean> {
    try {
      await this.utilActions.logUpdate({
        action: 'delete_project',
        key: 'wait_delete_project',
        mess: `wait_delete_project|${projectId}`,
      })

      const response = await this.utilActions.labsClient.postTrpc<IResponseDeleteProject>({
        endPoint: 'project.deleteProject',
        data: {
          json: {
            projectToDeleteId: projectId,
          },
        },
      })

      const isSuccess = checkResultResponse(response)
      await this.log(isSuccess, 'delete_project', [projectId])

      return isSuccess
    } catch (error) {
      this.logger.error('[DirectApiProjectsActions] Create project error', error)
      return false
    }
  }

  public async getInfoProject(projectId: string): Promise<IResponseGetInfoProject | undefined> {
    try {
      await this.utilActions.logUpdate({
        action: 'get_info_project',
        key: 'wait_get_info_project',
        mess: `wait_get_info_project|${projectId}`,
      })

      const response = await this.utilActions.labsClient.getTrpc<IResponseGetInfoProject>({
        endPoint: 'project.searchProjectWorkflows',
        params: {
          json: {
            pageSize: 4,
            projectId,
            toolName: LABS_TOOL_NAME,
            fetchBookmarked: false,
            rawQuery: '',
            cursor: null,
          },
          meta: { values: { cursor: ['undefined'] } },
        },
        referer: `${LABS_URLS.BASE_URL()}/project` + `/${projectId}`,
      })

      const isSuccess = checkResultResponse(response)
      await this.log(isSuccess, 'get_info_project', [projectId])

      return isSuccess ? response : undefined
    } catch (error) {
      this.logger.error('[DirectApiProjectsActions] Get info project error', error)
      return undefined
    }
  }
}
