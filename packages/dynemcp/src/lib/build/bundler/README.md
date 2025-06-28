# DyneMCP Bundler Module

The `bundler` module provides the core logic for compiling, optimizing, and analyzing DyneMCP projects. It is designed for modularity, extensibility, and best practices, following the same architecture as the main server and build modules.

## Architecture Overview

The bundler module is composed of several focused core submodules:

- **core/bundle.ts**: Main entrypoints for bundling, watch mode, CLI builds, and cleaning the build directory.
- **core/analyzer.ts**: Dependency analysis logic and reporting.
- **core/manifest.ts**: Manifest and HTML report generation from esbuild metafiles.
- **core/optimizer.ts**: Bundle optimization and statistics helpers.

## Key Features

- **Production-ready bundling**: Uses esbuild for fast, reliable, and minified builds.
- **Dependency analysis**: Generates detailed reports on dependencies, modules, and bundle size.
- **Manifest and reporting**: Produces machine-readable and human-friendly build reports.
- **Extensible**: Each concern is isolated and can be extended or replaced as needed.

## High-Level Usage Example

```ts
import {
  bundle,
  bundleWatch,
  bundleCli,
  cleanBuildDir,
} from '@dynemcp/dynemcp/build/bundler'

const result = await bundle({
  entryPoint: './src/index.ts',
  outDir: './dist',
  outFile: 'server.js',
  bundle: true,
  minify: true,
  // ...other options
})
```

## Core Submodules

- See each core submodule for detailed usage and API:
  - [`core/bundle.ts`](./core/bundle.ts)
  - [`core/analyzer.ts`](./core/analyzer.ts)
  - [`core/manifest.ts`](./core/manifest.ts)
  - [`core/optimizer.ts`](./core/optimizer.ts)

## Best Practices

- Use the main helpers for all build and analysis workflows.
- Organize your build scripts for clarity and maintainability.
- Extend the core helpers for advanced use cases or custom optimizations.

## License

MIT
