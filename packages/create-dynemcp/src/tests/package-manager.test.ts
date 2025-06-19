import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  detectPackageManager,
  getInstallCommand,
  getRunCommand,
  installDependencies,
} from '../helpers/package-manager.ts'
import { execSync } from 'child_process'

// Mock child_process and execa
vi.mock('child_process', () => ({
  execSync: vi.fn(),
}))

vi.mock('execa', () => ({
  execa: vi.fn().mockResolvedValue({ exitCode: 0 }),
}))

describe('Package Manager Utilities', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe('detectPackageManager', () => {
    it('should detect pnpm if available', () => {
      vi.mocked(execSync).mockImplementation(cmd => {
        if (cmd === 'pnpm --version') {
          return Buffer.from('7.0.0')
        }
        throw new Error('Command not found')
      })

      expect(detectPackageManager()).toBe('pnpm')
    })

    it('should detect yarn if pnpm is not available', () => {
      vi.mocked(execSync).mockImplementation(cmd => {
        if (cmd === 'pnpm --version') {
          throw new Error('Command not found')
        }
        if (cmd === 'yarn --version') {
          return Buffer.from('1.22.0')
        }
        throw new Error('Command not found')
      })

      expect(detectPackageManager()).toBe('yarn')
    })

    it('should default to npm if neither pnpm nor yarn are available', () => {
      vi.mocked(execSync).mockImplementation(() => {
        throw new Error('Command not found')
      })

      expect(detectPackageManager()).toBe('npm')
    })
  })

  describe('getInstallCommand', () => {
    it('should return correct install command for npm', () => {
      expect(getInstallCommand('npm')).toBe('npm install')
    })

    it('should return correct install command for yarn', () => {
      expect(getInstallCommand('yarn')).toBe('yarn')
    })

    it('should return correct install command for pnpm', () => {
      expect(getInstallCommand('pnpm')).toBe('pnpm install')
    })

    it('should default to npm install for unknown package managers', () => {
      expect(getInstallCommand('unknown' as any)).toBe('npm install')
    })
  })

  describe('getRunCommand', () => {
    it('should return correct run command function for npm', () => {
      const runCommand = getRunCommand('npm')
      expect(runCommand('dev')).toBe('npm run dev')
      expect(runCommand('build')).toBe('npm run build')
    })

    it('should return correct run command function for yarn', () => {
      const runCommand = getRunCommand('yarn')
      expect(runCommand('dev')).toBe('yarn dev')
      expect(runCommand('build')).toBe('yarn build')
    })

    it('should return correct run command function for pnpm', () => {
      const runCommand = getRunCommand('pnpm')
      expect(runCommand('dev')).toBe('pnpm run dev')
      expect(runCommand('build')).toBe('pnpm run build')
    })

    it('should default to npm run for unknown package managers', () => {
      const runCommand = getRunCommand('unknown' as any)
      expect(runCommand('dev')).toBe('npm run dev')
    })
  })

  describe('installDependencies', () => {
    it('should call execa with correct arguments', async () => {
      const { execa } = await import('execa')

      await installDependencies('/path/to/project', 'pnpm')

      expect(execa).toHaveBeenCalledWith('pnpm', ['install'], {
        cwd: '/path/to/project',
        stdio: 'inherit',
      })
    })

    it('should throw an error if execa fails', async () => {
      const { execa } = await import('execa')
      vi.mocked(execa).mockRejectedValueOnce(new Error('Failed to install'))

      await expect(
        installDependencies('/path/to/project', 'pnpm')
      ).rejects.toThrow()
    })
  })
})
