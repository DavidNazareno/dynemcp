# DyneMCP CLI Module

This module provides the main entrypoint and logic for the `create-dynemcp` CLI.  
It exposes the interactive project scaffolding workflow, including prompts, validation, and project generation.

---

## **Public API**

- **`run(): Promise<void>`**  
  Main entrypoint for the CLI. Handles all user interaction, prompts, validation, and project creation logic.

---

## **Design Principles**

- **Single Responsibility:** The CLI module is responsible only for user interaction and orchestration of project creation.
- **Modular:** All CLI logic is implemented in `core/cli.ts` and only the public API is exposed.
- **Extensible:** Easy to add new prompts, options, or commands in the future.

---

## **Usage Example**

```ts
import { run } from 'create-dynemcp/lib/cli'

// Start the interactive CLI
run()
```

---

## **Typical Workflow**

1. Prompt the user for project name and template.
2. Validate the project name and directory.
3. Scaffold the project using the selected template.
4. Install dependencies (unless skipped).
5. Print next steps and documentation links.
