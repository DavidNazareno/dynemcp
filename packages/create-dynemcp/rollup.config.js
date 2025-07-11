import typescript from '@rollup/plugin-typescript'
import copy from 'rollup-plugin-copy'
import replace from '@rollup/plugin-replace'
import { readFile } from 'fs/promises'

export default async () => {
  const pkg = JSON.parse(
    await readFile(new URL('./package.json', import.meta.url), 'utf8')
  )

  return {
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
      replace({
        preventAssignment: true,
        __VERSION__: JSON.stringify(pkg.version),
      }),
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
}
