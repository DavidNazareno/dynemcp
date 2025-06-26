module.exports = {
  extends: ['../../eslint.config.js'],
  rules: {
    '@nx/dependency-checks': [
      'error',
      {
        ignoredDependencies: ['esbuild'],
      },
    ],
  },
}
