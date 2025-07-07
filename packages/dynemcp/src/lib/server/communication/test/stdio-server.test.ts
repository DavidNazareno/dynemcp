import { describe, it, expect, vi, beforeEach } from 'vitest'

// ------------------------------------------------------------
// Mocks
// ------------------------------------------------------------

const startMock = vi.fn().mockResolvedValue(undefined)
const sendMock = vi.fn().mockResolvedValue(undefined)
const closeMock = vi.fn().mockResolvedValue(undefined)
let onmessageHandler: any = undefined
let oncloseHandler: any = undefined
let onerrorHandler: any = undefined
let setProtocolVersionHandler: any = undefined

vi.mock('@modelcontextprotocol/sdk/server/stdio.js', () => ({
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  StdioServerTransport: class {
    start = startMock
    send = sendMock
    close = closeMock
    get onmessage() {
      return onmessageHandler
    }
    set onmessage(fn) {
      onmessageHandler = fn
    }
    get onclose() {
      return oncloseHandler
    }
    set onclose(fn) {
      oncloseHandler = fn
    }
    get onerror() {
      return onerrorHandler
    }
    set onerror(fn) {
      onerrorHandler = fn
    }
    get setProtocolVersion() {
      return setProtocolVersionHandler
    }
    set setProtocolVersion(fn) {
      setProtocolVersionHandler = fn
    }
  },
}))

const connectMock = vi.fn().mockResolvedValue(undefined)
vi.mock('@modelcontextprotocol/sdk/server/mcp.js', () => ({
  McpServer: class {
    connect = connectMock
  },
}))

vi.mock('../../api/core/root', () => ({
  parseRootList: (params: any) => params.roots,
}))

import { StdioTransport } from '../stdio/server'

describe('StdioTransport', () => {
  beforeEach(() => {
    startMock.mockClear()
    sendMock.mockClear()
    closeMock.mockClear()
    connectMock.mockClear()
    onmessageHandler = undefined
    oncloseHandler = undefined
    onerrorHandler = undefined
    setProtocolVersionHandler = undefined
  })

  it('start() calls SDK start and sets running', async () => {
    const stdio = new StdioTransport()
    await stdio.start()
    expect(startMock).toHaveBeenCalled()
    expect(stdio.isRunning()).toBe(true)
  })

  it('connect() calls server.connect and sets running', async () => {
    const stdio = new StdioTransport()
    const fakeServer = { connect: connectMock }
    await stdio.connect(fakeServer as any)
    expect(connectMock).toHaveBeenCalled()
    expect(stdio.isRunning()).toBe(true)
  })

  it('send() calls SDK send', async () => {
    const stdio = new StdioTransport()
    await stdio.send({ jsonrpc: '2.0', method: 'foo' } as any)
    expect(sendMock).toHaveBeenCalled()
  })

  it('close() calls SDK close and clears running', async () => {
    const stdio = new StdioTransport()
    await stdio.close()
    expect(closeMock).toHaveBeenCalled()
    expect(stdio.isRunning()).toBe(false)
  })
})
