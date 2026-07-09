
/**
 * Policy Engine - Governance & Rule Enforcement
 * Enables organizations to define and enforce content policies
 */

export type PolicyAction = 'allow' | 'block' | 'flag' | 'review' | 'redact'
export type PolicyConditionType = 'score' | 'pattern' | 'keyword' | 'attribute'

export interface PolicyCondition {
  type: PolicyConditionType
  layer: 'toxicity' | 'misinformation' | 'manipulation' | 'valuesAlignment' | 'any'
  operator: 'greater_than' | 'less_than' | 'equals' | 'contains' | 'matches'
  value: number | string
}

export interface PolicyRule {
  id: string
  name: string
  description: string
  conditions: PolicyCondition[]
  action: PolicyAction
  metadata?: Record<string, unknown>
  priority: number
  enabled: boolean
  tags: string[]
  createdAt: string
  updatedAt: string
  createdBy: string
}

export interface PolicySet {
  id: string
  name: string
  description: string
  rules: PolicyRule[]
  organizationId: string
  isDefault: boolean
  version: number
  createdAt: string
  updatedAt: string
}

export interface AnalysisScores {
  toxicity: number
  misinformation: number
  manipulation: number
  valuesAlignment: number
}

export interface PolicyEvaluationResult {
  ruleId: string
  ruleName: string
  matched: boolean
  action: PolicyAction
  metadata?: Record<string, unknown>
}

export class PolicyEngine {
  private rules: PolicyRule[] = []
  private cache: Map<string, PolicyEvaluationResult[]> = new Map()

  constructor(policySet?: PolicySet) {
    if (policySet) {
      this.rules = policySet.rules.filter((r) => r.enabled)
    }
  }

  /**
   * Add a policy rule
   */
  addRule(rule: PolicyRule) {
    this.rules.push(rule)
    this.sortByPriority()
    this.clearCache()
  }

  /**
   * Remove a policy rule
   */
  removeRule(ruleId: string) {
    this.rules = this.rules.filter((r) => r.id !== ruleId)
    this.clearCache()
  }

  /**
   * Update a policy rule
   */
  updateRule(ruleId: string, updates: Partial<PolicyRule>) {
    const rule = this.rules.find((r) => r.id === ruleId)
    if (rule) {
      Object.assign(rule, updates)
      this.sortByPriority()
      this.clearCache()
    }
  }

  /**
   * Evaluate analysis against all rules
   */
  evaluate(scores: AnalysisScores): PolicyEvaluationResult[] {
    const results: PolicyEvaluationResult[] = []

    for (const rule of this.rules) {
      if (this.matchesConditions(rule.conditions, scores)) {
        results.push({
          ruleId: rule.id,
          ruleName: rule.name,
          matched: true,
          action: rule.action,
          metadata: rule.metadata,
        })

        // Stop at first matching rule if it's a block action
        if (rule.action === 'block') {
          break
        }
      }
    }

    return results
  }

  /**
   * Check if all conditions match
   */
  private matchesConditions(
    conditions: PolicyCondition[],
    scores: AnalysisScores
  ): boolean {
    return conditions.every((condition) => this.matchesCondition(condition, scores))
  }

  /**
   * Check if a single condition matches
   */
  private matchesCondition(condition: PolicyCondition, scores: AnalysisScores): boolean {
    const scoreValue =
      condition.layer === 'any'
        ? Math.max(
            scores.toxicity,
            scores.misinformation,
            scores.manipulation,
            100 - scores.valuesAlignment
          )
        : scores[condition.layer]

    switch (condition.type) {
      case 'score':
        return this.compareScores(scoreValue, condition.operator, condition.value as number)

      case 'pattern':
      case 'keyword':
        // Pattern matching would be implemented here
        return true

      case 'attribute':
        // Attribute matching
        return true

      default:
        return false
    }
  }

  /**
   * Compare score values
   */
  private compareScores(
    value: number,
    operator: string,
    threshold: number
  ): boolean {
    switch (operator) {
      case 'greater_than':
        return value > threshold
      case 'less_than':
        return value < threshold
      case 'equals':
        return value === threshold
      default:
        return false
    }
  }

  /**
   * Sort rules by priority (highest first)
   */
  private sortByPriority() {
    this.rules.sort((a, b) => b.priority - a.priority)
  }

  /**
   * Clear cache
   */
  private clearCache() {
    this.cache.clear()
  }

  /**
   * Get all rules
   */
  getRules(): PolicyRule[] {
    return [...this.rules]
  }

  /**
   * Get rule count
   */
  getRuleCount(): number {
    return this.rules.length
  }
}

/**
 * Standard Policy Templates
 */
export const POLICY_TEMPLATES = {
  STRICT_MODERATION: {
    name: 'Strict Moderation',
    description: 'Block any content with significant toxicity or misinformation',
    rules: [
      {
        name: 'Block High Toxicity',
        conditions: [
          {
            type: 'score' as PolicyConditionType,
            layer: 'toxicity' as const,
            operator: 'greater_than' as const,
            value: 75,
          },
        ],
        action: 'block' as PolicyAction,
        priority: 100,
      },
      {
        name: 'Block Likely Misinformation',
        conditions: [
          {
            type: 'score' as PolicyConditionType,
            layer: 'misinformation' as const,
            operator: 'greater_than' as const,
            value: 80,
          },
        ],
        action: 'block' as PolicyAction,
        priority: 95,
      },
      {
        name: 'Flag Manipulation Attempts',
        conditions: [
          {
            type: 'score' as PolicyConditionType,
            layer: 'manipulation' as const,
            operator: 'greater_than' as const,
            value: 70,
          },
        ],
        action: 'flag' as PolicyAction,
        priority: 80,
      },
    ],
  },

  BALANCED_APPROACH: {
    name: 'Balanced Approach',
    description: 'Flag concerning content but allow most content with warnings',
    rules: [
      {
        name: 'Flag High Toxicity',
        conditions: [
          {
            type: 'score' as PolicyConditionType,
            layer: 'toxicity' as const,
            operator: 'greater_than' as const,
            value: 70,
          },
        ],
        action: 'flag' as PolicyAction,
        priority: 80,
      },
      {
        name: 'Review Severe Misinformation',
        conditions: [
          {
            type: 'score' as PolicyConditionType,
            layer: 'misinformation' as const,
            operator: 'greater_than' as const,
            value: 85,
          },
        ],
        action: 'review' as PolicyAction,
        priority: 85,
      },
    ],
  },

  PERMISSIVE: {
    name: 'Permissive',
    description: 'Only flag extreme cases, allow most content',
    rules: [
      {
        name: 'Block Extreme Toxicity',
        conditions: [
          {
            type: 'score' as PolicyConditionType,
            layer: 'toxicity' as const,
            operator: 'greater_than' as const,
            value: 90,
          },
        ],
        action: 'block' as PolicyAction,
        priority: 100,
      },
    ],
  },

  VALUES_ALIGNED: {
    name: 'Values-Aligned',
    description: 'Enforce alignment with constitutional values',
    rules: [
      {
        name: 'Block Values Violations',
        conditions: [
          {
            type: 'score' as PolicyConditionType,
            layer: 'valuesAlignment' as const,
            operator: 'less_than' as const,
            value: 30,
          },
        ],
        action: 'block' as PolicyAction,
        priority: 100,
      },
      {
        name: 'Flag Values Concerns',
        conditions: [
          {
            type: 'score' as PolicyConditionType,
            layer: 'valuesAlignment' as const,
            operator: 'less_than' as const,
            value: 50,
          },
        ],
        action: 'flag' as PolicyAction,
        priority: 80,
      },
    ],
  },
}

/**
 * Create policy engine from template
 */
export function createPolicyFromTemplate(
  templateName: keyof typeof POLICY_TEMPLATES
): PolicyEngine {
  const template = POLICY_TEMPLATES[templateName]
  const engine = new PolicyEngine()

  template.rules.forEach((ruleData, idx) => {
    const rule: PolicyRule = {
      id: `rule-${idx}`,
      name: ruleData.name,
      description: '',
      conditions: ruleData.conditions,
      action: ruleData.action,
      priority: ruleData.priority,
      enabled: true,
      tags: [templateName],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'system',
    }
    engine.addRule(rule)
  })

  return engine
}
