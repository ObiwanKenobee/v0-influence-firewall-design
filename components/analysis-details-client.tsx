'use client'

import { Card } from '@/components/ui/card'
import { AlertCircle, CheckCircle, AlertTriangle, Info } from 'lucide-react'

interface AnalysisDetailsClientProps {
  analysis: any
}

export function AnalysisDetailsClient({
  analysis,
}: AnalysisDetailsClientProps) {
  const scores = {
    toxicity: analysis.toxicity_score,
    misinformation: analysis.misinformation_score,
    manipulation: analysis.manipulation_score,
    valuesAlignment: analysis.values_alignment_score,
  }

  const getRiskColor = (score: number, inverted: boolean = false) => {
    const adjustedScore = inverted ? 100 - score : score
    if (adjustedScore >= 75) return 'from-red-600 to-red-700'
    if (adjustedScore >= 50) return 'from-orange-600 to-orange-700'
    if (adjustedScore >= 25) return 'from-yellow-600 to-yellow-700'
    return 'from-green-600 to-green-700'
  }

  const getRiskBadge = (score: number, inverted: boolean = false) => {
    const adjustedScore = inverted ? 100 - score : score
    if (adjustedScore >= 75)
      return (
        <div className="flex items-center gap-1 text-red-400">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm font-semibold">Critical</span>
        </div>
      )
    if (adjustedScore >= 50)
      return (
        <div className="flex items-center gap-1 text-orange-400">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-sm font-semibold">High</span>
        </div>
      )
    if (adjustedScore >= 25)
      return (
        <div className="flex items-center gap-1 text-yellow-400">
          <Info className="w-4 h-4" />
          <span className="text-sm font-semibold">Medium</span>
        </div>
      )
    return (
      <div className="flex items-center gap-1 text-green-400">
        <CheckCircle className="w-4 h-4" />
        <span className="text-sm font-semibold">Low</span>
      </div>
    )
  }

  const ScoreCard = ({
    title,
    score,
    details,
    icon: Icon,
    inverted = false,
  }: {
    title: string
    score: number
    details: string
    icon: any
    inverted?: boolean
  }) => {
    const adjustedScore = inverted ? 100 - score : score
    return (
      <Card className="bg-slate-800 border-slate-700 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-gradient-to-br ${getRiskColor(score, inverted)}`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{title}</h3>
              {getRiskBadge(score, inverted)}
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Risk Level</span>
            <span className="text-2xl font-bold text-white">
              {adjustedScore.toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${getRiskColor(score, inverted)}`}
              style={{ width: `${adjustedScore}%` }}
            />
          </div>
        </div>

        <div className="bg-slate-900 rounded p-3">
          <p className="text-sm text-slate-300 leading-relaxed">{details}</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      {/* Overall Risk Score */}
      <Card className="bg-gradient-to-r from-slate-800 to-slate-700 border-slate-600 p-8">
        <h2 className="text-2xl font-bold text-white mb-4">Overall Risk Assessment</h2>
        <div className="flex items-end gap-8">
          <div>
            <p className="text-slate-400 mb-2">Composite Risk Score</p>
            <div className="text-6xl font-bold text-white">
              {analysis.overall_risk_score}
              <span className="text-3xl text-slate-400">%</span>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-slate-400 mb-2">Risk Level</p>
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`px-4 py-2 rounded-lg font-semibold ${
                  analysis.risk_level === 'Critical'
                    ? 'bg-red-600 text-white'
                    : analysis.risk_level === 'High'
                      ? 'bg-orange-600 text-white'
                      : analysis.risk_level === 'Medium'
                        ? 'bg-yellow-600 text-white'
                        : 'bg-green-600 text-white'
                }`}
              >
                {analysis.risk_level}
              </div>
            </div>
            <p className="text-slate-300 text-sm">
              This content exhibits{' '}
              <strong>
                {analysis.risk_level === 'Critical'
                  ? 'severe influence risks'
                  : analysis.risk_level === 'High'
                    ? 'significant influence risks'
                    : analysis.risk_level === 'Medium'
                      ? 'moderate influence risks'
                      : 'minimal influence risks'}
              </strong>
              . Review the detailed analysis below for specific concerns.
            </p>
          </div>
        </div>
      </Card>

      {/* Defense Layer Scores */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Defense Layer Analysis</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <ScoreCard
            title="Toxicity Detection"
            score={scores.toxicity}
            details={
              analysis.toxicity_details ||
              'Analysis of harmful, hateful, and abusive content.'
            }
            icon={AlertCircle}
          />
          <ScoreCard
            title="Misinformation Detection"
            score={scores.misinformation}
            details={
              analysis.misinformation_details ||
              'Analysis of false claims and misleading statements.'
            }
            icon={AlertTriangle}
          />
          <ScoreCard
            title="Manipulation Patterns"
            score={scores.manipulation}
            details={
              analysis.manipulation_details ||
              'Detection of emotional manipulation and dark patterns.'
            }
            icon={Info}
          />
          <ScoreCard
            title="Values Alignment"
            score={scores.valuesAlignment}
            details={
              analysis.values_alignment_details ||
              'Alignment with human dignity and wellbeing values.'
            }
            icon={CheckCircle}
            inverted
          />
        </div>
      </div>

      {/* Score Comparison */}
      <Card className="bg-slate-800 border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-6">
          Risk Profile Comparison
        </h2>
        <div className="space-y-4">
          {[
            {
              label: 'Toxicity',
              score: scores.toxicity,
              color: 'bg-red-600',
            },
            {
              label: 'Misinformation',
              score: scores.misinformation,
              color: 'bg-orange-600',
            },
            {
              label: 'Manipulation',
              score: scores.manipulation,
              color: 'bg-yellow-600',
            },
            {
              label: 'Values Violation',
              score: 100 - scores.valuesAlignment,
              color: 'bg-purple-600',
            },
          ].map((item) => (
            <div key={item.label}>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-white">
                  {item.label}
                </span>
                <span className="text-sm font-semibold text-slate-300">
                  {item.score.toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full ${item.color}`}
                  style={{ width: `${item.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recommendations */}
      <Card className="bg-slate-800 border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          Recommendations
        </h2>
        <div className="bg-slate-900 rounded p-4 space-y-3">
          <p className="text-slate-300 leading-relaxed">
            Based on the analysis results:
          </p>
          <ul className="space-y-2 text-slate-300 text-sm">
            {analysis.risk_level === 'Critical' && (
              <>
                <li className="flex gap-2">
                  <span className="text-red-400">•</span>
                  <span>
                    This content poses significant influence risks. Consider avoiding or
                    heavily contextualizing consumption.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-400">•</span>
                  <span>
                    Review the specific flagged issues in each defense layer above.
                  </span>
                </li>
              </>
            )}
            {analysis.risk_level === 'High' && (
              <>
                <li className="flex gap-2">
                  <span className="text-orange-400">•</span>
                  <span>
                    This content has notable influence risks. Approach with critical
                    thinking.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-orange-400">•</span>
                  <span>
                    Cross-reference claims with trusted sources and seek alternative
                    perspectives.
                  </span>
                </li>
              </>
            )}
            {analysis.risk_level === 'Medium' && (
              <>
                <li className="flex gap-2">
                  <span className="text-yellow-400">•</span>
                  <span>
                    This content has some potential issues. Standard critical thinking
                    recommended.
                  </span>
                </li>
              </>
            )}
            {analysis.risk_level === 'Low' && (
              <>
                <li className="flex gap-2">
                  <span className="text-green-400">•</span>
                  <span>
                    This content appears relatively low-risk. Standard media literacy
                    applies.
                  </span>
                </li>
              </>
            )}
          </ul>
        </div>
      </Card>
    </div>
  )
}
