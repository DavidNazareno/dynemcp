// sampling.ts
// API funcional para Sampling (LLM completions) en DyneMCP
// --------------------------------------------------------

import type { SamplingRequest, SamplingResult } from './interfaces'
import { getCurrentDyneMCPInstance } from '../../main/core/server-instance'

/**
 * Solicita un completion LLM vía MCP sampling/createMessage.
 * El usuario debe pasar una función de transporte que envíe el request MCP y devuelva la respuesta.
 */
export async function sample(
  request: SamplingRequest
): Promise<SamplingResult> {
  const mcp = getCurrentDyneMCPInstance()
  if (!mcp) throw new Error('No DyneMCP instance available')
  return await mcp.sample(request)
}
