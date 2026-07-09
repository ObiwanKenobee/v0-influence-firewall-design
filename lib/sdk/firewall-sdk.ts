
/**
 * Influence Firewall SDK - Client library for integration
 * Use this SDK to integrate Influence Firewall into your applications
 */

import { AnalysisRequest, AnalysisResponse, APIResponse, API_ENDPOINTS } from '../api/api-specification'

export class InfluenceFirewallSDK {
  private apiKey: string
  private baseUrl: string
  private timeout: number

  constructor(config: {
    apiKey: string
    baseUrl?: string
    timeout?: number
  }) {
    this.apiKey = config.apiKey
    this.baseUrl = config.baseUrl || 'https://api.influence-firewall.com'
    this.timeout = config.timeout || 30000
  }

  /**
   * Analyze text content
   */
  async analyzeText(content: string, options?: { metadata?: Record<string, unknown> }) {
    return this.analyze({
      content,
      contentType: 'text',
      metadata: options?.metadata,
    })
  }

  /**
   * Analyze URL content
   */
  async analyzeUrl(url: string, options?: { metadata?: Record<string, unknown> }) {
    return this.analyze({
      content: url,
      contentType: 'url',
      metadata: options?.metadata,
    })
  }

  /**
   * Analyze document/file
   */
  async analyzeDocument(file: File, options?: { metadata?: Record<string, unknown> }) {
    const formData = new FormData()
    formData.append('file', file)
    if (options?.metadata) {
      formData.append('metadata', JSON.stringify(options.metadata))
    }

    return this.request<AnalysisResponse>(
      'POST',
      API_ENDPOINTS.ANALYZE_DOCUMENT,
      formData
    )
  }

  /**
   * Batch analyze multiple items
   */
  async analyzeBatch(items: AnalysisRequest[]) {
    return this.request<AnalysisResponse[]>(
      'POST',
      API_ENDPOINTS.ANALYZE_BATCH,
      { items }
    )
  }

  /**
   * Get analysis results
   */
  async getAnalysis(id: string) {
    return this.request<AnalysisResponse>(
      'GET',
      API_ENDPOINTS.GET_ANALYSIS.replace(':id', id)
    )
  }

  /**
   * List user's analyses
   */
  async listAnalyses(options?: {
    limit?: number
    offset?: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }) {
    const params = new URLSearchParams()
    if (options?.limit) params.append('limit', String(options.limit))
    if (options?.offset) params.append('offset', String(options.offset))
    if (options?.sortBy) params.append('sortBy', options.sortBy)
    if (options?.sortOrder) params.append('sortOrder', options.sortOrder)

    return this.request(
      'GET',
      `${API_ENDPOINTS.LIST_ANALYSES}?${params.toString()}`
    )
  }

  /**
   * Delete analysis
   */
  async deleteAnalysis(id: string) {
    return this.request(
      'DELETE',
      API_ENDPOINTS.GET_ANALYSIS.replace(':id', id)
    )
  }

  /**
   * Get threat intelligence
   */
  async getThreatPatterns() {
    return this.request(
      'GET',
      API_ENDPOINTS.GET_THREAT_PATTERNS
    )
  }

  /**
   * Get threat statistics
   */
  async getThreatStatistics(options?: { period?: 'day' | 'week' | 'month' | 'year' }) {
    const params = new URLSearchParams()
    if (options?.period) params.append('period', options.period)

    return this.request(
      'GET',
      `${API_ENDPOINTS.GET_THREAT_STATISTICS}?${params.toString()}`
    )
  }

  /**
   * Install plugin
   */
  async installPlugin(pluginId: string, config?: Record<string, unknown>) {
    return this.request(
      'POST',
      API_ENDPOINTS.INSTALL_PLUGIN.replace(':id', pluginId),
      { config }
    )
  }

  /**
   * Uninstall plugin
   */
  async uninstallPlugin(pluginId: string) {
    return this.request(
      'DELETE',
      API_ENDPOINTS.UNINSTALL_PLUGIN.replace(':id', pluginId)
    )
  }

  /**
   * List installed plugins
   */
  async listInstalledPlugins() {
    return this.request(
      'GET',
      API_ENDPOINTS.LIST_INSTALLED_PLUGINS
    )
  }

  /**
   * Get plugin config
   */
  async getPluginConfig(pluginId: string) {
    return this.request(
      'GET',
      API_ENDPOINTS.GET_PLUGIN_CONFIG.replace(':id', pluginId)
    )
  }

  /**
   * Update plugin config
   */
  async updatePluginConfig(pluginId: string, config: Record<string, unknown>) {
    return this.request(
      'PUT',
      API_ENDPOINTS.UPDATE_PLUGIN_CONFIG.replace(':id', pluginId),
      { config }
    )
  }

  /**
   * List marketplace plugins
   */
  async listMarketplace(options?: {
    category?: string
    sortBy?: string
    limit?: number
    offset?: number
  }) {
    const params = new URLSearchParams()
    if (options?.category) params.append('category', options.category)
    if (options?.sortBy) params.append('sortBy', options.sortBy)
    if (options?.limit) params.append('limit', String(options.limit))
    if (options?.offset) params.append('offset', String(options.offset))

    return this.request(
      'GET',
      `${API_ENDPOINTS.LIST_MARKETPLACE}?${params.toString()}`
    )
  }

  /**
   * Search marketplace
   */
  async searchMarketplace(query: string, options?: { limit?: number }) {
    const params = new URLSearchParams()
    params.append('q', query)
    if (options?.limit) params.append('limit', String(options.limit))

    return this.request(
      'GET',
      `${API_ENDPOINTS.SEARCH_MARKETPLACE}?${params.toString()}`
    )
  }

  /**
   * Get user profile
   */
  async getProfile() {
    return this.request('GET', API_ENDPOINTS.GET_PROFILE)
  }

  /**
   * Update user profile
   */
  async updateProfile(data: Record<string, unknown>) {
    return this.request(
      'PUT',
      API_ENDPOINTS.UPDATE_PROFILE,
      data
    )
  }

  /**
   * Get personal values
   */
  async getPersonalValues() {
    return this.request('GET', API_ENDPOINTS.GET_PERSONAL_VALUES)
  }

  /**
   * Update personal values
   */
  async updatePersonalValues(values: string[]) {
    return this.request(
      'PUT',
      API_ENDPOINTS.UPDATE_PERSONAL_VALUES,
      { values }
    )
  }

  /**
   * Generate report
   */
  async generateReport(options?: {
    startDate?: string
    endDate?: string
    format?: 'json' | 'pdf' | 'csv'
  }) {
    return this.request(
      'POST',
      API_ENDPOINTS.GENERATE_REPORT,
      options
    )
  }

  /**
   * Get audit log
   */
  async getAuditLog(options?: { limit?: number; offset?: number }) {
    const params = new URLSearchParams()
    if (options?.limit) params.append('limit', String(options.limit))
    if (options?.offset) params.append('offset', String(options.offset))

    return this.request(
      'GET',
      `${API_ENDPOINTS.GET_AUDIT_LOG}?${params.toString()}`
    )
  }

  /**
   * Get system health
   */
  async getSystemHealth() {
    return this.request('GET', API_ENDPOINTS.GET_SYSTEM_HEALTH)
  }

  /**
   * Internal request method
   */
  private async request<T = unknown>(
    method: string,
    endpoint: string,
    body?: unknown
  ): Promise<APIResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      'User-Agent': 'InfluenceFirewall-SDK/1.0.0',
    }

    const fetchOptions: RequestInit = {
      method,
      headers,
      timeout: this.timeout,
    }

    if (body) {
      if (body instanceof FormData) {
        delete headers['Content-Type']
        fetchOptions.body = body
      } else {
        fetchOptions.body = JSON.stringify(body)
      }
    }

    try {
      const response = await fetch(url, fetchOptions)

      if (!response.ok) {
        const error = await response.json()
        return {
          success: false,
          error: {
            code: `HTTP_${response.status}`,
            message: error.message || response.statusText,
            details: error.details,
          },
        }
      }

      const data = await response.json()
      return data
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network error',
        },
      }
    }
  }
}

/**
 * Initialize SDK
 */
export function createFirewallClient(config: {
  apiKey: string
  baseUrl?: string
}) {
  return new InfluenceFirewallSDK(config)
}
