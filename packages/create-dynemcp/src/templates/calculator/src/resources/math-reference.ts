import { DyneMCPResource } from '@dynemcp/dynemcp'

export class MathReferenceResource extends DyneMCPResource {
  readonly name = 'math_reference'
  readonly uri = 'dynemcp://resource/math-reference'
  readonly description = 'A quick reference for mathematical formulas.'
  readonly mimeType = 'text/markdown'

  getContent(): string {
    return `
# Math Reference

## Area of a Circle
A = π * r^2

## Pythagorean Theorem
a^2 + b^2 = c^2
`
  }
}

export default new MathReferenceResource()
