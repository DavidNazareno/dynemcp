# DyneMCP Project Module

This module provides all the core utilities, helpers, and public API for project creation, validation, and management in the `create-dynemcp` scaffolding tool.  
It is designed to be the single source of truth for all project-related logic, ensuring a clean, modular, and extensible architecture.

---

## **Public API**

### Project Creation

- **`createProject(projectPath: string, projectName: string, template: string): Promise<void>`**  
  Creates a new DyneMCP project in the specified directory using the given template and project name. Handles directory creation, template copying, and initial configuration.

- **`getAvailableTemplates(): Promise<string[]>`**  
  Returns a list of available project templates that can be used for scaffolding new projects.

---

### Project Validation

- **`validateProjectName(name: string): ValidationResult`**  
  Validates a project name according to naming rules and reserved names.

- **`validateProjectPath(projectPath: string): { valid: boolean, message?: string }`**  
  Checks if a project directory exists and is empty.

- **`validateTemplate(template: string, availableTemplates: string[]): { valid: boolean, message?: string }`**  
  Validates if a given template name is available.

- **`ValidationResult`**  
  Type describing the result of a project name validation.

---

### File and Path Utilities

- **`getTemplatesDir(): string`**  
  Returns the absolute path to the templates directory.

- **`copy(source: string | string[], destination: string, options?: CopyOptions): Promise<void>`**  
  Copies files or directories from the source to the destination, supporting glob patterns and custom renaming.

---

### Package and Dependency Management

- **`getPkgManager(): PackageManager`**  
  Returns the preferred package manager for the project (e.g., pnpm).

- **`getInstallCommand(packageManager: PackageManager): string`**  
  Returns the install command for the given package manager.

- **`getRunCommand(packageManager: PackageManager): (script: string) => string`**  
  Returns a function to generate run commands for scripts with the given package manager.

- **`installDependencies(projectPath: string): Promise<void>`**  
  Installs dependencies in the specified project directory using the preferred package manager.

---

## **Design Principles**

- **Modular:** All logic is split into `core/` for implementation and `index.ts` for public API exposure.
- **Extensible:** Easy to add new project templates, validation rules, or package manager support.
- **Single Responsibility:** Each function and file has a clear, focused purpose.
- **Type-Safe:** All public APIs are strongly typed for robust usage in TypeScript projects.

---

## **Usage Example**

```ts
import {
  createProject,
  validateProjectName,
  getAvailableTemplates,
} from 'create-dynemcp/lib/project'

// Validate a project name
const { valid, problems } = validateProjectName('my-new-project')

// List available templates
const templates = await getAvailableTemplates()

// Create a new project
await createProject('./my-new-project', 'my-new-project', 'default')
```
