import {
  Root,
  RootList,
  isRoot,
  isRootList,
  parseRootList,
} from '@dynemcp/dynemcp'

// --- Example roots suggested by the MCP client --- //
// You can use this as a reference for your own root definitions
export const exampleRoots: RootList = [
  { uri: 'file:///home/user/projects/frontend', name: 'Frontend Repository' },
  { uri: 'https://api.example.com/v1', name: 'API Endpoint' },
]

// --- Logic (helpers) --- //
// Checks if an object is a valid Root
export function checkRoot(obj: any): boolean {
  return isRoot(obj)
}

// Checks if an object is a valid list of Roots
export function checkRootList(obj: any): boolean {
  return isRootList(obj)
}

// Parses and normalizes a list of roots from any input
export function getRootsFromInput(input: any): RootList {
  return parseRootList(input)
}
