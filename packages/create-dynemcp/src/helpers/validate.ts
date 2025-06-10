import validateNpmPackageName from 'validate-npm-package-name'
import path from 'path'
import fs from 'fs-extra'
import chalk from 'chalk'

export function validateProjectName(name: string): {
  valid: boolean
  problems?: string[]
} {
  const validation = validateNpmPackageName(name)

  if (validation.validForNewPackages) {
    return { valid: true }
  }

  const problems = [
    ...(validation.errors || []),
    ...(validation.warnings || []),
  ]

  return {
    valid: false,
    problems,
  }
}

export function validateProjectPath(projectPath: string): {
  valid: boolean
  message?: string
} {
  // Check if directory exists and is not empty
  if (fs.existsSync(projectPath)) {
    const files = fs.readdirSync(projectPath)
    if (files.length > 0) {
      return {
        valid: false,
        message: `The directory ${chalk.green(projectPath)} already exists and is not empty.`,
      }
    }
  }

  return { valid: true }
}

export function validateTemplate(
  template: string,
  availableTemplates: string[]
): { valid: boolean; message?: string } {
  if (!availableTemplates.includes(template)) {
    return {
      valid: false,
      message: `Template ${chalk.red(template)} not found. Available templates: ${availableTemplates.map(t => chalk.green(t)).join(', ')}`,
    }
  }

  return { valid: true }
}
