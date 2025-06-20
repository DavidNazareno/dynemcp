import fs from 'fs-extra';
import chalk from 'chalk';

export interface ValidationResult {
  valid: boolean;
  problems?: string[];
}

export function validateProjectName(name: string): ValidationResult {
  const problems: string[] = [];

  if (!name || name.trim().length === 0) {
    problems.push('Project name cannot be empty');
  }

  if (name.length > 214) {
    problems.push('Project name cannot be longer than 214 characters');
  }

  // Check for invalid characters
  const invalidChars = /[<>:"/\\|?*\x00-\x1f]/;
  if (invalidChars.test(name)) {
    problems.push('Project name contains invalid characters');
  }

  // Check for reserved names
  const reservedNames = [
    'node_modules',
    'package.json',
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml',
    '.git',
    '.gitignore',
    '.env',
    '.env.local',
    '.env.development',
    '.env.test',
    '.env.production',
  ];

  if (reservedNames.includes(name.toLowerCase())) {
    problems.push(`Project name cannot be "${name}" (reserved name)`);
  }

  return {
    valid: problems.length === 0,
    problems: problems.length > 0 ? problems : undefined,
  };
}

export function validateProjectPath(projectPath: string): {
  valid: boolean;
  message?: string;
} {
  // Check if directory exists and is not empty
  if (fs.existsSync(projectPath)) {
    const files = fs.readdirSync(projectPath);
    if (files.length > 0) {
      return {
        valid: false,
        message: `The directory ${chalk.green(projectPath)} already exists and is not empty.`,
      };
    }
  }

  return { valid: true };
}

export function validateTemplate(
  template: string,
  availableTemplates: string[],
): { valid: boolean; message?: string } {
  if (!availableTemplates.includes(template)) {
    return {
      valid: false,
      message: `Template ${chalk.red(template)} not found. Available templates: ${availableTemplates
        .map((t) => chalk.green(t))
        .join(', ')}`,
    };
  }

  return { valid: true };
}
