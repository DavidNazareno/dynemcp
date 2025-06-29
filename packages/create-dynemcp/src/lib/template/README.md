# DyneMCP Template Module

This module provides the core utilities and public API for managing and installing project templates in the `create-dynemcp` scaffolding tool.  
It is the single source of truth for all template-related logic, ensuring a modular and extensible architecture for project generation.

---

## **Public API**

### Template Management

- **`installTemplate(args: InstallTemplateArgs): Promise<void>`**  
  Installs a DyneMCP internal template to a given directory, copying files, configuring scripts, and installing dependencies as needed.

- **`getTemplateFile(args: GetTemplateFileArgs): string`**  
  Returns the absolute path to a specific file within a template directory.

- **`getAvailableTemplates(): Promise<string[]>`**  
  Returns a list of available project templates that can be used for scaffolding new projects.

- **`getTemplatesDir(): string`**  
  Returns the absolute path to the templates directory.

- **`InstallTemplateArgs`, `GetTemplateFileArgs`**  
  Type definitions for the arguments required by the above functions.

---

## **Design Principles**

- **Modular:** All logic is split into `core/` for implementation and `index.ts` for public API exposure.
- **Extensible:** Easy to add new templates or extend template installation logic.
- **Single Responsibility:** Each function and file has a clear, focused purpose.
- **Type-Safe:** All public APIs are strongly typed for robust usage in TypeScript projects.

---

## **Usage Example**

```ts
import {
  installTemplate,
  getTemplateFile,
  getAvailableTemplates,
  getTemplatesDir,
} from 'create-dynemcp/lib/template'

// List available templates
const templates = await getAvailableTemplates()

// Get the path to the templates directory
const templatesDir = getTemplatesDir()

// Get the path to a template file
const configPath = getTemplateFile({
  template: 'default',
  file: 'dynemcp.config.json',
})

// Install a template
await installTemplate({
  appName: 'my-app',
  root: './my-app',
  packageManager: 'pnpm',
  template: 'default',
  mode: 'ts',
  tailwind: false,
  eslint: true,
  srcDir: true,
  importAlias: '@/*',
  skipInstall: false,
})
```
