// Mathematical utility functions
// This file will NOT be loaded as a component since it's not named "tool.ts"

export function factorial(n: number): number {
  if (n < 0) throw new Error('Factorial is not defined for negative numbers')
  if (n === 0 || n === 1) return 1
  return n * factorial(n - 1)
}

export function isPrime(n: number): boolean {
  if (n < 2) return false
  for (let i = 2; i <= Math.sqrt(n); i++) {
    if (n % i === 0) return false
  }
  return true
}

export function gcd(a: number, b: number): number {
  while (b !== 0) {
    const temp = b
    b = a % b
    a = temp
  }
  return a
}

export const MATH_CONSTANTS = {
  PI: Math.PI,
  E: Math.E,
  GOLDEN_RATIO: (1 + Math.sqrt(5)) / 2,
} as const
