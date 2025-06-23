# DyneMCP - Framework de Protocolo de Contexto de Modelo (MCP)

[![Licencia: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![Nx](https://img.shields.io/badge/Nx-21.2-orange.svg)](https://nx.dev/)

> Un framework completo para crear servidores MCP (Model Context Protocol) con herramientas modernas de desarrollo y un sistema de build optimizado.

## 🚀 Visión General

DyneMCP es un monorepo que contiene un ecosistema completo para el desarrollo de servidores MCP:

- **@dynemcp/dynemcp**: Framework principal con runtime de servidor y sistema de build
- **@dynemcp/create-dynemcp**: Generador CLI para crear nuevos proyectos MCP
- **Plantillas**: Múltiples plantillas preconfiguradas para diferentes casos de uso

## 📦 Paquetes

### [@dynemcp/dynemcp](./packages/dynemcp)
El framework principal incluye:
- ⚡ Servidor MCP con soporte completo para tools, resources y prompts
- 🏗️ Sistema de build optimizado con esbuild
- 🔄 Modo desarrollo con hot reload
- 📝 Configuración declarativa
- 🌐 Múltiples transportes (stdio, HTTP, SSE)
- 🔧 Sistema de registro dinámico
- 🎯 Capacidades de sampling de modelos
- 🔒 Funciones de seguridad integradas

### [@dynemcp/create-dynemcp](./packages/create-dynemcp)
Generador de proyectos que ofrece:
- 🎯 CLI interactivo para crear nuevos proyectos
- 📋 Múltiples plantillas especializadas
- 📦 Configuración automática de dependencias
- 🔧 Setup inmediato para desarrollo

## 🏗️ Plantillas Disponibles

### [Default](./packages/create-dynemcp/src/templates/default)
Plantilla básica con ejemplos mínimos de tools, resources y prompts.
- **Caso de uso**: Aprender los básicos de MCP, automatización simple
- **Características**: Ejemplo básico de tool, resource y prompt
- **Transporte**: stdio

### [Calculator](./packages/create-dynemcp/src/templates/calculator)
Agente matemático con:
- **Caso de uso**: Cálculos matemáticos, herramientas educativas
- **Características**: Calculadora básica y avanzada, referencias matemáticas, prompts especializados
- **Transporte**: stdio
- **Herramientas**: Aritmética básica, funciones matemáticas avanzadas

### [HTTP Server](./packages/create-dynemcp/src/templates/http-server)
Servidor básico usando transporte HTTP con:
- **Caso de uso**: Integración web, endpoints API
- **Características**: Configuración de servidor Express, transporte HTTP
- **Transporte**: HTTP
- **Herramientas**: Herramientas de saludo, información del servidor

### [Secure Agent](./packages/create-dynemcp/src/templates/secure-agent)
Agente listo para producción con:
- **Caso de uso**: Aplicaciones empresariales, entornos seguros
- **Características**: Autenticación por API key, middleware de seguridad, logging de auditoría
- **Transporte**: HTTP con autenticación
- **Seguridad**: Rate limiting, CORS, validación de entrada

### [Dynamic Agent](./packages/create-dynemcp/src/templates/dynamic-agent)
Agente avanzado que demuestra:
- **Caso de uso**: Investigación en IA, sistemas adaptativos, agentes autoaprendientes
- **Características**: Registro dinámico de herramientas, sampling de modelos, persistencia de memoria
- **Transporte**: stdio
- **Avanzado**: Algoritmos de aprendizaje, adaptación de herramientas

## 🚀 Inicio Rápido

### Instalación Global

```bash
npm install -g @dynemcp/create-dynemcp
```

### Crear un Nuevo Proyecto

```bash
# Modo interactivo
create-dynemcp mi-agente

# Con plantilla específica
create-dynemcp mi-calculadora --template calculator

# Modo no interactivo
create-dynemcp mi-agente --yes --template default
```

### Desarrollo Local

```bash
# Clonar el repositorio
git clone https://github.com/dynemcp/dynemcp.git
cd dynemcp

# Instalar dependencias
pnpm install

# Ejecutar todos los tests
pnpm test

# Construir todos los paquetes
pnpm build

# Desarrollo con modo watch
pnpm dev
```

## 🔧 Comandos de Desarrollo

```bash
# Build
pnpm build                    # Construir todos los paquetes
pnpm clean                    # Limpiar builds previos

# Calidad de código
pnpm lint                     # Linting con ESLint
pnpm lint:fix                 # Arreglar errores de lint
pnpm format                   # Formatear código con Prettier
pnpm beautify                 # Format + lint fix

# Testing
pnpm test                     # Ejecutar tests
pnpm test:watch               # Tests en modo watch
pnpm test:coverage            # Tests con coverage

# Versionado y publicación
pnpm version:patch            # Versión patch
pnpm version:minor            # Versión minor
pnpm version:major            # Versión major
pnpm version:canary           # Versión canary
pnpm publish                  # Publicar a npm
pnpm publish:canary           # Publicar versión canary
```

## 🏛️ Arquitectura

### Estructura del Monorepo

```
dynemcp/
├── packages/
│   ├── dynemcp/              # Framework principal
│   │   ├── src/lib/server/   # Servidor MCP
│   │   ├── src/lib/build/    # Sistema de build
│   │   └── src/cli.ts        # CLI principal
│   │
│   └── create-dynemcp/       # Generador de proyectos
│       ├── src/lib/          # Lógica del generador
│       └── src/templates/    # Plantillas de proyecto
│
├── examples/                 # Ejemplos de uso
├── scripts/                  # Scripts de automatización
└── docs/                     # Documentación adicional
```

### Flujo de Desarrollo

1. **Desarrollo**: Usa `pnpm dev` para modo watch
2. **Build**: Usa `pnpm build` para construir todos los paquetes
3. **Test**: Usa `pnpm test` para ejecutar la suite de tests
4. **Publish**: Usa `pnpm publish` para publicar a npm

## 🤝 Contribuir

1. Haz fork del proyecto
2. Crea una rama de feature (`git checkout -b feature/mi-feature`)
3. Haz commit de tus cambios (`git commit -m 'Agrega feature'`)
4. Haz push a la rama (`git push origin feature/mi-feature`)
5. Abre un Pull Request

### Guía de Contribución

- Sigue las convenciones de código existentes
- Agrega tests para nuevas funcionalidades
- Actualiza la documentación cuando sea necesario
- Usa commits semánticos

## 📋 Tecnologías

- **TypeScript 5.8+**: Lenguaje principal
- **Nx 21.2**: Herramientas de monorepo
- **ESBuild**: Bundling optimizado
- **Vitest**: Framework de testing
- **ESLint + Prettier**: Calidad de código
- **pnpm**: Gestión de paquetes

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🔗 Enlaces Útiles

- [Documentación de MCP](https://modelcontextprotocol.io/)
- [Guía de Desarrollo](./CONTRIBUTING.md)
- [Issues y Feature Requests](https://github.com/dynemcp/dynemcp/issues)
- [Discusiones](https://github.com/dynemcp/dynemcp/discussions)

## 📈 Estado del Proyecto

- ✅ Framework core estable
- ✅ Sistema de build optimizado
- ✅ Plantillas funcionales
- ✅ CLI interactivo
- 🔄 Documentación en progreso
