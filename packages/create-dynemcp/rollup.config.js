import typescript from '@rollup/plugin-typescript'

export default {
  input: 'src/index.ts',
  output: [
    {
      dir: 'dist',
      format: 'esm',
      sourcemap: true,
      entryFileNames: '[name].js',
    },
    {
      dir: 'dist/cjs',
      format: 'cjs',
      sourcemap: true,
      entryFileNames: '[name].js',
    },
  ],
  plugins: [typescript({ tsconfig: './tsconfig.rollup.json' })],
  external: [
    'fs',
    'path',
    'os',
    'chalk',
    'commander',
    'inquirer',
    'ora',
    'execa',
    'fast-glob',
    'fs-extra',
    'async-sema',
    'url',
    'fs/promises',
  ],
}
