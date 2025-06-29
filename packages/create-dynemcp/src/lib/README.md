# DyneMCP `lib/` – Modular Architecture Overview

This directory contains the core modules of the `create-dynemcp` scaffolding tool, each designed for clarity, maintainability, and extensibility. Every submodule exposes a clean public API and is documented for professional use.

---

## Modules Summary

### 1. `cli/` – CLI Entrypoint & Orchestration

- **Purpose:** Implements the interactive CLI workflow for project scaffolding.
- **Responsibilities:** Handles user prompts, validation, template selection, and orchestrates project creation.
- **Public API:**
  - `run(): Promise<void>` – Starts the CLI, manages all user interaction and project setup.
- **Design:** Single-responsibility, modular, and extensible for new prompts or commands.

### 2. `project/` – Project Creation & Management

- **Purpose:** Provides all utilities and logic for project creation, validation, and dependency management.
- **Responsibilities:**
  - Project directory creation and validation
  - Template discovery and validation
  - File operations (copying, path resolution)
  - Package manager detection and dependency installation
- **Public API:**
  - `createProject(projectPath, projectName, template)`
  - `getAvailableTemplates()`
  - `validateProjectName(name)`
  - `installDependencies(projectPath)`
  - ...and more (see module README)
- **Design:** Modular, type-safe, and extensible for new templates or validation rules.

### 3. `template/` – Template Management

- **Purpose:** Manages project templates and their installation logic.
- **Responsibilities:**
  - Discovering available templates
  - Installing templates to target directories
  - Resolving template files and configuration
- **Public API:**
  - `installTemplate(args)`
  - `getTemplateFile(args)`
  - `getAvailableTemplates()`
  - `getTemplatesDir()`
- **Design:** Modular, single-responsibility, and type-safe for robust template operations.

---

## Design Principles

- **Separation of Concerns:** Each module has a clear, focused responsibility.
- **Extensibility:** Easy to add new templates, validation rules, or CLI features.
- **Type Safety:** All public APIs are strongly typed for robust TypeScript usage.
- **Professional Documentation:** Each module includes its own README with API and usage examples.

---

## Usage Example

```ts
import { run } from 'create-dynemcp/lib/cli'
import {
  createProject,
  getAvailableTemplates,
} from 'create-dynemcp/lib/project'
import { installTemplate } from 'create-dynemcp/lib/template'

// Start the CLI
run()

// Or use the modules programmatically
const templates = await getAvailableTemplates()
await createProject('./my-app', 'my-app', templates[0])
```

---

For detailed API and usage, see each module's README.
