import { describe, it, expect, vi } from 'vitest'
import fs from 'fs-extra'
import {
  validateProjectName,
  validateProjectPath,
  validateTemplate,
} from '../helpers/validate'

// Mock fs-extra
vi.mock('fs-extra', async () => {
  const actual = await vi.importActual('fs-extra')
  return {
    ...actual,
    default: {
      existsSync: vi.fn(),
      readdirSync: vi.fn().mockReturnValue([]),
    },
    existsSync: vi.fn(),
    readdirSync: vi.fn().mockReturnValue([]),
  }
})

describe('validateProjectName', () => {
  it('should validate valid project names', () => {
    const result = validateProjectName('valid-project-name')
    expect(result.valid).toBe(true)
    expect(result.problems).toBeUndefined()
  })

  it('should invalidate project names with spaces', () => {
    const result = validateProjectName('invalid project name')
    expect(result.valid).toBe(false)
    expect(result.problems).toBeDefined()
    expect(result.problems?.length).toBeGreaterThan(0)
  })

  it('should invalidate project names with uppercase letters', () => {
    const result = validateProjectName('InvalidProjectName')
    expect(result.valid).toBe(false)
    expect(result.problems).toBeDefined()
    expect(result.problems?.length).toBeGreaterThan(0)
  })
})

describe('validateProjectPath', () => {
  it('should validate a path that does not exist', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false)

    const result = validateProjectPath('/path/to/project')
    expect(result.valid).toBe(true)
    expect(result.message).toBeUndefined()
  })

  it('should validate an empty directory', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true)
    vi.mocked(fs.readdirSync).mockReturnValue([])

    const result = validateProjectPath('/path/to/project')
    expect(result.valid).toBe(true)
    expect(result.message).toBeUndefined()
  })

  it('should invalidate a non-empty directory', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true)
    // La función validateProjectPath solo comprueba la longitud del array, no usa propiedades de Dirent
    vi.mocked(fs.readdirSync).mockReturnValue([
      'file1',
      'file2',
    ] as unknown as never)

    const result = validateProjectPath('/path/to/project')
    expect(result.valid).toBe(false)
    expect(result.message).toBeDefined()
  })
})

describe('validateTemplate', () => {
  it('should validate an available template', () => {
    const availableTemplates = ['default', 'minimal', 'full']

    const result = validateTemplate('default', availableTemplates)
    expect(result.valid).toBe(true)
    expect(result.message).toBeUndefined()
  })

  it('should invalidate an unavailable template', () => {
    const availableTemplates = ['default', 'minimal', 'full']

    const result = validateTemplate('nonexistent', availableTemplates)
    expect(result.valid).toBe(false)
    expect(result.message).toBeDefined()
  })
})
