# DyneMCP Framework

[![License: MIT with Attribution](https://img.shields.io/badge/License-MIT%20with%20Attribution-blue.svg)](LICENSE)
[![pnpm](https://img.shields.io/badge/pnpm-9.0.0-orange.svg)](https://pnpm.io/)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-blue.svg)](https://www.typescriptlang.org/)

Un framework escalable en TypeScript para construir servidores Model Context Protocol (MCP) utilizando el SDK oficial de MCP para TypeScript.

Este proyecto está organizado como un monorepo utilizando NX y pnpm workspaces para un desarrollo eficiente y una gestión óptima de paquetes.

## Características principales

- **Basado en SDK oficial**: Construido sobre el SDK oficial de TypeScript para MCP
- **Organización simplificada**: Fácil creación y organización de servidores MCP
- **Estandarización**: Forma estandarizada de exponer herramientas, recursos y prompts
- **Herramientas de desarrollo**: CLI para desarrollo, pruebas en vivo y despliegue
- **Optimizado para producción**: Servidores MCP listos para entornos de producción
- **Variables de entorno**: Soporte integrado para gestión de variables de entorno
- **Hot reloading**: Recarga en caliente durante el desarrollo
- **Desarrollo type-safe**: Validación de esquemas con Zod para mayor seguridad
- **Monorepo optimizado con NX**: Gestión eficiente de dependencias, paquetes y caché de compilación

## Instalación

```bash
# Usando npm
npm create dynemcp@latest

# Usando pnpm (recomendado)
pnpm create dynemcp@latest

# Usando yarn
yarn create dynemcp
```

Este comando inicia un generador interactivo que te guía a través de la creación de un servidor MCP a partir de una plantilla funcional.

## Building Your MCP Server

DyneMCP usa el paquete `dynebuild` para crear un bundle unificado y minificado para despliegue en producción. Cuando creas un nuevo proyecto con `pnpm create dynemcp`, un script de build se configura automáticamente para ti.

```bash
# Construir tu servidor MCP
pnpm run build
```

Esto creará un único archivo optimizado en `dist/server.js` que contiene todo tu código y dependencias, listo para despliegue.

## Project Structure

### Estructura del Monorepo

Este proyecto está organizado como un monorepo con NX y tiene la siguiente estructura:

```
monorepo-root/
│
├── packages/                 → Paquetes principales
│   ├── dynemcp/              → Framework principal DyneMCP
│   ├── dynemcp-types/        → Tipos de TypeScript
│   ├── dynemcp-tools/        → Herramientas comunes
│   ├── dynebuild/            → Utilidades de construcción
│   └── create-dynemcp/       → CLI para scaffolding de proyectos
│
├── configs/                  → Shared configurations
│   ├── eslint/               → ESLint configuration
│   ├── typescript/           → TypeScript configuration
│   └── prettier/             → Prettier configuration
│
├── examples/                 → Example projects
│   ├── basic-server/         → Simple MCP server with standard structure
│   └── custom-tools/         → Server with custom tools implementation
│
├── nx.json                   → NX configuration
├── pnpm-workspace.yaml       → pnpm workspace configuration
└── package.json              → Root package.json
```

### Estructura de Proyecto Individual

Cuando usas DyneMCP para crear un nuevo servidor MCP, el framework utiliza una estructura basada en convenciones:

```
project-root/
│
├── src/              → Código fuente principal
│   └── index.ts      → Punto de entrada del servidor
│
├── tools/            → Herramientas MCP (funciones ejecutables por IA)
│   └── tools.ts      → Archivo central para registrar herramientas
│
├── resources/        → Recursos estáticos o dinámicos
│   └── resource.ts   → Archivo central para registrar recursos
│
├── prompt/           → Prompts base o transformables
│   └── prompt.ts     → Registro central de prompts
│
├── scripts/          → Scripts de utilidad
│   └── build.js      → Script para construir el servidor usando dynebuild
│
├── dynemcp.config.json → Configuración del servidor MCP
├── package.json      → Dependencias y scripts
├── tsconfig.json     → Configuración de TypeScript
└── README.md         → Documentación del proyecto
```

## Construyendo Servidores DyneMCP

DyneMCP incluye un script de construcción que genera un servidor MCP listo para producción a partir de la estructura de tu proyecto. Cuando ejecutas el script de construcción, este:

1. Compila tu código TypeScript
2. Recopila todas las herramientas, recursos y prompts de sus respectivos directorios
3. Los empaqueta en un único archivo optimizado usando el paquete `dynebuild`
4. Crea un servidor que utiliza la funcionalidad principal de DyneMCP para ejecutar tu servidor MCP

### CLI de DyneMCP

El CLI `create-dynemcp` te permite crear rápidamente nuevos proyectos MCP con la estructura correcta y todas las dependencias necesarias. Ofrece las siguientes opciones:

```bash
Usage: create-dynemcp [options] [project-directory]

Create DyneMCP apps with one command

Arguments:
  project-directory  El directorio donde crear la aplicación

Options:
  -V, --version      Muestra la versión
  --template <n>     La plantilla a usar (default, minimal, full)
  --use-npm          Usar npm como gestor de paquetes
  --use-yarn         Usar yarn como gestor de paquetes
  --use-pnpm         Usar pnpm como gestor de paquetes (por defecto)
  --typescript       Inicializar como proyecto TypeScript
  --no-typescript    Inicializar como proyecto JavaScript
  --eslint           Incluir configuración de ESLint
  --no-eslint        Omitir configuración de ESLint
  --git              Inicializar repositorio git
  --no-git           Omitir inicialización de repositorio git
  -y, --yes          Omitir todas las preguntas y usar valores por defecto
  -h, --help         Mostrar ayuda
```

### Configuración

El proceso de construcción se configura a través del archivo `dynemcp.config.json`:

```json
{
  "name": "nombre-de-tu-proyecto",
  "version": "1.0.0",
  "description": "Descripción de tu proyecto",
  "tools": {
    "directory": "./tools"
  },
  "resources": {
    "directory": "./resources"
  },
  "prompts": {
    "directory": "./prompt"
  },
  "build": {
    "outDir": "./dist",
    "minify": true,
    "sourceMaps": false
  }
}
```

### Uso

Para construir tu servidor MCP:

### Construyendo para Producción

Para construir un servidor MCP listo para producción, ejecuta:

```bash
pnpm run build
```

Esto hará:

1. Compilar el código TypeScript a JavaScript
2. Empaquetar el servidor en un solo archivo usando el paquete `dynebuild`

El resultado será un archivo minificado y optimizado en `dist/server.js` que puedes desplegar en cualquier entorno Node.js.

### Cómo Funciona el Proceso de Construcción

Cada proyecto creado con DyneMCP incluye un script de construcción personalizado (`scripts/build.js`) que:

1. Lee la configuración de `dynemcp.config.json`
2. Detecta el punto de entrada (`src/index.ts` o `src/index.js`)
3. Utiliza el paquete `dynebuild` para crear un bundle unificado y minificado

El paquete `dynebuild` se incluye como dependencia en cada proyecto, asegurando que el proceso de construcción funcione correctamente sin dependencias externas.

### Construyendo Todos los Ejemplos

Para construir todos los ejemplos en el monorepo:

```bash
# Desde el directorio raíz
pnpm run build:examples
```

## Variables de Entorno

DyneMCP soporta variables de entorno de forma nativa, similar a Next.js:

```typescript
import { env } from 'dynemcp/env';

const token = env('OPENAI_API_KEY');
```

Automáticamente carga estos archivos:

- `.env`
- `.env.local`
- `.env.production` (dependiendo del modo de ejecución)

## Modo Desarrollo

Para desarrollo interactivo:

```bash
npx @modelcontextprotocol/inspector dev
```

Esto lanza un modo en vivo que simula cómo un modelo de IA consumiría el servidor MCP, facilitando la depuración y prueba de herramientas, recursos y prompts en tiempo real.

## Build Optimizado

El framework incluye un sistema de construcción listo para producción:

```bash
pnpm build
```

Esto crea:

- Un único archivo minificado para todas las herramientas
- Un único archivo para recursos
- Un único archivo para prompts
- Un archivo final del servidor que incluye todo el runtime

La salida está lista para despliegue en servidores tradicionales, plataformas serverless o funciones edge.

## Configuración

El archivo `dynemcp.config.json` define los parámetros del servidor:

```json
{
  "envPrefix": "MCP_",
  "optimize": true,
  "outputMode": "server",
  "port": 8080,
  "promptStyle": "chatml",
  "exposeMetadata": true
}
```

Opciones válidas para `outputMode` incluyen: `server`, `edge`, o `local`.
Opciones válidas para `promptStyle` incluyen: `chatml`, `plain`, o `custom`.

## Ejemplo de Uso

### Definiendo una Herramienta

```typescript
import { z } from 'zod';
import { createTool } from 'dynemcp/tools';

export const calculatorTool = createTool(
  'calculator',
  'Realiza operaciones aritméticas básicas',
  z.object({
    operation: z.enum(['add', 'subtract', 'multiply', 'divide']),
    a: z.number(),
    b: z.number(),
  }),
  async (params) => {
    switch (params.operation) {
      case 'add':
        return { result: params.a + params.b };
      case 'subtract':
        return { result: params.a - params.b };
      case 'multiply':
        return { result: params.a * params.b };
      case 'divide':
        if (params.b === 0) throw new Error('División por cero');
        return { result: params.a / params.b };
    }
  },
);

// Exportar todas las herramientas
export default [calculatorTool];
```

### Definiendo un Recurso

```typescript
import { createDynamicResource } from 'dynemcp/resources';

export const timeResource = createDynamicResource(
  'current-time',
  'Hora Actual',
  () => {
    const now = new Date();
    return JSON.stringify({
      time: now.toISOString(),
      timestamp: now.getTime(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
  },
  {
    description: 'Devuelve la hora actual del servidor',
    contentType: 'application/json',
  },
);

// Exportar todos los recursos
export default [timeResource];
```

### Definiendo un Prompt

```typescript
import { createSystemPrompt } from 'dynemcp/prompt';

export const assistantPrompt = createSystemPrompt(
  'assistant',
  'Prompt del Asistente',
  'Eres un asistente de IA útil. Responde a las preguntas con precisión y concisión.',
  {
    description: 'Prompt de sistema básico para asistente',
  },
);

// Exportar todos los prompts
export default [assistantPrompt];
```

## Flujo de Trabajo de Desarrollo

### Configuración

```bash
# Clonar el repositorio
git clone https://github.com/your-org/dynemcp-core.git
cd dynemcp-core

# Instalar dependencias
pnpm install
```

### Comandos Comunes

```bash
# Construir todos los paquetes
pnpm run build

# Ejecutar modo desarrollo con watch
pnpm run dev

# Ejecutar pruebas
pnpm run test

# Ejecutar linting
pnpm run lint

# Formatear código
pnpm run format

# Limpiar artefactos de build
pnpm run clean
```

### Usando Turborepo

Este proyecto utiliza Turborepo para gestionar el sistema de build. El pipeline está definido en `turbo.json` e incluye tareas para construcción, pruebas, linting y más.

## Contribuir

¡Damos la bienvenida a las contribuciones a DyneMCP! Así es cómo puedes contribuir:

1. Haz un fork del repositorio
2. Crea una rama de funcionalidad: `git checkout -b feature/mi-funcionalidad`
3. Realiza tus cambios
4. Ejecuta pruebas: `pnpm test`
5. Ejecuta linting: `pnpm lint`
6. Formatea el código: `pnpm format`
7. Haz commit de tus cambios: `git commit -m 'Añadir mi funcionalidad'`
8. Haz push a la rama: `git push origin feature/mi-funcionalidad`
9. Envía un pull request

## Integración con SDK

DyneMCP ha sido completamente refactorizado para usar el SDK oficial de TypeScript para MCP. Esta integración trae varios beneficios:

- **Implementación estandarizada**: Utiliza las interfaces y tipos oficiales del SDK
- **Preparado para el futuro**: Se beneficia automáticamente de las actualizaciones del SDK oficial

- **Arquitectura simplificada**: Elimina implementaciones de servidor personalizadas en favor del SDK oficial
- **Mayor seguridad de tipos**: Aprovecha TypeScript y Zod para una completa seguridad de tipos

### Migración desde Implementación Anterior

Si estás actualizando desde una versión anterior de DyneMCP que usaba la implementación de servidor personalizada, estos son los cambios clave:

1. La clase `MCPServer` de `core/server.ts` ha sido reemplazada por `DyneMCP` de `core/dynemcp.ts`
2. Las herramientas, recursos y prompts ahora usan adaptadores para asegurar la compatibilidad con el SDK
3. Los manejadores de eventos ahora son gestionados por el SDK en lugar de emisores de eventos personalizados

### Ejemplo de Uso del SDK

```typescript
import { createMCPServer } from 'dynemcp';
import { z } from 'zod';

// Crear un servidor
const server = createMCPServer('mi-servidor', '1.0.0');

// Registrar una herramienta
server.registerTool({
  name: 'hola',
  description: 'Saluda a alguien',
  parameters: {
    type: 'object',
    properties: {
      nombre: { type: 'string' },
    },
    required: ['nombre'],
  },
  handler: async ({ nombre }) => {
    return { mensaje: `¡Hola, ${nombre}!` };
  },
});

// Iniciar el servidor
server.start();
```

## Licencia

Este proyecto está licenciado bajo la [Licencia MIT con Atribución](LICENSE). Esto significa que puedes usar, modificar y distribuir este software libremente, pero debes incluir el siguiente texto de agradecimiento en tu documentación:

> Este proyecto utiliza DyneMCP Framework creado por David Nazareno.

Para más detalles, consulta el archivo [LICENSE](LICENSE).
