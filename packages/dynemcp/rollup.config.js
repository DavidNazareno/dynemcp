import typescript from '@rollup/plugin-typescript'
import copy from 'rollup-plugin-copy'

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
    external: [
      'fs',
      'path',
      'os',
      'chalk',
      'yargs',
      'express',
      'cors',
      'zod',
      'esbuild',
      'tslib',
      'tsx',
    ],
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
    external: [
      'fs',
      'path',
      'os',
      'chalk',
      'yargs',
      'express',
      'cors',
      'zod',
      'esbuild',
      'tslib',
      'tsx',
    ],
  },
]
