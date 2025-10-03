import { decodeBase64Mkt } from '@vitechgroup/mkt-key-client'
import type { IPayloadRequestLabsCall } from '../../interfaces'
import { GOOGLE_LABS_FLOW } from './private'

export function generateLabsScript(payload: IPayloadRequestLabsCall): string {
  return `async function labsScript() {
        ${decodeBase64Mkt(GOOGLE_LABS_FLOW)}
        const _json = await GOOGLELABSFLOW(${payload});
        return _json;
    }`
}
