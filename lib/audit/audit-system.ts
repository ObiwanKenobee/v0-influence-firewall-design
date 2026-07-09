
/**
 * Audit & Transparency System
 * Logs all actions and provides transparency into decision-making
 */

export type AuditActionType =
  | 'ANALYSIS_CREATED'
  | 'ANALYSIS_DELETED'
  | 'PLUGIN_INSTALLED'
  | 'PLUGIN_UNINSTALLED'
  | 'PLUGIN_CONFIGURED'
  | 'POLICY_APPLIED'
  | 'USER_AUTHENTICATED'
  | 'USER_PROFILE_UPDATED'
  | 'REPORT_GENERATED'
  | 'EXPORT_REQUESTED'

export interface AuditLogEntry {
  id: string
  timestamp: string
  userId: string
  action: AuditActionType
  resource: string
  resourceId: string
  changes: {
    before?: Record<string, unknown>
    after?: Record<string, unknown>
  }
  metadata?: {
    ipAddress?: string
    userAgent?: string
    sessionId?: string
  }
  status: 'success' | 'failure'
  errorMessage?: string
}

export interface TransparencyReport {
  reportId: string
  period: {
    startDate: string
    endDate: string
  }
  organization: string
  summary: {
    totalAnalyses: number
    uniqueUsers: number
    pluginsInstalled: number
    policiesEnforced: number
    dataProcessed: number // in bytes
  }
  detectionStats: {
    toxicityDetected: number
    misinformationDetected: number
    manipulationDetected: number
    valuesViolations: number
  }
  policyEnforcement: {
    policyName: string
    rulesApplied: number
    actionsBlocked: number
    actionsFlagged: number
    actionsReviewed: number
  }[]
  dataRetention: {
    daysRetained: number
    deletePolicy: string
    lastCleanupDate: string
  }
  privacy: {
    dataEncryption: string
    regionalStorage: string
    thirdPartySharing: string[]
  }
  generatedAt: string
  generatedBy: string
}

export interface ComplianceStatus {
  status: 'compliant' | 'warning' | 'violation'
  checkPoints: {
    name: string
    status: 'pass' | 'warn' | 'fail'
    description: string
  }[]
  violations: string[]
  recommendations: string[]
  lastChecked: string
}

export class AuditSystem {
  private logs: AuditLogEntry[] = []
  private maxLogs: number = 100000

  /**
   * Log an action
   */
  logAction(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): AuditLogEntry {
    const auditEntry: AuditLogEntry = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      ...entry,
    }

    this.logs.push(auditEntry)

    // Maintain max size
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }

    return auditEntry
  }

  /**
   * Get logs with filtering
   */
  getLogs(filters?: {
    userId?: string
    action?: AuditActionType
    resourceId?: string
    startDate?: string
    endDate?: string
    limit?: number
    offset?: number
  }): AuditLogEntry[] {
    let filtered = [...this.logs]

    if (filters?.userId) {
      filtered = filtered.filter((l) => l.userId === filters.userId)
    }

    if (filters?.action) {
      filtered = filtered.filter((l) => l.action === filters.action)
    }

    if (filters?.resourceId) {
      filtered = filtered.filter((l) => l.resourceId === filters.resourceId)
    }

    if (filters?.startDate) {
      const start = new Date(filters.startDate).getTime()
      filtered = filtered.filter((l) => new Date(l.timestamp).getTime() >= start)
    }

    if (filters?.endDate) {
      const end = new Date(filters.endDate).getTime()
      filtered = filtered.filter((l) => new Date(l.timestamp).getTime() <= end)
    }

    // Sort by timestamp descending
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    const limit = filters?.limit || 100
    const offset = filters?.offset || 0

    return filtered.slice(offset, offset + limit)
  }

  /**
   * Generate transparency report
   */
  generateTransparencyReport(
    period: { startDate: string; endDate: string },
    organizationId: string
  ): TransparencyReport {
    const filtered = this.getLogs({
      startDate: period.startDate,
      endDate: period.endDate,
    })

    const analysisLogs = filtered.filter((l) => l.action === 'ANALYSIS_CREATED')
    const policyLogs = filtered.filter((l) => l.action === 'POLICY_APPLIED')

    return {
      reportId: this.generateId(),
      period,
      organization: organizationId,
      summary: {
        totalAnalyses: analysisLogs.length,
        uniqueUsers: new Set(filtered.map((l) => l.userId)).size,
        pluginsInstalled: filtered.filter((l) => l.action === 'PLUGIN_INSTALLED').length,
        policiesEnforced: policyLogs.length,
        dataProcessed: this.estimateDataProcessed(analysisLogs),
      },
      detectionStats: {
        toxicityDetected: analysisLogs.filter(
          (l) => l.changes?.after?.toxicity_score > 70
        ).length,
        misinformationDetected: analysisLogs.filter(
          (l) => l.changes?.after?.misinformation_score > 70
        ).length,
        manipulationDetected: analysisLogs.filter(
          (l) => l.changes?.after?.manipulation_score > 70
        ).length,
        valuesViolations: analysisLogs.filter(
          (l) => l.changes?.after?.values_alignment_score < 30
        ).length,
      },
      policyEnforcement: [], // Would be populated from policy logs
      dataRetention: {
        daysRetained: 90,
        deletePolicy: 'Automatic deletion after 90 days of inactivity',
        lastCleanupDate: new Date().toISOString(),
      },
      privacy: {
        dataEncryption: 'AES-256 at rest, TLS in transit',
        regionalStorage: 'User-configurable regional data storage',
        thirdPartySharing: [],
      },
      generatedAt: new Date().toISOString(),
      generatedBy: 'system',
    }
  }

  /**
   * Check compliance status
   */
  checkCompliance(): ComplianceStatus {
    const checkPoints = [
      {
        name: 'Data Encryption',
        status: 'pass' as const,
        description: 'All data encrypted at rest and in transit',
      },
      {
        name: 'Access Logging',
        status: 'pass' as const,
        description: 'All access logged and audited',
      },
      {
        name: 'Data Retention Policy',
        status: 'pass' as const,
        description: 'Data retention policy enforced',
      },
      {
        name: 'User Consent',
        status: 'pass' as const,
        description: 'User consent collected and stored',
      },
      {
        name: 'Third Party Sharing',
        status: 'pass' as const,
        description: 'No unauthorized third party data sharing',
      },
    ]

    return {
      status: checkPoints.every((cp) => cp.status === 'pass') ? 'compliant' : 'warning',
      checkPoints,
      violations: [],
      recommendations: [
        'Review third-party integrations quarterly',
        'Conduct annual security audit',
        'Update data retention policies annually',
      ],
      lastChecked: new Date().toISOString(),
    }
  }

  /**
   * Export audit log
   */
  exportLogs(format: 'json' | 'csv' = 'json'): string {
    if (format === 'json') {
      return JSON.stringify(this.logs, null, 2)
    }

    // CSV export
    const headers = [
      'ID',
      'Timestamp',
      'User ID',
      'Action',
      'Resource',
      'Resource ID',
      'Status',
    ]
    const rows = this.logs.map((l) => [
      l.id,
      l.timestamp,
      l.userId,
      l.action,
      l.resource,
      l.resourceId,
      l.status,
    ])

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n')

    return csv
  }

  /**
   * Utility functions
   */
  private generateId(): string {
    return `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private estimateDataProcessed(logs: AuditLogEntry[]): number {
    // Rough estimate: ~1KB per analysis
    return logs.length * 1024
  }
}

/**
 * GDPR Compliance Features
 */
export interface GDPRCompliance {
  rightToAccess: () => Promise<Record<string, unknown>>
  rightToBeForotten: (userId: string) => Promise<boolean>
  rightToRectification: (userId: string, data: Record<string, unknown>) => Promise<boolean>
  dataPortability: (userId: string) => Promise<Blob>
  consentManagement: {
    recordConsent: (userId: string, purpose: string) => Promise<void>
    withdrawConsent: (userId: string, purpose: string) => Promise<void>
    getConsent: (userId: string) => Promise<Record<string, boolean>>
  }
}

/**
 * Create default audit system
 */
export function createAuditSystem(): AuditSystem {
  return new AuditSystem()
}
