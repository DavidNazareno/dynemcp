import typescript from '@rollup/plugin-typescript'
import copy from 'rollup-plugin-copy'

// Common external dependencies for both bundles
const commonExternals = [
  'fs',
  'path',
  'os',
  'chalk',
  'yargs',
  'yargs/helpers',
  'express',
  'cors',
  'zod',
  'esbuild',
  'tslib',
  'tsx',
  'fs-extra',
  '@modelcontextprotocol/sdk/server/mcp.js',
  '@modelcontextprotocol/sdk/server/stdio.js',
  '@modelcontextprotocol/sdk/server/streamableHttp.js',
  'crypto',
  'express-rate-limit',
  'child_process',
  'url',
  'express-oauth2-jwt-bearer',
  'jsonwebtoken',
]

export default [
  // Bundle for the main library
  {
    input: 'src/lib/index.ts',
    output: [
      {
        dir: 'dist/lib',
        format: 'esm',
        sourcemap: true,
        entryFileNames: '[name].js',
      },
      {
        dir: 'dist/lib/cjs',
        format: 'cjs',
        sourcemap: true,
        entryFileNames: '[name].js',
      },
    ],
    plugins: [
      typescript({ tsconfig: './tsconfig.rollup.json' }),
      copy({
        targets: [{ src: 'package.json', dest: 'dist' }],
      }),
    ],
    external: commonExternals,
  },
  // Bundle for the CLI binary (CommonJS)
  {
    input: 'src/bin.ts',
    output: {
      file: 'dist/cli.cjs',
      format: 'cjs',
      banner: '#!/usr/bin/env node',
      sourcemap: true,
      inlineDynamicImports: true,
    },
    plugins: [typescript({ tsconfig: './tsconfig.rollup.json' })],
    external: commonExternals,
    // Silence all warnings
    onwarn() {},
  },
]
