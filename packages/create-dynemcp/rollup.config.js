import typescript from '@rollup/plugin-typescript'
import copy from 'rollup-plugin-copy'

export default {
  input: {
    index: 'src/index.ts',
    bin: 'src/bin.ts',
  },
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
  plugins: [
    typescript({ tsconfig: './tsconfig.rollup.json' }),
    copy({
      targets: [
        { src: 'src/lib/template/templates', dest: 'dist' },
        { src: 'package.json', dest: 'dist' },
      ],
    }),
  ],
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
