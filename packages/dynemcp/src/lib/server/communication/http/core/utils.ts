import { randomUUID } from 'crypto'

export function generateSecureSessionId(): string {
  return randomUUID()
}
