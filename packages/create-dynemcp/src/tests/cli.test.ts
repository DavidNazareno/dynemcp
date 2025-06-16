import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import fs from 'fs-extra'
import path from 'path'
import os from 'os'
import { execa } from 'execa'

vi.mock('fs-extra')
vi.mock('execa')

vi.mock('../helpers/create-project', () => ({
  createProject: vi.fn().mockResolvedValue(undefined),
  getAvailableTemplates: vi.fn().mockResolvedValue(['default']),
}))
vi.mock('inquirer', () => ({
  default: {
    prompt: vi.fn().mockResolvedValue({
      projectName: 'test-project',
      template: 'default',
      typescript: true,
      eslint: true,
      git: true,
    }),
  },
}))

const mockExit = vi
  .spyOn(process, 'exit')
  .mockImplementation((_code?: number | string | null) => {
    return undefined as never
  })

describe.skip('CLI Integration', () => {
  const _testDir = path.join(os.tmpdir(), 'create-dynemcp-test')
  const scriptPath = path.resolve(__dirname, '../../dist/index.js')

  beforeEach(() => {
    vi.resetAllMocks()

    mockExit.mockReset()

    vi.mocked(fs.existsSync).mockImplementation(() => false)
    vi.mocked(fs.ensureDir).mockResolvedValue(undefined)
    vi.mocked(fs.copy).mockResolvedValue(undefined)
    vi.mocked(fs.pathExists).mockReset()
    vi.mocked(fs.pathExists).mockImplementation(() => false)
    vi.mocked(fs.readJson).mockResolvedValue({ version: '1.0.0' })
    vi.mocked(fs.writeJson).mockResolvedValue(undefined)
    vi.mocked(fs.writeFile).mockResolvedValue(undefined)
    vi.mocked(fs.readdir).mockImplementation(async () => {
      const mockDirent = {
        name: 'default',
        isFile: () => true,
        isDirectory: () => false,
        isBlockDevice: () => false,
        isCharacterDevice: () => false,
        isSymbolicLink: () => false,
        isFIFO: () => false,
        isSocket: () => false,
      } as fs.Dirent

      return [mockDirent]
    })
    vi.mocked(fs.statSync).mockImplementation(
      () =>
        ({
          isDirectory: () => true,
          isFile: () => false,
          isSymbolicLink: () => false,
          isBlockDevice: () => false,
          isCharacterDevice: () => false,
          isFIFO: () => false,
          isSocket: () => false,
          dev: 0,
          ino: 0,
          mode: 0,
          nlink: 0,
          uid: 0,
          gid: 0,
          rdev: 0,
          size: 0,
          blksize: 0,
          blocks: 0,
          atimeMs: 0,
          mtimeMs: 0,
          ctimeMs: 0,
          birthtimeMs: 0,
          atime: new Date(),
          mtime: new Date(),
          ctime: new Date(),
          birthtime: new Date(),
        }) as fs.Stats
    )
    vi.mocked(fs.readFileSync).mockImplementation(() =>
      Buffer.from(JSON.stringify({ version: '1.0.0' }))
    )
    vi.mocked(fs.readdirSync).mockImplementation(() => [])

    vi.mocked(fs.readdir).mockImplementation(() => [])

    vi.mocked(execa).mockImplementation(() => {
      const mockPromise = Promise.resolve({
        exitCode: 0,
        stdout: '',
        stderr: '',
        all: undefined,
        failed: false,
        killed: false,
        signal: null,
        timedOut: false,
        // Implementación mínima para satisfacer el tipo
        cancel: () => {
          return new Promise<void>(resolve => resolve())
        },
      }) as unknown as ReturnType<typeof execa>
      return mockPromise
    })
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('should create a project with default options when using --yes flag', async () => {
    vi.mocked(fs.pathExists).mockResolvedValueOnce(false as unknown as void)

    vi.mocked(fs.ensureDir).mockImplementationOnce(async path => {
      console.log(`ensureDir called with: ${path}`)
      return
    })

    await execa('node', [scriptPath, 'test-project', '--yes'])

    expect(fs.ensureDir).toHaveBeenCalledWith(
      expect.stringContaining('test-project')
    )
    expect(fs.copy).toHaveBeenCalled()
    expect(fs.writeJson).toHaveBeenCalled()

    expect(execa).toHaveBeenCalledWith('pnpm', ['install'], expect.any(Object))

    expect(execa).toHaveBeenCalledWith('git', ['init'], expect.any(Object))
  })

  it('should create a project with specified options', async () => {
    vi.mocked(fs.pathExists).mockResolvedValueOnce(false as unknown as void)

    vi.mocked(fs.ensureDir).mockImplementationOnce(async path => {
      console.log(`ensureDir called with: ${path}`)
      return
    })

    await execa('node', [
      scriptPath,
      'custom-project',
      '--template',
      'default',
      '--use-npm',
      '--no-typescript',
      '--no-git',
    ])

    expect(fs.ensureDir).toHaveBeenCalledWith(
      expect.stringContaining('custom-project')
    )

    expect(execa).toHaveBeenCalledWith('npm', ['install'], expect.any(Object))

    const gitInitCalls = vi
      .mocked(execa)
      .mock.calls.filter(
        call =>
          call[0] === 'git' && Array.isArray(call[1]) && call[1][0] === 'init'
      )
    expect(gitInitCalls.length).toBe(0)
  })

  it('should handle invalid project names', async () => {
    const _validateNpmPackageName = await import('validate-npm-package-name')
    vi.mock('validate-npm-package-name', () => ({
      default: vi.fn().mockReturnValue({
        validForNewPackages: false,
        errors: ['Invalid name'],
      }),
    }))

    await execa('node', [scriptPath, 'Invalid Name'])

    expect(mockExit).toHaveBeenCalledWith(1)
  })

  it('should handle existing non-empty directories', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true)
    vi.mocked(fs.readdirSync).mockReturnValue([
      'existing-file',
    ] as unknown as never)

    await execa('node', [scriptPath, 'existing-dir'])

    expect(mockExit).toHaveBeenCalledWith(1)
  })
})
