export default {
  '**/*.{js,jsx,ts,tsx}': ['pnpm run format', 'pnpm run eslint:fix'],
  '**/*.{md,json}': ['pnpm run format'],
}
