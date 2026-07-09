
/**
 * Influence Firewall - Comprehensive API Specification
 * Enterprise-grade REST API for all operations
 */

export const API_ENDPOINTS = {
  // Analysis Endpoints
  ANALYZE_TEXT: '/api/analyze',
  ANALYZE_URL: '/api/analyze/url',
  ANALYZE_DOCUMENT: '/api/analyze/document',
  ANALYZE_BATCH: '/api/analyze/batch',
  GET_ANALYSIS: '/api/analysis/:id',
  LIST_ANALYSES: '/api/analysis',
  DELETE_ANALYSIS: '/api/analysis/:id',

  // Threat Intelligence Endpoints
  GET_THREAT_PATTERNS: '/api/threats/patterns',
  GET_THREAT_STATISTICS: '/api/threats/statistics',
  GET_THREAT_TIMELINE: '/api/threats/timeline',
  GET_THREAT_SEVERITY: '/api/threats/severity',

  // User Management
  GET_PROFILE: '/api/users/profile',
  UPDATE_PROFILE: '/api/users/profile',
  GET_PERSONAL_VALUES: '/api/users/values',
  UPDATE_PERSONAL_VALUES: '/api/users/values',
  LIST_USERS: '/api/users',
  GET_USER: '/api/users/:id',

  // Plugin System
  LIST_PLUGINS: '/api/plugins',
  GET_PLUGIN: '/api/plugins/:id',
  CREATE_PLUGIN: '/api/plugins',
  UPDATE_PLUGIN: '/api/plugins/:id',
  DELETE_PLUGIN: '/api/plugins/:id',
  PUBLISH_PLUGIN: '/api/plugins/:id/publish',
  LIST_PLUGIN_VERSIONS: '/api/plugins/:id/versions',
  GET_PLUGIN_VERSION: '/api/plugins/:id/versions/:version',
  INSTALL_PLUGIN: '/api/plugins/:id/install',
  UNINSTALL_PLUGIN: '/api/plugins/:id/uninstall',
  LIST_INSTALLED_PLUGINS: '/api/plugins/installed',
  GET_PLUGIN_CONFIG: '/api/plugins/:id/config',
  UPDATE_PLUGIN_CONFIG: '/api/plugins/:id/config',
  RATE_PLUGIN: '/api/plugins/:id/rate',
  LIST_PLUGIN_REVIEWS: '/api/plugins/:id/reviews',

  // Policy Engine
  LIST_POLICIES: '/api/policies',
  GET_POLICY: '/api/policies/:id',
  CREATE_POLICY: '/api/policies',
  UPDATE_POLICY: '/api/policies/:id',
  DELETE_POLICY: '/api/policies/:id',
  VALIDATE_AGAINST_POLICY: '/api/policies/validate',
  GET_POLICY_COMPLIANCE: '/api/policies/:id/compliance',

  // Transparency & Audit
  GET_AUDIT_LOG: '/api/audit/logs',
  GET_AUDIT_ENTRY: '/api/audit/logs/:id',
  EXPORT_AUDIT_LOG: '/api/audit/logs/export',
  GET_TRANSPARENCY_REPORT: '/api/transparency/report',
  GET_SYSTEM_HEALTH: '/api/health',

  // Marketplace
  LIST_MARKETPLACE: '/api/marketplace',
  SEARCH_MARKETPLACE: '/api/marketplace/search',
  GET_MARKETPLACE_STATS: '/api/marketplace/stats',
  GET_FEATURED_PLUGINS: '/api/marketplace/featured',
  GET_TRENDING_PLUGINS: '/api/marketplace/trending',

  // Governance
  LIST_GOVERNANCE_RECORDS: '/api/governance/records',
  GET_GOVERNANCE_RECORD: '/api/governance/records/:id',
  CREATE_GOVERNANCE_RECORD: '/api/governance/records',
  GET_COMPLIANCE_STATUS: '/api/governance/compliance',

  // Reports
  GENERATE_REPORT: '/api/reports/generate',
  GET_REPORT: '/api/reports/:id',
  LIST_REPORTS: '/api/reports',
  EXPORT_REPORT: '/api/reports/:id/export',
  SCHEDULE_REPORT: '/api/reports/schedule',

  // Webhooks
  LIST_WEBHOOKS: '/api/webhooks',
  CREATE_WEBHOOK: '/api/webhooks',
  DELETE_WEBHOOK: '/api/webhooks/:id',
  TEST_WEBHOOK: '/api/webhooks/:id/test',
}

export const API_VERSIONS = {
  V1: 'v1',
  V2: 'v2',
}

export const HTTP_STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  RATE_LIMITED: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
}

export interface APIResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
  meta?: {
    timestamp: string
    requestId: string
    version: string
  }
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface AnalysisRequest {
  content: string
  contentType: 'text' | 'url' | 'document'
  metadata?: Record<string, unknown>
  skipLayers?: string[]
  customRules?: Record<string, unknown>
}

export interface AnalysisResponse {
  id: string
  scores: {
    toxicity: number
    misinformation: number
    manipulation: number
    valuesAlignment: number
    overallRisk: number
  }
  details: {
    toxicity: string
    misinformation: string
    manipulation: string
    valuesAlignment: string
  }
  timestamp: string
}

export interface PluginManifest {
  id: string
  name: string
  version: string
  description: string
  author: string
  license: string
  entry: string
  permissions: string[]
  hooks: string[]
  config: Record<string, unknown>
  dependencies: Record<string, string>
}

export interface PolicyRule {
  id: string
  name: string
  condition: string
  action: 'allow' | 'block' | 'flag' | 'review'
  priority: number
  enabled: boolean
}

export interface AuditLogEntry {
  id: string
  timestamp: string
  userId: string
  action: string
  resource: string
  resourceId: string
  changes: Record<string, unknown>
  ipAddress: string
  userAgent: string
  status: 'success' | 'failure'
}
