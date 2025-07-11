# DyneMCP Monorepo

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![Nx](https://img.shields.io/badge/Nx-21.2-orange.svg)](https://nx.dev/)
[![GitHub Sponsors](https://img.shields.io/github/sponsors/DavidNazareno?color=db61a2&label=Sponsor&logo=github&style=flat-square)](https://github.com/sponsors/DavidNazareno)

> A modern, modular framework and ecosystem for building Model Context Protocol (MCP) servers, tools, and agents.

---

## Packages

### [`@dynemcp/dynemcp`](./packages/dynemcp)

- **Core framework** for building, running, and managing MCP servers and tools.
- Unified CLI, robust build system, and extensible server runtime.
- Security-first, production-ready, and fully MCP protocol compliant.
- Modular architecture: CLI, build system, server runtime, config, and utilities.
- See [`packages/dynemcp/README.md`](./packages/dynemcp/README.md) for details.

### [`@dynemcp/create-dynemcp`](./packages/create-dynemcp)

- **Official project generator** for DyneMCP.
- Interactive CLI to scaffold new MCP servers with best practices and modern tooling.
- Multiple templates: default, calculator, HTTP server, secure agent, dynamic agent.
- Zero-config, TypeScript, ESBuild, hot reload, and security features included.
- See [`packages/create-dynemcp/README.md`](./packages/create-dynemcp/README.md) for template details and usage.

### [`dynemcp-docs`](./apps/dynemcp-docs)

- Documentation site for DyneMCP, built with Astro + Starlight.
- Contains guides, API docs, and usage examples.
- Source: [`apps/dynemcp-docs/`](./apps/dynemcp-docs/)

---

## Quickstart

### Install dependencies

```bash
pnpm install
```

### Build all packages

```bash
pnpm build
```

### Run tests

```bash
pnpm test
```

### Start development mode (watch)

```bash
pnpm dev
```

### Generate a new MCP project

```bash
# Interactive mode
pnpm dlx @dynemcp/create-dynemcp my-agent

# With a specific template
pnpm dlx @dynemcp/create-dynemcp my-server --template http-server
```

---

## Monorepo Structure

```
dynemcp/
├── packages/
│   ├── dynemcp/              # Core framework
│   └── create-dynemcp/       # Project generator CLI & templates
├── apps/
│   └── dynemcp-docs/         # Documentation site (Astro + Starlight)
├── scripts/                  # Automation scripts
├── docs/                     # Additional documentation
└── ...                       # Nx, config, etc.
```

---

## Contributing

1. Fork the repo and create a feature branch.
2. Make your changes and add tests as needed.
3. Run `pnpm lint` and `pnpm test` to ensure code quality.
4. Open a Pull Request with a clear description.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for more details.

---

## Technologies

- **TypeScript 5.8+**
- **Nx 21.2** (monorepo management)
- **ESBuild** (bundling)
- **Vitest** (testing)
- **ESLint + Prettier** (code quality)
- **pnpm** (package management)
- **Astro + Starlight** (documentation)

---

## 🤝 Support the Project

If DyneMCP has been helpful to you, please consider supporting its development so I can keep advancing the project!

[![GitHub Sponsors](https://img.shields.io/github/sponsors/DavidNazareno?color=db61a2&label=Sponsor&logo=github&style=flat-square)](https://github.com/sponsors/DavidNazareno)

Your support helps maintain and improve the framework for the entire MCP community.

---

## License

MIT — see [LICENSE](./LICENSE) for details.

---

**Useful Links:**

- [Official Documentation](https://dynemcp.pages.dev/guides/getting-started/)
- [MCP Protocol Documentation](https://modelcontextprotocol.io/)
- [Project Documentation](./apps/dynemcp-docs/)
- [Issues & Feature Requests](https://github.com/dynemcp/dynemcp/issues)
- [Discussions](https://github.com/dynemcp/dynemcp/discussions)
