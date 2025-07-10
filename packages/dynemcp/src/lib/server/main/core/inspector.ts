import { fileLogger } from '../../../../global/logger'
import { TRANSPORT } from '../../../../global/config-all-contants'
import { spawnProcess } from '../../../cli/core/utils'
import { loadConfig } from '../../config/core/loader'
import type { StreamableHTTPTransportConfig } from '../../config/core/interfaces'

export async function launchInspectorProcess() {
  fileLogger.info('🔍 Launching MCP Inspector...')

  const config = await loadConfig()

  const packageName = '@modelcontextprotocol/inspector'

  let inspectorArgs: string[]

  if (config.transport?.type === TRANSPORT.TRANSPORT_TYPES.HTTP) {
    if (!config.transport.options) {
      throw new Error('HTTP transport requires options')
    }

    spawnProcess('npx', ['tsx', 'src/index.ts'])

    const httpConfig = config.transport.options as StreamableHTTPTransportConfig
    inspectorArgs = [
      packageName,
      `http://localhost:${httpConfig.options?.port}${httpConfig.options?.endpoint}`,
    ]
  } else {
    inspectorArgs = [packageName, 'tsx', 'src/index.ts']
  }

  const inspectorProcess = spawnProcess('npx', inspectorArgs)

  return inspectorProcess
}
