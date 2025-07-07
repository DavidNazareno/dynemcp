vi.mock('fs-extra', () => ({
  default: {
    ensureDir: vi.fn(),
    copy: vi.fn(),
  },
}))
vi.mock('fast-glob', () => ({
  default: { glob: vi.fn() },
}))

import { describe, it, expect, beforeEach } from 'vitest'
import fsExtraDefault from 'fs-extra'
import fastGlobDefault from 'fast-glob'
import { copy } from '../core/copy'

const fsExtra = fsExtraDefault as any
const fastGlob = fastGlobDefault as any

describe('copy', () => {
  beforeEach(() => {
    fsExtra.ensureDir.mockReset()
    fsExtra.copy.mockReset()
    fastGlob.glob.mockReset()
  })

  it('copies a single file to the destination', async () => {
    fastGlob.glob.mockResolvedValue(['file1.txt'])
    await copy('file1.txt', 'dest')
    expect(fastGlob.glob).toHaveBeenCalled()
    expect(fsExtra.ensureDir).toHaveBeenCalled()
    expect(fsExtra.copy).toHaveBeenCalled()
  })

  it('copies multiple files to the destination', async () => {
    fastGlob.glob.mockResolvedValue(['file1.txt', 'dir/file2.txt'])
    await copy(['file1.txt', 'dir/file2.txt'], 'dest')
    expect(fsExtra.copy).toHaveBeenCalledTimes(2)
  })

  it('respects the parents option', async () => {
    fastGlob.glob.mockResolvedValue(['file1.txt'])
    await copy('file1.txt', 'dest', { parents: true })
    expect(fsExtra.copy).toHaveBeenCalled()
  })

  it('uses the rename option if provided', async () => {
    fastGlob.glob.mockResolvedValue(['file1.txt'])
    const rename = (name: string) => `renamed-${name}`
    await copy('file1.txt', 'dest', { rename })
    expect(fsExtra.copy).toHaveBeenCalled()
  })

  it('throws if an error occurs', async () => {
    fastGlob.glob.mockRejectedValue(new Error('glob error'))
    await expect(copy('file1.txt', 'dest')).rejects.toThrow('glob error')
  })
})
