// Mocks must be declared before vi.mock and imports for Vitest hoisting
const execaMock = vi.fn()
vi.mock('execa', () => ({ default: execaMock }))
vi.mock('fs-extra', () => ({
  default: {
    existsSync: vi.fn(),
  },
}))

import { describe, it, expect, beforeEach } from 'vitest'
import fsExtraDefault from 'fs-extra'
import { installDependencies } from '../core/install'

const execa = execaMock as any
const fsExtra = fsExtraDefault as any

describe('installDependencies', () => {
  beforeEach(() => {
    execa.mockReset()
    fsExtra.existsSync.mockReset()
  })

  it('runs install command if package.json exists', async () => {
    fsExtra.existsSync.mockReturnValue(true)
    execa.mockResolvedValue({ stdout: 'ok' })
    await installDependencies('path')
    expect(execa).toHaveBeenCalledWith('pnpm', ['install'], {
      cwd: 'path',
      stdio: 'inherit',
    })
  })

  it('skips install if package.json does not exist', async () => {
    fsExtra.existsSync.mockReturnValue(false)
    await installDependencies('path')
    expect(execa).not.toHaveBeenCalled()
  })

  it('throws if install fails', async () => {
    fsExtra.existsSync.mockReturnValue(true)
    execa.mockRejectedValue(new Error('fail'))
    await expect(installDependencies('path')).rejects.toThrow('fail')
  })
})
