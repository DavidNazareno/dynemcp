# DyneMCP

**DyneMCP** is a modern, modular framework for building, running, and managing Model Context Protocol (MCP) servers and tools. It provides a unified CLI, a robust build system, and a highly extensible server runtime—all designed for zero-config, production-ready workflows.

---

## Features

- **Unified CLI**: One command-line tool for development, build, analysis, and server management.
- **Modular Build System**: Type-safe, zero-config, and production-focused. Supports build, watch, clean, analyze, and CLI tool bundling.
- **Extensible Server Runtime**: Fast, robust, and ready for custom tools, resources, and prompts.
- **Professional Project Structure**: Each concern (build, server, config, CLI) is isolated and documented.
- **Best Practices**: Minimal public API, async/await everywhere, and clear separation of concerns.

---

## Directory Structure

```
dynemcp/
  src/
    cli/           # CLI logic (modular, yargs-based)
    build/         # Build system (main, config, bundler, bin)
    server/        # Server runtime (main, api, registry, config, communication)
    global/        # Shared global config/constants
    shared/        # (Optional) Shared utilities
  package.json
  README.md        # (You are here)
```

---

## Main Modules

### 1. CLI (`src/cli/`)

- Unified entrypoint for all developer commands: `dev`, `build`, `start`, `clean`, `analyze`.
- Modular, type-safe, and easy to extend.
- See [`src/cli/README.md`](./src/cli/README.md) for details.

### 2. Build System (`src/build/`)

- Handles all build, watch, clean, analyze, and CLI bundling tasks.
- Zero-config: always uses a default, production-ready config.
- See [`src/build/README.md`](./src/build/README.md) for details.

### 3. Server (`src/server/`)

- The DyneMCP server runtime: fast, extensible, and robust.
- Supports custom tools, resources, and prompts.
- See [`src/server/README.md`](./src/server/README.md) for details.

### 4. Global Config (`src/global/config-all-contants.ts`)

- Centralized, minimal set of constants and helpers shared across modules.

---

## Usage

### Install

```sh
npm install dynemcp
# or
yarn add dynemcp
# or
pnpm add dynemcp
```

### CLI Examples

```sh
# Start dev server
dynemcp dev

# Start dev server with Inspector
dynemcp dev inspector

# Build for production
dynemcp build --clean

# Start production server
dynemcp start

# Clean build directory
dynemcp clean

# Analyze dependencies
dynemcp analyze
```

---

## Extending DyneMCP

- Add new CLI commands in `src/cli/core/cli.ts`.
- Add new build tasks in `src/build/main/core/`.
- Add new server features in `src/server/main/core/`.
- Use the global config for shared constants only.
- Keep all implementation logic in `core/` folders; only re-export from `index.ts`.

---

## Best Practices

- Expose only the minimal public API at the top level.
- Use async/await for all I/O and process management.
- Keep command handlers and entrypoints minimal; delegate logic to helpers or submodules.
- Document new commands, options, and modules in their respective READMEs.

---

## Security Best Practices

- Always use JWT authentication in production.
- **Set the `expectedAudience` option in your JWT middleware** to ensure only tokens intended for your DyneMCP server are accepted. This prevents token passthrough and confused deputy attacks.
- Example:

```ts
app.use(jwtAuthMiddleware({
  allowedRoles: ['admin'],
  expectedAudience: 'my-mcp-server',
}))
```

- If `expectedAudience` is not set in production, a warning will be printed.

---

## Seguridad: Check Automático de Variables de Entorno Críticas

DyneMCP incluye un **check automático de variables de entorno críticas** al arrancar el servidor. Si alguna variable esencial falta o es insegura, el servidor no arranca y muestra un error claro. Esto te protege contra despliegues inseguros por error humano, algo que la mayoría de frameworks (incluyendo Next.js y Astro) no hacen por defecto.

### Variables chequeadas:
- `JWT_SECRET`: Debe estar definida, no ser `changeme` y tener al menos 32 caracteres.
- `NODE_ENV`: Debe ser `production` en producción.
- `EXPECTED_AUDIENCE`: (si se usa) Debe estar definida y no ser un valor genérico como `changeme`, `test`, `default` o vacío.
- Claves de API externas (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`): Si faltan, se muestra un warning pero no se detiene el arranque.

### ¿Qué ocurre si falta alguna?
- Si falta o es insegura una variable crítica, el proceso falla inmediatamente y muestra un error explicativo.
- Si falta una clave de API externa, solo se muestra un warning.

### ¿Por qué es importante?
- Evita que tu servidor arranque en modo inseguro por accidente.
- Te diferencia de otros frameworks y plantillas populares.
- Es una defensa extra para tus usuarios y para ti mismo.

---

## License

MIT
