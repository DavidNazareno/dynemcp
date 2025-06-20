import { DyneMCPTool, z } from '@dynemcp/server-dynemcp';

const AdvancedCalculatorSchema = z.object({
  operation: z.enum(['power', 'sqrt', 'log', 'sin', 'cos', 'tan']).describe('The advanced mathematical operation to perform'),
  value: z.number().describe('The number to operate on'),
  base: z.number().optional().describe('Base for logarithm (default: 10)'),
  exponent: z.number().optional().describe('Exponent for power operation'),
});

export class AdvancedCalculatorTool extends DyneMCPTool<typeof AdvancedCalculatorSchema> {
  name = 'advanced-calculator';
  description = 'Perform advanced mathematical operations (power, sqrt, log, sin, cos, tan)';
  schema = AdvancedCalculatorSchema;

  async execute({ operation, value, base = 10, exponent }: z.infer<typeof AdvancedCalculatorSchema>) {
    let result: number;
    
    switch (operation) {
      case 'power':
        if (exponent === undefined) {
          throw new Error('Exponent is required for power operation');
        }
        result = Math.pow(value, exponent);
        break;
      case 'sqrt':
        if (value < 0) {
          throw new Error('Cannot calculate square root of negative number');
        }
        result = Math.sqrt(value);
        break;
      case 'log':
        if (value <= 0) {
          throw new Error('Cannot calculate logarithm of non-positive number');
        }
        if (base <= 0 || base === 1) {
          throw new Error('Invalid base for logarithm');
        }
        result = Math.log(value) / Math.log(base);
        break;
      case 'sin':
        result = Math.sin(value);
        break;
      case 'cos':
        result = Math.cos(value);
        break;
      case 'tan':
        result = Math.tan(value);
        break;
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }

    return {
      result,
      operation: this.formatOperation(operation, value, base, exponent),
      timestamp: new Date().toISOString(),
    };
  }

  private formatOperation(operation: string, value: number, base?: number, exponent?: number): string {
    switch (operation) {
      case 'power':
        return `${value}^${exponent} = ${Math.pow(value, exponent!)}`;
      case 'sqrt':
        return `√${value} = ${Math.sqrt(value)}`;
      case 'log':
        return `log_${base}(${value}) = ${Math.log(value) / Math.log(base!)}`;
      case 'sin':
        return `sin(${value}) = ${Math.sin(value)}`;
      case 'cos':
        return `cos(${value}) = ${Math.cos(value)}`;
      case 'tan':
        return `tan(${value}) = ${Math.tan(value)}`;
      default:
        return `${operation}(${value}) = ${value}`;
    }
  }
}

export default new AdvancedCalculatorTool(); 