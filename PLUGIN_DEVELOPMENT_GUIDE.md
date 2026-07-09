
# Influence Firewall Plugin Development Guide

Complete guide for developing and publishing plugins for the Influence Firewall marketplace.

## Table of Contents
- [Getting Started](#getting-started)
- [Plugin Types](#plugin-types)
- [Development Setup](#development-setup)
- [API Reference](#api-reference)
- [Examples](#examples)
- [Publishing](#publishing)
- [Best Practices](#best-practices)

---

## Getting Started

### What is a Plugin?

Plugins extend Influence Firewall's capabilities through a simple hook-based architecture. They can:
- Add new analysis layers
- Integrate external data sources
- Implement custom policies
- Send analysis to external systems
- Create custom UI components

### Plugin Lifecycle

```
Install → Init → Activate → Handle Hooks → Deactivate → Uninstall
```

---

## Plugin Types

### 1. Analysis Layer Plugin
Adds a new detection layer to the analysis system.

```typescript
import { AnalysisLayerPlugin, PluginContext, PluginAPI } from '@firewall/sdk'

export class SentimentPlugin extends AnalysisLayerPlugin {
  constructor() {
    super()
    this.layerName = 'sentiment_analysis'
  }

  async init(context: PluginContext, api: PluginAPI) {
    await super.init(context, api)
    this.registerAnalysisHook()
  }

  protected async analyzeContent(content: string) {
    // Analyze sentiment
    const sentiment = await this.analyzeSentiment(content)
    
    return {
      score: sentiment.score,
      details: `Sentiment: ${sentiment.type}`,
      recommendations: sentiment.recommendations
    }
  }

  private async analyzeSentiment(text: string) {
    // Your sentiment analysis logic
    return {
      score: 65,
      type: 'mixed',
      recommendations: []
    }
  }
}
```

### 2. Data Source Plugin
Integrates a new content source.

```typescript
import { DataSourcePlugin, PluginContext, PluginAPI } from '@firewall/sdk'

export class TwitterDataSourcePlugin extends DataSourcePlugin {
  async init(context: PluginContext, api: PluginAPI) {
    await super.init(context, api)
    this.registerDataSource()
  }

  protected async extractContent(tweetId: string): Promise<string> {
    // Fetch tweet content
    const tweet = await this.fetchTweet(tweetId)
    return tweet.text
  }

  private async fetchTweet(id: string) {
    // Implementation to fetch from Twitter API
    return { text: 'Tweet content' }
  }
}
```

### 3. Policy Plugin
Implements custom enforcement rules.

```typescript
import { PolicyPlugin, PluginContext, PluginAPI } from '@firewall/sdk'

export class BrandSafetyPlugin extends PolicyPlugin {
  async init(context: PluginContext, api: PluginAPI) {
    await super.init(context, api)
    this.registerPolicy()
  }

  protected async evaluatePolicy(payload: Record<string, unknown>) {
    const scores = payload.scores as any
    
    // Custom brand safety rules
    if (scores.toxicity > 80 || scores.manipulation > 85) {
      return {
        matched: true,
        action: 'block',
        reason: 'Violates brand safety guidelines'
      }
    }

    return {
      matched: false,
      action: 'allow',
      reason: 'Content approved'
    }
  }
}
```

### 4. Output Sink Plugin
Sends analysis results to external systems.

```typescript
import { OutputSinkPlugin, PluginContext, PluginAPI } from '@firewall/sdk'

export class SlackNotifierPlugin extends OutputSinkPlugin {
  async init(context: PluginContext, api: PluginAPI) {
    await super.init(context, api)
    this.registerSink()
  }

  protected async processAndSend(data: Record<string, unknown>) {
    if ((data.scores as any).overallRisk > 75) {
      await this.sendToSlack({
        text: `High-risk content detected: ${data.id}`,
        blocks: this.formatSlackMessage(data)
      })
    }
  }

  private async sendToSlack(message: Record<string, unknown>) {
    const webhookUrl = this.context.config.slackWebhook as string
    await fetch(webhookUrl, {
      method: 'POST',
      body: JSON.stringify(message)
    })
  }

  private formatSlackMessage(data: Record<string, unknown>) {
    return [
      {
        type: 'section',
        text: { type: 'mrkdwn', text: `*Risk: ${(data.scores as any).overallRisk}/100*` }
      }
    ]
  }
}
```

### 5. Viewer Plugin
Creates custom UI components.

```typescript
import { ViewerPlugin, PluginContext, PluginAPI } from '@firewall/sdk'

export class CustomReportPlugin extends ViewerPlugin {
  async init(context: PluginContext, api: PluginAPI) {
    await super.init(context, api)
    this.registerViewer()
  }

  protected async renderVisualization(data: Record<string, unknown>) {
    const scores = data.scores as any
    
    return {
      html: `
        <div class="custom-report">
          <h2>Custom Analysis Report</h2>
          <div class="score-grid">
            <div class="score">Toxicity: ${scores.toxicity}</div>
            <div class="score">Misinformation: ${scores.misinformation}</div>
            <div class="score">Manipulation: ${scores.manipulation}</div>
          </div>
        </div>
      `,
      css: `
        .custom-report { padding: 20px; }
        .score-grid { display: grid; gap: 10px; }
      `
    }
  }
}
```

---

## Development Setup

### 1. Create Project
```bash
npm init -y
npm install @firewall/sdk @firewall/types
```

### 2. Create Plugin Manifest
```json
{
  "id": "my-plugin",
  "name": "My Plugin",
  "version": "1.0.0",
  "description": "Description of what plugin does",
  "author": "Your Name",
  "license": "MIT",
  "entry": "dist/index.js",
  "permissions": [
    "api:analyze",
    "storage:read",
    "storage:write"
  ],
  "hooks": [
    "on_analysis_complete"
  ],
  "config": {
    "apiKey": {
      "type": "string",
      "required": true,
      "description": "External API key"
    }
  }
}
```

### 3. Develop Plugin
```typescript
// src/index.ts
import { BasePlugin } from '@firewall/sdk'

export default class MyPlugin extends BasePlugin {
  async init(context, api) {
    await super.init(context, api)
    // Initialize plugin
  }

  async activate() {
    await super.activate()
    // Register hooks, event listeners, etc.
  }
}
```

### 4. Build and Test
```bash
npm run build
npm run test
npm run dev  # Local testing
```

---

## API Reference

### Plugin Context
```typescript
interface PluginContext {
  pluginId: string              // Unique plugin identifier
  pluginVersion: string         // Current version
  userId: string                // User running plugin
  config: Record<string, any>   // User-provided config
  logger: Logger                // Logging interface
}
```

### Logger
```typescript
context.logger.info(message, data?)     // Info level
context.logger.warn(message, data?)     // Warning level
context.logger.error(message, error?)   // Error level
context.logger.debug(message, data?)    // Debug level
```

### Plugin API
```typescript
interface PluginAPI {
  // Hook system
  hooks.register(hookName, handler)
  hooks.unregister(hookName)

  // Storage
  storage.get(key)
  storage.set(key, value)
  storage.delete(key)

  // Analysis
  api.analyze(content, type)
  api.getPolicies()
  api.evaluatePolicy(payload)

  // Events
  events.emit(eventName, data)
  events.on(eventName, handler)
}
```

### Hook Payloads

**on_analysis_start**
```typescript
{
  content: string
  contentType: 'text' | 'url' | 'document'
  metadata: Record<string, any>
}
```

**on_toxicity_score**
```typescript
{
  score: number
  details: string
  content: string
}
```

**on_analysis_complete**
```typescript
{
  id: string
  content: string
  scores: {
    toxicity: number
    misinformation: number
    manipulation: number
    valuesAlignment: number
  }
  details: Record<string, string>
  timestamp: string
}
```

---

## Examples

### Example 1: Profanity Filter
```typescript
export class ProfanityPlugin extends AnalysisLayerPlugin {
  private profanities = new Set(['bad-word-1', 'bad-word-2'])

  async analyzeContent(content: string) {
    const words = content.toLowerCase().split(/\s+/)
    const foundProfanities = words.filter(w => this.profanities.has(w))

    return {
      score: Math.min(100, foundProfanities.length * 20),
      details: `Found ${foundProfanities.length} profane words`,
      recommendations: foundProfanities.length > 0 
        ? ['Consider editing content for profanity']
        : []
    }
  }
}
```

### Example 2: Content Duplication Detection
```typescript
export class DuplicationPlugin extends AnalysisLayerPlugin {
  async analyzeContent(content: string) {
    const hash = this.hashContent(content)
    const isDuplicate = await this.api.storage.get(`hash:${hash}`)

    return {
      score: isDuplicate ? 80 : 0,
      details: isDuplicate ? 'Content appears to be duplicate' : 'Original content',
      recommendations: isDuplicate ? ['Consider original sources'] : []
    }
  }

  private hashContent(content: string): string {
    // Simple hash - use crypto.subtle in production
    return btoa(content).slice(0, 16)
  }
}
```

### Example 3: External API Integration
```typescript
export class AIContentAnalysisPlugin extends AnalysisLayerPlugin {
  async analyzeContent(content: string) {
    const apiKey = this.context.config.apiKey as string
    
    const response = await fetch('https://api.example.com/analyze', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text: content })
    })

    const result = await response.json()

    return {
      score: result.riskScore,
      details: result.explanation,
      recommendations: result.suggestions
    }
  }
}
```

---

## Publishing

### 1. Build Distribution
```bash
npm run build
npm pack
```

### 2. Submit to Marketplace
```bash
npx @firewall/cli publish \
  --apiKey YOUR_API_KEY \
  --pluginPath ./dist \
  --manifest manifest.json
```

### 3. Publish
Once submitted and reviewed, publish via dashboard or API:

```typescript
const response = await fetch('/api/plugins', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'My Plugin',
    slug: 'my-plugin',
    description: '...',
    manifest: require('./manifest.json'),
    category: 'analysis-layer',
    plugin_type: 'detector'
  })
})
```

---

## Best Practices

### 1. Error Handling
Always handle errors gracefully:
```typescript
async analyzeContent(content: string) {
  try {
    return await this.performAnalysis(content)
  } catch (error) {
    this.context.logger.error('Analysis failed', error as Error)
    return {
      score: 0,
      details: 'Analysis unavailable',
      recommendations: []
    }
  }
}
```

### 2. Performance
- Cache results when possible
- Set timeouts for external API calls
- Use batch operations
- Avoid heavy computations

```typescript
async analyzeContent(content: string) {
  // Truncate large content
  const maxLength = 5000
  if (content.length > maxLength) {
    content = content.substring(0, maxLength)
  }

  // Use timeout for external calls
  const result = await Promise.race([
    this.externalAnalysis(content),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 5000)
    )
  ])

  return result
}
```

### 3. Security
- Validate all input
- Never log sensitive data
- Use HTTPS for external requests
- Store secrets in config, not code

```typescript
async init(context: PluginContext, api: PluginAPI) {
  if (!context.config.apiKey) {
    throw new Error('apiKey is required')
  }
  
  if (typeof context.config.threshold !== 'number') {
    throw new Error('threshold must be a number')
  }

  await super.init(context, api)
}
```

### 4. Testing
```typescript
import { describe, it, expect } from 'vitest'
import { MyPlugin } from './index'

describe('MyPlugin', () => {
  it('should analyze content correctly', async () => {
    const plugin = new MyPlugin()
    const result = await plugin.analyzeContent('test content')
    
    expect(result).toHaveProperty('score')
    expect(result.score).toBeGreaterThanOrEqual(0)
    expect(result.score).toBeLessThanOrEqual(100)
  })
})
```

### 5. Documentation
- Document config options
- Provide usage examples
- Explain analysis methodology
- List dependencies and requirements

---

## Troubleshooting

### Plugin not loading
- Check manifest.json format
- Verify entry point path
- Check browser console for errors

### Performance issues
- Profile your code
- Check external API latency
- Optimize synchronous operations
- Use caching

### Data not persisting
- Verify storage API permissions
- Check key naming
- Ensure await on async calls

---

## Resources

- API Documentation: `/docs/api`
- Example Plugins: `https://github.com/influence-firewall/plugins`
- Support: `developers@influence-firewall.com`
- Community Forum: `https://forum.influence-firewall.com`

