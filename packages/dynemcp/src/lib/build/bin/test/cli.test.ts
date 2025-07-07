import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ------------------------------------------------------------
// Mocks and utilities
// ------------------------------------------------------------
// Use deferred creation inside mock factory to avoid hoisting issues
vi.mock('../../main', () => {
  const build = vi.fn().mockResolvedValue({ success: true })
  const watch = vi.fn().mockResolvedValue({ dispose: vi.fn() })
  const buildCli = vi.fn().mockResolvedValue({ success: true })
  const clean = vi.fn().mockResolvedValue(undefined)
  const analyze = vi.fn().mockResolvedValue(undefined)
  return { build, watch, buildCli, clean, analyze }
})

import * as mainModule from '../../main'
const buildMock = mainModule.build as unknown as ReturnType<typeof vi.fn>
const watchMock = mainModule.watch as unknown as ReturnType<typeof vi.fn>
const buildCliMock = mainModule.buildCli as unknown as ReturnType<typeof vi.fn>
const cleanMock = mainModule.clean as unknown as ReturnType<typeof vi.fn>
const analyzeMock = mainModule.analyze as unknown as ReturnType<typeof vi.fn>

// Now import the module under test (with mocks already in place)
import path from 'path'
import fs from 'fs-extra'

import { parseArgs, run } from '../core/cli'
import type { CliOptions } from '../core/cli'

function defaultOptions(): CliOptions {
  return {
    clean: false,
    analyze: false,
    manifest: false,
    html: false,
    watch: false,
    cli: false,
    help: false,
    version: false,
    config: undefined,
  }
}

describe('parseArgs', () => {
  it('returns defaults when no args are provided', () => {
    const { command, options } = parseArgs([])

    expect(command).toBe('build')
    expect(options).toEqual(defaultOptions())
  })

  it('parses command and boolean flags correctly', () => {
    const { command, options } = parseArgs([
      'watch',
      '--clean',
      '--analyze',
      '--manifest',
      '--html',
      '--cli',
    ])

    expect(command).toBe('watch')
    expect(options).toEqual({
      ...defaultOptions(),
      clean: true,
      analyze: true,
      manifest: true,
      html: true,
      cli: true,
    })
  })

  it('parses short/long options with values (config path)', () => {
    const { command, options } = parseArgs([
      '--config',
      'custom/dynebuild.config.ts',
      'build',
    ])

    expect(command).toBe('build')
    expect(options.config).toBe('custom/dynebuild.config.ts')
  })

  it('warns on unknown options', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(vi.fn())
    parseArgs(['--unknown'])
    expect(warnSpy).toHaveBeenCalled()
    warnSpy.mockRestore()
  })
})

// ------------------------------------------------------------
// Tests for `run` function
// ------------------------------------------------------------

describe('run', () => {
  const originalArgv = process.argv.slice()
  let existsSpy: any

  beforeEach(() => {
    // Ensure mocks are reset before each test
    buildMock.mockClear()
    watchMock.mockClear()
    buildCliMock.mockClear()
    cleanMock.mockClear()
    analyzeMock.mockClear()

    // Mock fs.existsSync to always return true so the CLI thinks the config exists
    existsSpy = vi.spyOn(fs, 'existsSync').mockReturnValue(true)
  })

  afterEach(() => {
    // Restore original argv and mocks
    process.argv = originalArgv.slice()
    existsSpy.mockRestore()
  })

  it('calls build with correct options when invoked with --clean', async () => {
    process.argv = ['node', 'cli.js', '--clean']

    await run()

    expect(buildMock).toHaveBeenCalledTimes(1)
    expect(buildMock).toHaveBeenCalledWith({
      configPath: path.join(process.cwd(), 'dynemcp.config.ts'),
      clean: true,
      analyze: false,
      manifest: false,
      html: false,
    })
  })
})
