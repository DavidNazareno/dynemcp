// utils.ts
// Utilidades compartidas para el bundler

export function shouldLog() {
  return process.env.BUILD_LOGS === '1' || process.env.NODE_ENV !== 'production'
}
