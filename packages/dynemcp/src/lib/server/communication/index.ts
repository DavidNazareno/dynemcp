// Exports centralizados del módulo communication

export * from './core/interfaces.js'
export * from './core/errors.js'
export * from './core/defaults.js'
export * from './core/schemas.js'
export { createTransport, TRANSPORT_TYPES } from './core/factory.js'

// Transports principales
export * from './http/server.js'
export * from './stdio/server.js'
// Futuro: export * from './http/client.js';
// Futuro: export * from './stdio/client.js';
// Futuro: export * from './http/sse-legacy.js';
