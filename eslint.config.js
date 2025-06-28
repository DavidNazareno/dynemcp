import { FlatCompat } from '@eslint/eslintrc'
import js from '@eslint/js'
import path from 'path'
import { fileURLToPath } from 'url'
import nxPlugin from '@nx/eslint-plugin'
import jsoncEslintParser from 'jsonc-eslint-parser'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
})

export default [
  {
    ignores: [
      '**/vite.config.*.timestamp*',
      '**/vitest.config.*.timestamp*',
      '**/test-output',
      '**/dist',
      '**/.astro',
      './packages/create-dynemcp/package.json',
      './packages/dynemcp/package.json',
    ],
  },
  ...compat.extends('plugin:@nx/typescript', 'plugin:prettier/recommended'),
  ...compat.extends('plugin:@nx/javascript', 'plugin:prettier/recommended'),
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    plugins: {
      '@nx': nxPlugin,
    },
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: [],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],
    },
  },
  {
    files: ['packages/**/*.json'],
    plugins: {
      '@nx': nxPlugin,
    },
    languageOptions: {
      parser: jsoncEslintParser,
    },
    rules: {
      '@nx/dependency-checks': [
        'error',
        {
          ignoredFiles: [
            '{projectRoot}/eslint.config.{js,cjs,mjs,ts,cts,mts}',
            '{projectRoot}/vite.config.{js,ts,mjs,mts}',
          ],
        },
      ],
    },
  },
]
