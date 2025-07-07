declare module '@modelcontextprotocol/sdk/dist/esm/types.js' {
  export type JSONRPCMessage =
    | {
        jsonrpc: '2.0'
        id: number | string
        method: string
        params?: object
      }
    | {
        jsonrpc: '2.0'
        id: number | string
        result?: object
        error?: {
          code: number
          message: string
          data?: unknown
        }
      }
    | {
        jsonrpc: '2.0'
        method: string
        params?: object
      }

  export type MessageExtraInfo = any // You can improve this if you have the actual definition
}

declare module '@modelcontextprotocol/sdk/dist/esm/shared/transport.js' {
  import type {
    JSONRPCMessage,
    MessageExtraInfo,
  } from '@modelcontextprotocol/sdk/dist/esm/types.js'
  export interface Transport {
    start(): Promise<void>
    send(message: JSONRPCMessage, options?: TransportSendOptions): Promise<void>
    close(): Promise<void>
    onclose?: () => void
    onerror?: (error: Error) => void
    onmessage?: (message: JSONRPCMessage, extra?: MessageExtraInfo) => void
    sessionId?: string
    setProtocolVersion?: (version: string) => void
  }
  export type TransportSendOptions = {
    relatedRequestId?: number | string
    resumptionToken?: string
    onresumptiontoken?: (token: string) => void
  }
}
