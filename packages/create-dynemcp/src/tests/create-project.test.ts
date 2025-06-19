import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getAvailableTemplates,
  createProject,
} from '../helpers/create-project.ts'
import fs from 'fs-extra'
import type path from 'path'

// Mock fs-extra
vi.mock('fs-extra', () => ({
  default: {
    readdir: vi.fn().mockResolvedValue([]),
    statSync: vi.fn().mockReturnValue({ isDirectory: () => true }),
    ensureDir: vi.fn().mockResolvedValue(undefined),
    copy: vi.fn().mockResolvedValue(undefined),
    pathExists: vi.fn().mockResolvedValue(false),
    readJson: vi.fn().mockResolvedValue({}),
    writeJson: vi.fn().mockResolvedValue(undefined),
    writeFile: vi.fn().mockResolvedValue(undefined),
  },
}))

// Mock path
vi.mock('path', async importOriginal => {
  const actual = await importOriginal<typeof path>()
  return {
    ...actual,
    join: vi.fn((...args: string[]) => args.join('/')),
    basename: vi.fn((path: string) => path.split('/').pop() ?? ''),
    dirname: vi.fn((path: string) => path.split('/').slice(0, -1).join('/')),
  }
})

// Mock url
vi.mock('url', async _importOriginal => {
  return {
    fileURLToPath: vi.fn((_url: string | URL) => '/mock/path'),
  }
})

describe('Project Creation Utilities', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe('getAvailableTemplates', () => {
    it('should return available templates', async () => {
      const mockTemplates = ['default', 'minimal', 'full']
      vi.mocked(fs.readdir).mockResolvedValue(mockTemplates as unknown as never)
      vi.mocked(fs.statSync).mockReturnValue({
        isDirectory: () => true,
      } as fs.Stats)

      const templates = await getAvailableTemplates()

      expect(templates).toEqual(mockTemplates)
      expect(fs.readdir).toHaveBeenCalledWith(
        expect.stringContaining('templates')
      )
    })

    it('should filter out non-directory entries', async () => {
      const mockEntries = ['default', 'minimal', 'README.md']
      vi.mocked(fs.readdir).mockResolvedValue(mockEntries as unknown as never)
      vi.mocked(fs.statSync).mockImplementation(
        filepath =>
          ({
            isDirectory: () => !String(filepath).includes('README.md'),
          }) as fs.Stats
      )

      const templates = await getAvailableTemplates()

      expect(templates).toEqual(['default', 'minimal'])
    })

    it('should return default template if error occurs', async () => {
      vi.mocked(fs.readdir).mockRejectedValue(
        new Error('Cannot read directory')
      )

      const templates = await getAvailableTemplates()

      expect(templates).toEqual(['default'])
    })
  })

  describe('createProject', () => {
    const projectOptions = {
      projectPath: '/path/to/project',
      template: 'default',
      typescript: true,
      eslint: true,
    }

    it('should create project directory and copy template files', async () => {
      await createProject(projectOptions)

      expect(fs.ensureDir).toHaveBeenCalledWith(projectOptions.projectPath)
      expect(fs.copy).toHaveBeenCalledWith(
        expect.stringContaining('templates/default'),
        projectOptions.projectPath,
        expect.any(Object)
      )
    })

    it('should filter out TypeScript files when typescript is false', async () => {
      await createProject({ ...projectOptions, typescript: false })

      const copyOptions = vi.mocked(fs.copy).mock.calls[0]?.[2] ?? {}
      const filterFn = copyOptions.filter

      expect(filterFn).toBeDefined()
      if (filterFn) {
        expect(filterFn?.('/path/to/file.ts', '/path/to/file.ts')).toBe(false)
        expect(filterFn?.('/path/to/file.d.ts', '/path/to/file.d.ts')).toBe(
          true
        ) // Declaration files should be kept
        expect(filterFn?.('/path/to/file.js', '/path/to/file.js')).toBe(true)
      }
    })

    it('should filter out ESLint files when eslint is false', async () => {
      await createProject({ ...projectOptions, eslint: false })

      const copyOptions = vi.mocked(fs.copy).mock.calls[0]?.[2] ?? {}
      const filterFn = copyOptions.filter

      expect(filterFn).toBeDefined()
      if (filterFn) {
        expect(
          filterFn?.('/path/to/.eslintrc.js', '/path/to/.eslintrc.js')
        ).toBe(false)
        expect(
          filterFn?.(
            '/path/to/file.with.eslint.in.name.js',
            '/path/to/file.with.eslint.in.name.js'
          )
        ).toBe(false)
        expect(filterFn?.('/path/to/normal.js', '/path/to/normal.js')).toBe(
          true
        )
      }
    })

    it('should update package.json with project name if it exists', async () => {
      vi.mocked(fs.pathExists).mockImplementation(async path => {
        return path.toString().includes('package.json')
      })

      vi.mocked(fs.readJson).mockResolvedValue({ name: 'template-name' })

      await createProject(projectOptions)

      expect(fs.readJson).toHaveBeenCalledWith(
        expect.stringContaining('package.json')
      )
      expect(fs.writeJson).toHaveBeenCalledWith(
        expect.stringContaining('package.json'),
        { name: 'project' }, // basename of projectPath
        { spaces: 2 }
      )
    })

    it('should update dynemcp.config.json with project name if it exists', async () => {
      vi.mocked(fs.pathExists).mockImplementation(async path => {
        return path.toString().includes('dynemcp.config.json')
      })

      vi.mocked(fs.readJson).mockResolvedValue({ name: 'template-name' })

      await createProject(projectOptions)

      expect(fs.readJson).toHaveBeenCalledWith(
        expect.stringContaining('dynemcp.config.json')
      )
      expect(fs.writeJson).toHaveBeenCalledWith(
        expect.stringContaining('dynemcp.config.json'),
        { name: 'project' }, // basename of projectPath
        { spaces: 2 }
      )
    })

    it('should create a .gitignore file', async () => {
      await createProject(projectOptions)

      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('.gitignore'),
        expect.stringContaining('node_modules')
      )
    })
  })
})
