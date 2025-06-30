import {
  Root,
  RootList,
  isRoot,
  isRootList,
  parseRootList,
} from '@dynemcp/dynemcp'

// Ejemplo de roots sugeridos por el cliente MCP
export const exampleRoots: RootList = [
  { uri: 'file:///home/user/projects/frontend', name: 'Frontend Repository' },
  { uri: 'https://api.example.com/v1', name: 'API Endpoint' },
]

// Validar si un objeto es un root válido
export function checkRoot(obj: any): boolean {
  return isRoot(obj)
}

// Validar si un objeto es una lista de roots válida
export function checkRootList(obj: any): boolean {
  return isRootList(obj)
}

// Parsear y normalizar una lista de roots desde cualquier entrada
export function getRootsFromInput(input: any): RootList {
  return parseRootList(input)
}
