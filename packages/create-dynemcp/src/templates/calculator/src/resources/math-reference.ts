import { DyneMCPResource } from '@dynemcp/server-dynemcp';

export class MathReferenceResource extends DyneMCPResource {
  uri = 'https://math-reference.com';
  name = 'Mathematics Reference';
  description = 'Reference guide for mathematical operations and formulas';

  async getContent(): Promise<string> {
    return `# Mathematics Reference Guide

## Basic Operations

### Arithmetic Operations
- **Addition**: a + b
- **Subtraction**: a - b
- **Multiplication**: a × b or a * b
- **Division**: a ÷ b or a / b

### Advanced Operations
- **Power**: a^b (a raised to the power of b)
- **Square Root**: √a (square root of a)
- **Logarithm**: log_b(a) (logarithm of a with base b)
- **Natural Logarithm**: ln(a) (natural logarithm of a)

## Trigonometric Functions

### Basic Trigonometric Functions
- **Sine**: sin(θ)
- **Cosine**: cos(θ)
- **Tangent**: tan(θ)

### Inverse Trigonometric Functions
- **Arcsine**: arcsin(x) or sin⁻¹(x)
- **Arccosine**: arccos(x) or cos⁻¹(x)
- **Arctangent**: arctan(x) or tan⁻¹(x)

## Mathematical Constants

- **π (Pi)**: ≈ 3.14159
- **e (Euler's number)**: ≈ 2.71828
- **φ (Golden ratio)**: ≈ 1.61803

## Common Formulas

### Area Formulas
- **Circle**: A = πr²
- **Rectangle**: A = l × w
- **Triangle**: A = ½bh

### Volume Formulas
- **Sphere**: V = ⁴⁄₃πr³
- **Cube**: V = s³
- **Cylinder**: V = πr²h

### Distance and Speed
- **Distance**: d = v × t
- **Speed**: v = d ÷ t
- **Time**: t = d ÷ v

## Error Handling

When performing calculations, be aware of:
- **Division by zero**: Not allowed
- **Square root of negative numbers**: Not allowed in real numbers
- **Logarithm of non-positive numbers**: Not allowed
- **Invalid trigonometric inputs**: May result in undefined values

## Precision

For most practical purposes, 6-8 decimal places of precision are sufficient. For scientific calculations, consider using higher precision libraries.
`;
  }
}

export default new MathReferenceResource(); 