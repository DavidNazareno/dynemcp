import { describe, it, expect, vi } from 'vitest'
import path from 'path'

// Mock the "../../shared" module that template-generator depends on.
// The mock is declared with the same module specifier used inside template-generator.ts
vi.mock('../../shared', () => ({
  // The template directory used by getTemplateFile
  getTemplatesDir: () => '/tmp/templates',
  // Stub implementations for the rest of the exports that template-generator relies on
  getPackageVersion: () => '1.0.0',
  copy: vi.fn(),
  installDependencies: vi.fn(),
}))

// After the mock is in place, import the module under test
import { getTemplateFile, SRC_DIR_NAMES } from '../core/template-generator'

describe('template-generator', () => {
  it('getTemplateFile should construct the correct absolute path', () => {
    const result = getTemplateFile({
      template: 'default-http',
      file: 'index.ts',
    })

    expect(result).toBe(path.join('/tmp/templates', 'default-http', 'index.ts'))
  })

  it('SRC_DIR_NAMES should include all expected sub-directory names', () => {
    expect(SRC_DIR_NAMES).toEqual(
      expect.arrayContaining(['src', 'prompts', 'resources', 'tools'])
    )
  })
})
