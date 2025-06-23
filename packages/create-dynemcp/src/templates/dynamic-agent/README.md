# Dynamic Agent Template - DyneMCP Project

> Advanced MCP agent with self-extension, dynamic learning, and intelligent model sampling capabilities.

## 🧠 Description

This template creates a next-generation MCP agent that demonstrates advanced capabilities:

- **Dynamic Registration**: Learns new tools at runtime
- **Model Sampling**: Interacts autonomously with LLMs
- **Self-extension**: Adapts and improves itself automatically
- **Evolving Memory**: Maintains context and learns from interactions

It is perfect for AI research, adaptive systems, autonomous agents, and experimental use cases.

## 📁 Project Structure

```
dynamic-agent-project/
├── src/
│   └── index.ts              # Main dynamic MCP agent
├── tools/
│   └── get-initial-memory.ts # Initial memory tool
├── memory/
│   ├── core-memory.json      # Agent's persistent memory
│   ├── learned-skills.json   # Learned skills
│   └── interaction-history.json # Interaction history
├── learning/
│   ├── skill-templates.ts    # Templates for new skills
│   └── adaptation-rules.ts   # Adaptation rules
├── dynemcp.config.json       # Dynamic agent configuration
├── package.json              # Advanced dependencies
├── tsconfig.json             # TypeScript configuration
└── README.md                 # This documentation
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 2. Start Dynamic Agent

```bash
# Development mode with learning logs
npm run dev

# The agent will begin its self-improvement process
```

### 3. Observe Evolution

```bash
# In the console you will see:
# "Agent started. I will learn a new tool in 10 seconds."
# "Learning 'get-system-load'..."
# "Tool learned!"
# "Asking model to check system status..."
```

## 🧠 Dynamic Capabilities

### Dynamic Tool Registration

The agent can automatically learn new tools:

```typescript
// In src/index.ts - Example of dynamic learning
setTimeout(() => {
  console.log('🧠 Learning "get-system-load"...')
  
  server.registry.addTool({
    name: 'get-system-load',
    description: 'Gets the current system CPU load.',
    schema: z.object({}),
    handler: async () => ({ 
      load: `${(Math.random() * 100).toFixed(2)}%`,
      timestamp: new Date().toISOString(),
      source: 'dynamic-learning'
    })
  })
  
  console.log('✨ Tool learned and available!')
  
  // Persist the new tool
  persistLearnedSkill('get-system-load', {
    learned_at: new Date().toISOString(),
    usage_count: 0,
    effectiveness: 0
  })
}, 10000)
```

### Intelligent Sampling

The agent samples models for self-evaluation:

```typescript
// Periodic sampling for self-improvement
setInterval(async () => {
  if (server.registry.getAllTools().length === 0) {
    return // No sampling if no tools are available
  }
  
  try {
    console.log('🔍 Asking model to check system status...')
    
    const response = await server.sample({
      content: [
        {
          type: 'text',
          text: `Use your available tools to analyze the current system status. 
                 Be comprehensive and provide insights about performance.`
        }
      ]
    })
    
    const textResponse = response.content.find(c => c.type === 'text')?.text
    console.log(`🤖 Model says: "${textResponse}"`)
    
    // Analyze response and learn
    analyzeAndLearn(textResponse)
    
  } catch (e) {
    console.error('❌ Failed to sample model:', e)
  }
}, 20000)
```

## 🛠️ Initial Tools

### Get Initial Memory (`get-initial-memory`)

Tool that manages the agent's initial memory:

```typescript
// tools/get-initial-memory.ts
const getInitialMemoryTool: ToolDefinition = {
  name: 'get-initial-memory',
  description: 'Retrieves the initial memory and learned capabilities of the dynamic agent',
  schema: z.object({
    category: z.enum(['core', 'learned', 'all']).default('all')
      .describe('Category of memory to retrieve')
  }),
  handler: async ({ category }) => {
    const memory = {
      core: {
        identity: 'Dynamic MCP Agent',
        version: '1.0.0',
        capabilities: [
          'dynamic-tool-learning',
          'model-sampling',
          'self-adaptation',
          'memory-persistence'
        ],
        initialized_at: new Date().toISOString()
      },
      learned: loadLearnedSkills(),
      interaction_history: loadInteractionHistory()
    }
    
    switch (category) {
      case 'core':
        return { memory: memory.core }
      case 'learned':
        return { memory: memory.learned }
      default:
        return { memory }
    }
  }
}
```

**Usage:**
```bash
# Get full memory
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "get-initial-memory",
      "arguments": {"category": "all"}
    }
  }'
```

## 🧠 Learning System

### Skill Templates

The agent uses templates to generate new skills:

```typescript
// learning/skill-templates.ts
export class SkillTemplates {
  static generateSystemTool(name: string, description: string) {
    return {
      name,
      description,
      schema: z.object({
        options: z.object({}).optional().describe('Additional options')
      }),
      handler: async ({ options = {} }) => {
        // Dynamic implementation based on tool type
        const result = await this.executeSystemCommand(name, options)
        
        // Register usage for learning
        this.recordToolUsage(name, result)
        
        return {
          result,
          timestamp: new Date().toISOString(),
          learned_tool: true
        }
      }
    }
  }
  
  static generateDataTool(name: string, dataSource: string) {
    return {
      name,
      description: `Accesses ${dataSource} data dynamically`,
      schema: z.object({
        query: z.string().describe('Query to execute'),
        format: z.enum(['json', 'text', 'csv']).default('json')
      }),
      handler: async ({ query, format }) => {
        const data = await this.queryDataSource(dataSource, query)
        return this.formatData(data, format)
      }
    }
  }
}
```

### Adaptation Rules

```typescript
// learning/adaptation-rules.ts
export class AdaptationEngine {
  static async evaluatePerformance() {
    const tools = server.registry.getAllTools()
    const metrics = []
    
    for (const tool of tools) {
      const usage = getToolUsageStats(tool.name)
      const effectiveness = calculateEffectiveness(usage)
      
      metrics.push({
        tool: tool.name,
        usage_count: usage.count,
        success_rate: usage.success_rate,
        effectiveness
      })
    }
    
    return this.generateImprovements(metrics)
  }
  
  static generateImprovements(metrics: any[]) {
    const improvements = []
    
    for (const metric of metrics) {
      if (metric.success_rate < 0.8) {
        improvements.push({
          type: 'refine_tool',
          tool: metric.tool,
          reason: 'Low success rate',
          action: 'Add better error handling'
        })
      }
      
      if (metric.usage_count === 0) {
        improvements.push({
          type: 'deprecate_tool',
          tool: metric.tool,
          reason: 'No usage',
          action: 'Consider removal'
        })
      }
    }
    
    return improvements
  }
}
```

## 💾 Memory System

### Persistent Memory

```typescript
// Persistent memory management
class MemoryManager {
  static async saveMemory(type: string, data: any) {
    const filename = `memory/${type}-memory.json`
    const currentData = await this.loadMemory(type) || {}
    
    const updatedData = {
      ...currentData,
      ...data,
      last_updated: new Date().toISOString()
    }
    
    await fs.writeFile(filename, JSON.stringify(updatedData, null, 2))
    console.log(`💾 Memory saved: ${type}`)
  }
  
  static async loadMemory(type: string) {
    try {
      const filename = `memory/${type}-memory.json`
      const data = await fs.readFile(filename, 'utf-8')
      return JSON.parse(data)
    } catch (error) {
      console.log(`📁 Creating new ${type} memory`)
      return {}
    }
  }
  
  static async recordInteraction(interaction: any) {
    const history = await this.loadMemory('interaction-history') || { interactions: [] }
    
    history.interactions.push({
      ...interaction,
      timestamp: new Date().toISOString(),
      id: crypto.randomUUID()
    })
    
    // Keep only last 1000 interactions
    if (history.interactions.length > 1000) {
      history.interactions = history.interactions.slice(-1000)
    }
    
    await this.saveMemory('interaction-history', history)
  }
}
```

### Learning History

```json
// memory/learned-skills.json
{
  "skills": {
    "get-system-load": {
      "learned_at": "2024-01-01T10:00:00.000Z",
      "usage_count": 42,
      "success_rate": 0.95,
      "effectiveness": 0.87,
      "improvements": [
        {
          "date": "2024-01-01T12:00:00.000Z",
          "type": "performance_optimization",
          "description": "Added caching for system metrics"
        }
      ]
    },
    "analyze-logs": {
      "learned_at": "2024-01-01T14:00:00.000Z",
      "usage_count": 15,
      "success_rate": 0.73,
      "effectiveness": 0.65,
      "status": "needs_improvement"
    }
  },
  "learning_stats": {
    "total_skills_learned": 2,
    "average_effectiveness": 0.76,
    "learning_rate": "2.3 skills/day"
  }
}
```

## ⚙️ Advanced Configuration

### `dynemcp.config.json`

```json
{
  "server": {
    "name": "dynemcp-dynamic-agent",
    "version": "1.0.0",
    "description": "Self-adapting MCP agent with dynamic capabilities"
  },
  "transport": {
    "type": "stdio"
  },
  "dynamic": {
    "learning": {
      "enabled": true,
      "auto_skill_discovery": true,
      "learning_interval": 300000,
      "max_skills": 50
    },
    "sampling": {
      "enabled": true,
      "interval": 20000,
      "auto_evaluation": true,
      "model_interaction": true
    },
    "memory": {
      "persistent": true,
      "backup_interval": 3600000,
      "max_history_size": 1000
    },
    "adaptation": {
      "enabled": true,
      "performance_threshold": 0.8,
      "auto_improvement": true
    }
  },
  "tools": {
    "enabled": true,
    "directory": "./tools"
  },
  "build": {
    "entryPoint": "./src/index.ts",
    "outDir": "./dist",
    "bundle": true
  }
}
```

## 🔧 Advanced Scripts

```bash
# Development with detailed learning logs
npm run dev:verbose

# Start with clean memory
npm run dev:clean

# Accelerated learning mode
npm run dev:accelerated

# Effectiveness analysis
npm run analyze:effectiveness

# Memory backup
npm run backup:memory

# Restore memory
npm run restore:memory

# Evaluate agent performance
npm run evaluate:performance
```

## 🎯 Advanced Use Cases

### 1. Autonomous Research Agent

```bash
# Create agent that researches and learns automatically
create-dynemcp research-agent --template dynamic-agent
cd research-agent

# Configure for web research
echo "RESEARCH_MODE=autonomous" >> .env
echo "LEARNING_SOURCES=web,papers,apis" >> .env
```

### 2. Evolving Personal Assistant

```bash
# Agent that adapts to user preferences
create-dynemcp personal-ai --template dynamic-agent
```

**Customization:**
```typescript
// Learning from user preferences
class UserPreferenceLearner {
  static async learnFromInteraction(user_input: string, response: string, feedback: number) {
    const preferences = await MemoryManager.loadMemory('user-preferences') || {}
    
    // Analyze patterns in successful interactions
    if (feedback > 0.8) {
      const patterns = this.extractPatterns(user_input, response)
      preferences.successful_patterns = [
        ...(preferences.successful_patterns || []),
        ...patterns
      ]
    }
    
    await MemoryManager.saveMemory('user-preferences', preferences)
  }
}
```

### 3. Adaptive Monitoring System

```bash
# Agent that monitors systems and adapts to new patterns
create-dynemcp adaptive-monitor --template dynamic-agent
```

## 📝 Developing New Capabilities

### Add New Learning Types

```typescript
// Example: Learning by observation
class ObservationLearner {
  static async learnFromLogs(logData: string[]) {
    const patterns = this.analyzeLogPatterns(logData)
    
    for (const pattern of patterns) {
      if (pattern.confidence > 0.9) {
        const newTool = SkillTemplates.generateFromPattern(pattern)
        server.registry.addTool(newTool)
        
        console.log(`🔍 Learned new pattern-based tool: ${newTool.name}`)
      }
    }
  }
}
```

### Integration with External APIs

```typescript
// Dynamic API learning
class APILearner {
  static async discoverAPI(apiUrl: string) {
    try {
      const schema = await this.fetchAPISchema(apiUrl)
      const tools = this.generateToolsFromSchema(schema)
      
      for (const tool of tools) {
        server.registry.addTool(tool)
        console.log(`🌐 Learned API tool: ${tool.name}`)
      }
    } catch (error) {
      console.warn(`Failed to learn from API: ${apiUrl}`)
    }
  }
}
```

## 🏗️ Production Build

### 1. Build with Dynamic Capabilities

```bash
# Build that preserves dynamic capabilities
npm run build:dynamic
```

**Build features:**
- ✅ Persistent memory included
- ✅ Embedded learning templates
- ✅ Active adaptation system
- ✅ Sampling capabilities enabled

### 2. Deploy Dynamic Agent

```bash
# Environment variables for production
export LEARNING_MODE=production
export MEMORY_BACKUP_ENABLED=true
export ADAPTATION_THRESHOLD=0.85

# Start with full capabilities
npm start
```

### 3. Evolution Monitoring

```bash
# Check learning status
curl http://localhost:3000/api/learning-status

# View learned tools
curl http://localhost:3000/api/learned-tools

# Get effectiveness metrics
curl http://localhost:3000/api/effectiveness-metrics
```

## 🧪 Testing Dynamic Capabilities

### 1. Learning Test

```typescript
// Test that the agent learns new tools automatically
describe('Dynamic Learning', () => {
  it('should learn new tools automatically', async () => {
    const initialToolCount = server.registry.getAllTools().length
    
    // Simulate learning condition
    await triggerLearningEvent()
    
    // Wait for learning
    await new Promise(resolve => setTimeout(resolve, 5000))
    
    const finalToolCount = server.registry.getAllTools().length
    expect(finalToolCount).toBeGreaterThan(initialToolCount)
  })
})
```

### 2. Sampling Test

```typescript
// Test sampling capabilities
describe('Model Sampling', () => {
  it('should sample model for self-evaluation', async () => {
    const samplingResult = await server.sample({
      content: [{
        type: 'text',
        text: 'Evaluate your current capabilities'
      }]
    })
    
    expect(samplingResult.content).toBeDefined()
    expect(samplingResult.content.length).toBeGreaterThan(0)
  })
})
```

### 3. Memory Test

```typescript
// Test memory persistence
describe('Memory Persistence', () => {
  it('should persist learned skills', async () => {
    const skill = { name: 'test-skill', learned_at: new Date().toISOString() }
    
    await MemoryManager.saveMemory('learned-skills', skill)
    const loaded = await MemoryManager.loadMemory('learned-skills')
    
    expect(loaded.name).toBe('test-skill')
  })
})
```

## 🚀 Advanced Extensions

### 1. Machine Learning Integration

```bash
npm install @tensorflow/tfjs-node
```

```typescript
import * as tf from '@tensorflow/tfjs-node'

class MLLearner {
  static async trainEffectivenessModel(data: any[]) {
    const model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [10], units: 64, activation: 'relu' }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dense({ units: 1, activation: 'sigmoid' })
      ]
    })
    
    model.compile({
      optimizer: 'adam',
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    })
    
    // Train model to predict tool effectiveness
    const xs = tf.tensor2d(data.map(d => d.features))
    const ys = tf.tensor2d(data.map(d => [d.effectiveness]))
    
    await model.fit(xs, ys, { epochs: 100 })
    
    return model
  }
}
```

### 2. Agent Communication

```typescript
// Multi-agent communication system
class AgentCommunication {
  static async shareKnowledge(otherAgentUrl: string) {
    const mySkills = await MemoryManager.loadMemory('learned-skills')
    
    try {
      const response = await fetch(`${otherAgentUrl}/api/knowledge-exchange`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skills: mySkills })
      })
      
      const theirSkills = await response.json()
      await this.integrateExternalKnowledge(theirSkills)
      
    } catch (error) {
      console.warn('Failed to share knowledge with other agent')
    }
  }
}
```

### 3. Genetic Optimization

```typescript
// Genetic algorithm to optimize tools
class GeneticOptimizer {
  static async evolveTools() {
    const tools = server.registry.getAllTools()
    const population = this.createPopulation(tools)
    
    for (let generation = 0; generation < 100; generation++) {
      const fitness = await this.evaluateFitness(population)
      const newGeneration = this.reproduce(population, fitness)
      population.splice(0, population.length, ...newGeneration)
    }
    
    return this.getBestIndividuals(population)
  }
}
```

## 🤝 Contributing

Ideas to expand dynamic capabilities?

1. Fork the main repository
2. Modify the template in `packages/create-dynemcp/src/templates/dynamic-agent/`
3. Add new learning capabilities
4. Include tests for new features
5. Submit a Pull Request

### Contribution Ideas

- New learning algorithms
- ML model integration
- Multi-agent communication systems
- Automatic performance optimization
- Advanced reasoning capabilities

## 📄 License

MIT License - see [LICENSE](../../../../../LICENSE) for more details.

## 🔗 Useful Links

- [DyneMCP Framework](../../../dynemcp/README.md)
- [create-dynemcp generator](../../README.md)
- [Other templates](../)
- [Reinforcement Learning](https://web.stanford.edu/class/cs234/)
- [Multi-Agent Systems](https://multiagent.cs.washington.edu/)
- [TensorFlow.js](https://www.tensorflow.org/js)
- [MCP Documentation](https://modelcontextprotocol.io/)
