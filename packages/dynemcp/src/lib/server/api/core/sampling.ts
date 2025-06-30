// sampling.ts
// API funcional para Sampling (LLM completions) en DyneMCP
// --------------------------------------------------------

import type { SamplingRequest, SamplingResult } from './interfaces'

/**
 * Solicita un completion LLM vía MCP sampling/createMessage.
 * El usuario debe pasar una función de transporte que envíe el request MCP y devuelva la respuesta.
 */
export async function sample(
  request: SamplingRequest,
  sendMcpRequest: (method: string, params: any) => Promise<any>
): Promise<SamplingResult> {
  const response = await sendMcpRequest('sampling/createMessage', request)
  // Validar y normalizar la respuesta según la spec MCP
  return response as SamplingResult
}
