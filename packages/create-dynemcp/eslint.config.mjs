import { config as baseConfig } from '@repo/eslint-config/react-internal'
import tseslint from 'typescript-eslint'

/** @type {import("eslint").Linter.Config[]} */
export const config = [
  ...baseConfig,
  {
    files: ['*.test.ts'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.test.json',
        tsconfigRootDir: '.',
      },
    },
  },
]

export default config
