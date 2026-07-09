
/**
 * Plugin Development Framework
 * SDK for building Influence Firewall plugins
 */

export type HookName = 
  | 'on_analysis_start'
  | 'on_toxicity_score'
  | 'on_misinformation_score'
  | 'on_manipulation_score'
  | 'on_values_alignment_score'
  | 'on_analysis_complete'
  | 'on_policy_evaluate'
  | 'on_threat_detected'

export interface PluginContext {
  pluginId: string
  pluginVersion: string
  userId: string
  config: Record<string, unknown>
  logger: {
    info: (message: string, data?: Record<string, unknown>) => void
    warn: (message: string, data?: Record<string, unknown>) => void
    error: (message: string, error?: Error) => void
    debug: (message: string, data?: Record<string, unknown>) => void
  }
}

export interface HookPayload {
  [key: string]: unknown
}

export type HookHandler = (context: PluginContext, payload: HookPayload) => Promise<HookPayload>

export interface PluginAPI {
  hooks: {
    register: (hookName: HookName, handler: HookHandler) => void
    unregister: (hookName: HookName) => void
  }
  storage: {
    get: (key: string) => Promise<unknown>
    set: (key: string, value: unknown) => Promise<void>
    delete: (key: string) => Promise<void>
  }
  api: {
    analyze: (content: string, type: string) => Promise<Record<string, unknown>>
    getPolicies: () => Promise<Record<string, unknown>[]>
    evaluatePolicy: (payload: Record<string, unknown>) => Promise<Record<string, unknown>>
  }
  events: {
    emit: (eventName: string, data: Record<string, unknown>) => void
    on: (eventName: string, handler: (data: Record<string, unknown>) => void) => void
  }
}

/**
 * Base Plugin Class
 */
export abstract class BasePlugin {
  protected context!: PluginContext
  protected api!: PluginAPI

  /**
   * Plugin initialization
   */
  async init(context: PluginContext, api: PluginAPI): Promise<void> {
    this.context = context
    this.api = api
    this.context.logger.info('Plugin initialized', { pluginId: this.context.pluginId })
  }

  /**
   * Plugin activation
   */
  async activate(): Promise<void> {
    this.context.logger.info('Plugin activated')
  }

  /**
   * Plugin deactivation
   */
  async deactivate(): Promise<void> {
    this.context.logger.info('Plugin deactivated')
  }

  /**
   * Plugin configuration validation
   */
  async validateConfig(config: Record<string, unknown>): Promise<{
    valid: boolean
    errors: string[]
  }> {
    return { valid: true, errors: [] }
  }

  /**
   * Handle plugin lifecycle
   */
  async onLifecycleEvent(event: 'install' | 'uninstall' | 'update'): Promise<void> {
    this.context.logger.info('Lifecycle event', { event })
  }
}

/**
 * Analysis Layer Plugin - Extends analysis layers
 */
export class AnalysisLayerPlugin extends BasePlugin {
  protected layerName: string = 'custom_layer'

  /**
   * Analyze content
   */
  protected async analyzeContent(content: string): Promise<{
    score: number
    details: string
    recommendations?: string[]
  }> {
    throw new Error('analyzeContent must be implemented')
  }

  /**
   * Register analysis hook
   */
  protected registerAnalysisHook() {
    this.api.hooks.register('on_analysis_complete', async (context, payload) => {
      const analysis = await this.analyzeContent(payload.content as string)
      return {
        ...payload,
        customLayers: {
          ...(payload.customLayers as Record<string, unknown>),
          [this.layerName]: analysis,
        },
      }
    })
  }
}

/**
 * Data Source Plugin - Adds new content sources
 */
export class DataSourcePlugin extends BasePlugin {
  protected sourceName: string = 'custom_source'

  /**
   * Extract content from source
   */
  protected async extractContent(source: string): Promise<string> {
    throw new Error('extractContent must be implemented')
  }

  /**
   * Register data source
   */
  protected registerDataSource() {
    this.api.events.on(`data_source:${this.sourceName}`, async (data) => {
      const content = await this.extractContent(data.source as string)
      this.api.events.emit('content_extracted', { source: this.sourceName, content })
    })
  }
}

/**
 * Policy Plugin - Custom policy rules
 */
export class PolicyPlugin extends BasePlugin {
  protected policyName: string = 'custom_policy'

  /**
   * Evaluate custom policy
   */
  protected async evaluatePolicy(payload: Record<string, unknown>): Promise<{
    matched: boolean
    action: 'allow' | 'block' | 'flag' | 'review'
    reason: string
  }> {
    throw new Error('evaluatePolicy must be implemented')
  }

  /**
   * Register policy
   */
  protected registerPolicy() {
    this.api.hooks.register('on_policy_evaluate', async (context, payload) => {
      const result = await this.evaluatePolicy(payload)
      return {
        ...payload,
        customPolicies: {
          ...(payload.customPolicies as Record<string, unknown>),
          [this.policyName]: result,
        },
      }
    })
  }
}

/**
 * Output Sink Plugin - Sends data to external systems
 */
export class OutputSinkPlugin extends BasePlugin {
  protected sinkName: string = 'custom_sink'

  /**
   * Process and send data
   */
  protected async processAndSend(data: Record<string, unknown>): Promise<void> {
    throw new Error('processAndSend must be implemented')
  }

  /**
   * Register sink
   */
  protected registerSink() {
    this.api.hooks.register('on_analysis_complete', async (context, payload) => {
      await this.processAndSend(payload)
      return payload
    })
  }
}

/**
 * Viewer Plugin - Custom UI components
 */
export class ViewerPlugin extends BasePlugin {
  protected componentName: string = 'custom_viewer'

  /**
   * Render custom visualization
   */
  protected async renderVisualization(
    data: Record<string, unknown>
  ): Promise<{
    html: string
    css?: string
    js?: string
  }> {
    throw new Error('renderVisualization must be implemented')
  }

  /**
   * Register viewer
   */
  protected registerViewer() {
    this.api.events.on(`view:${this.componentName}`, async (data) => {
      const viz = await this.renderVisualization(data)
      this.api.events.emit('visualization_rendered', { component: this.componentName, ...viz })
    })
  }
}

/**
 * Plugin Manifest Builder
 */
export class PluginManifestBuilder {
  private manifest: any = {
    id: '',
    name: '',
    version: '1.0.0',
    description: '',
    author: '',
    license: 'MIT',
    entry: 'index.ts',
    permissions: [],
    hooks: [],
    config: {},
  }

  setId(id: string): this {
    this.manifest.id = id
    return this
  }

  setName(name: string): this {
    this.manifest.name = name
    return this
  }

  setVersion(version: string): this {
    this.manifest.version = version
    return this
  }

  setDescription(description: string): this {
    this.manifest.description = description
    return this
  }

  setAuthor(author: string): this {
    this.manifest.author = author
    return this
  }

  setEntry(entry: string): this {
    this.manifest.entry = entry
    return this
  }

  addPermission(permission: string): this {
    this.manifest.permissions.push(permission)
    return this
  }

  addHook(hook: HookName): this {
    this.manifest.hooks.push(hook)
    return this
  }

  addConfig(key: string, value: unknown): this {
    this.manifest.config[key] = value
    return this
  }

  build() {
    return this.manifest
  }
}

/**
 * Example: Create a simple custom analysis layer plugin
 */
export class SentimentAnalysisPlugin extends AnalysisLayerPlugin {
  constructor() {
    super()
    this.layerName = 'sentiment_analysis'
  }

  async init(context: PluginContext, api: PluginAPI) {
    await super.init(context, api)
    this.registerAnalysisHook()
  }

  protected async analyzeContent(content: string) {
    // Simple sentiment analysis - in production, use proper NLP
    const positiveWords = ['good', 'great', 'excellent', 'love', 'amazing']
    const negativeWords = ['bad', 'terrible', 'hate', 'awful', 'horrible']

    const lower = content.toLowerCase()
    const positiveCount = positiveWords.filter((w) => lower.includes(w)).length
    const negativeCount = negativeWords.filter((w) => lower.includes(w)).length

    const score = Math.min(100, Math.max(0, 50 + (positiveCount - negativeCount) * 10))

    return {
      score,
      details: `Sentiment score: ${score}/100 (${score > 60 ? 'positive' : 'negative'})`,
      recommendations:
        score < 30
          ? ['Consider rephrasing with more constructive language']
          : ['Content sentiment is constructive'],
    }
  }
}
