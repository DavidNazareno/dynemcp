# Communication Module

Este módulo centraliza toda la lógica de comunicación y protocolos de DyneMCP, siguiendo estrictamente el SDK MCP y las mejores prácticas de arquitectura profesional.

## Estructura

```
communication/
  core/
    interfaces.ts      # Contratos base: Transport, JSONRPCMessage, etc.
    types.ts           # Tipos y enums auxiliares
    errors.ts          # Errores personalizados
    defaults.ts        # Valores por defecto
    schemas.ts         # Validaciones Zod
    factory.ts         # Fábrica de transports
  http/
    server.ts          # Implementación Streamable HTTP server
    client.ts          # (futuro) HTTP client
    sse-legacy.ts      # (opcional) SSE legacy
  stdio/
    server.ts          # STDIO server
    client.ts          # (futuro) STDIO client
  utils.ts             # Utilidades comunes (futuro)
  index.ts             # Exports centralizados
```

## Filosofía

- **Fidelidad al SDK:** Todas las implementaciones siguen el contrato y los formatos del SDK MCP.
- **Modularidad:** Cada protocolo y utilidad está en su propio archivo/carpeta.
- **Extensibilidad:** Es fácil agregar nuevos protocolos (WebSocket, gRPC, etc.) en el futuro.
- **Seguridad:** Incluye recomendaciones de seguridad del SDK (validación de origen, TLS, etc.).
- **Tipado fuerte:** TypeScript y Zod para robustez y mantenibilidad.

## Implementaciones actuales

- **STDIO:** Comunicación por streams estándar (ideal para CLI y procesos locales).
- **Streamable HTTP:** Comunicación HTTP con soporte para SSE y sesiones.
- **SSE Legacy:** (opcional) Para compatibilidad con versiones anteriores.

## Extensión

Puedes agregar nuevos transports implementando la interfaz `Transport` y registrándolos en la fábrica.

## Ejemplo de uso

```typescript
import { createTransport, TRANSPORT_TYPES } from './communication/core/factory'

const transport = createTransport({
  type: TRANSPORT_TYPES.HTTP_SERVER,
  options: {
    /* ... */
  },
})
```

---

Para detalles de cada implementación, revisa los README y comentarios en cada subcarpeta.
