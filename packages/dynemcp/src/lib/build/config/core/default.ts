// default.ts
// Default build configuration for DyneMCP projects (zero-config, production-ready)
// ------------------------------------------------------------------------------
//
// - Provides the default, production-optimized build configuration for DyneMCP projects.
// - Users must not modify this file; all builds are zero-config and locked for safety.
// - For advanced customization, contact framework maintainers.

/**
 * DyneMCP build system configuration.
 *
 * ⚠️ DO NOT MODIFY: This file is part of the framework and must not be edited by end users.
 * The build is 100% preconfigured for optimal and secure operation.
 * For advanced customization, contact the framework maintainers.
 */
export const DEFAULT_BUILD_CONFIG = {
  entryPoint: './src/index.ts',
  outDir: './dist',
  outFile: 'server.js',
  format: 'esm', // 'esm' or 'cjs' depending on the supported runtime
  minify: true, // true for production, false for debug
  sourcemap: false, // true for debug, false for production
  bundle: true,
  external: [
    '@modelcontextprotocol/sdk',
    'express',
    'cors',
    'jsonwebtoken',
    'zod',
    'zod-to-json-schema',
    'chalk',
    'esbuild',
    'express-rate-limit',
    'tslib',
    'yargs',
    '@dynemcp/dynemcp',
  ],
  define: {},
  platform: 'node',
  target: 'node18',
  treeShaking: true,
  splitting: false,
  metafile: false,
  watch: true,
}
