// Safe math evaluator to prevent code injection
export function safeEvaluate(expression: string): number {
  // Remove whitespace
  const cleanExpr = expression.replace(/\s/g, '')

  // Only allow safe mathematical characters
  const safePattern = /^[\d+\-*/().]+$/
  if (!safePattern.test(cleanExpr)) {
    throw new Error(
      'Invalid characters in expression. Only numbers, +, -, *, /, (), and . are allowed.'
    )
  }

  // Prevent function calls and other dangerous patterns
  const dangerousPatterns = [
    /[a-zA-Z]/, // No letters (prevents function calls)
    /_{2,}/, // No double underscores
    /\$\{/, // No template literals
    /eval/i, // No eval
    /function/i, // No function keyword
    /=>/, // No arrow functions
    /\[|\]/, // No array access
  ]

  for (const pattern of dangerousPatterns) {
    if (pattern.test(cleanExpr)) {
      throw new Error('Expression contains invalid patterns')
    }
  }

  try {
    // Safe evaluation using a limited math evaluator instead of Function constructor
    return safeArithmeticEvaluator(cleanExpr)
  } catch {
    throw new Error('Failed to evaluate mathematical expression')
  }
}

/**
 * Safe arithmetic evaluator that parses and evaluates basic math expressions
 * without using eval() or Function() constructor
 */
function safeArithmeticEvaluator(expr: string): number {
  // Tokenize the expression
  const tokens = tokenize(expr)

  // Parse and evaluate using recursive descent parser
  const result = parseExpression(tokens, 0)

  if (result.position !== tokens.length) {
    throw new Error('Unexpected tokens in expression')
  }

  return result.value
}

interface ParseResult {
  value: number
  position: number
}

function tokenize(expr: string): (number | string)[] {
  const tokens: (number | string)[] = []
  let i = 0

  while (i < expr.length) {
    const char = expr[i]

    if ((char >= '0' && char <= '9') || char === '.') {
      // Parse number
      let numStr = ''
      while (
        i < expr.length &&
        ((expr[i] >= '0' && expr[i] <= '9') || expr[i] === '.')
      ) {
        numStr += expr[i]
        i++
      }
      tokens.push(parseFloat(numStr))
    } else if (['+', '-', '*', '/', '(', ')'].includes(char)) {
      tokens.push(char)
      i++
    } else {
      throw new Error(`Invalid character: ${char}`)
    }
  }

  return tokens
}

function parseExpression(
  tokens: (number | string)[],
  pos: number
): ParseResult {
  return parseAddition(tokens, pos)
}

function parseAddition(tokens: (number | string)[], pos: number): ParseResult {
  let result = parseMultiplication(tokens, pos)

  while (result.position < tokens.length) {
    const token = tokens[result.position]
    if (token === '+') {
      const right = parseMultiplication(tokens, result.position + 1)
      result = {
        value: result.value + right.value,
        position: right.position,
      }
    } else if (token === '-') {
      const right = parseMultiplication(tokens, result.position + 1)
      result = {
        value: result.value - right.value,
        position: right.position,
      }
    } else {
      break
    }
  }

  return result
}

function parseMultiplication(
  tokens: (number | string)[],
  pos: number
): ParseResult {
  let result = parseFactor(tokens, pos)

  while (result.position < tokens.length) {
    const token = tokens[result.position]
    if (token === '*') {
      const right = parseFactor(tokens, result.position + 1)
      result = {
        value: result.value * right.value,
        position: right.position,
      }
    } else if (token === '/') {
      const right = parseFactor(tokens, result.position + 1)
      if (right.value === 0) {
        throw new Error('Division by zero')
      }
      result = {
        value: result.value / right.value,
        position: right.position,
      }
    } else {
      break
    }
  }

  return result
}

function parseFactor(tokens: (number | string)[], pos: number): ParseResult {
  if (pos >= tokens.length) {
    throw new Error('Unexpected end of expression')
  }

  const token = tokens[pos]

  if (typeof token === 'number') {
    return { value: token, position: pos + 1 }
  }

  if (token === '(') {
    const result = parseExpression(tokens, pos + 1)
    if (result.position >= tokens.length || tokens[result.position] !== ')') {
      throw new Error('Missing closing parenthesis')
    }
    return { value: result.value, position: result.position + 1 }
  }

  if (token === '-') {
    const result = parseFactor(tokens, pos + 1)
    return { value: -result.value, position: result.position }
  }

  if (token === '+') {
    return parseFactor(tokens, pos + 1)
  }

  throw new Error(`Unexpected token: ${token}`)
}
