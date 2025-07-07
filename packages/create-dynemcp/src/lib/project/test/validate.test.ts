vi.mock('fs-extra', () => ({
  default: {
    existsSync: vi.fn(),
    readdirSync: vi.fn(),
  },
}))
vi.mock('chalk', () => ({
  default: { green: (s: string) => s, red: (s: string) => s },
  green: (s: string) => s,
  red: (s: string) => s,
}))

import { describe, it, expect, beforeEach } from 'vitest'
import fsDefault from 'fs-extra'
import {
  validateProjectName,
  validateProjectPath,
  validateTemplate,
} from '../core/validate'

const fs = fsDefault as any

describe('validate', () => {
  beforeEach(() => {
    fs.existsSync.mockReset()
    fs.readdirSync.mockReset()
  })

  describe('validateProjectName', () => {
    it('returns valid for a normal name', () => {
      expect(validateProjectName('my-app').valid).toBe(true)
    })
    it('returns invalid for empty name', () => {
      expect(validateProjectName('').valid).toBe(false)
    })
    it('returns invalid for too long name', () => {
      expect(validateProjectName('a'.repeat(215)).valid).toBe(false)
    })
    it('returns invalid for invalid characters', () => {
      expect(validateProjectName('my/app').valid).toBe(false)
    })
    it('returns invalid for reserved names', () => {
      expect(validateProjectName('node_modules').valid).toBe(false)
    })
  })

  describe('validateProjectPath', () => {
    it('returns valid for non-existing or empty directory', () => {
      fs.existsSync.mockReturnValue(false)
      expect(validateProjectPath('/tmp/empty')).toEqual({ valid: true })
    })
    it('returns invalid for non-empty directory', () => {
      fs.existsSync.mockReturnValue(true)
      fs.readdirSync.mockReturnValue(['file'])
      expect(validateProjectPath('/tmp/full')).toEqual({
        valid: false,
        message: expect.any(String),
      })
    })
  })

  describe('validateTemplate', () => {
    it('returns valid for available template', () => {
      expect(validateTemplate('default', ['default', 'other'])).toEqual({
        valid: true,
      })
    })
    it('returns invalid for unavailable template', () => {
      expect(validateTemplate('foo', ['default', 'other'])).toEqual({
        valid: false,
        message: expect.any(String),
      })
    })
  })
})
