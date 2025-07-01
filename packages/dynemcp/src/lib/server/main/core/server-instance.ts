import type { DyneMCP } from './server'

let currentInstance: DyneMCP | null = null

export function setCurrentDyneMCPInstance(instance: DyneMCP) {
  currentInstance = instance
}

export function getCurrentDyneMCPInstance(): DyneMCP | null {
  return currentInstance
}
