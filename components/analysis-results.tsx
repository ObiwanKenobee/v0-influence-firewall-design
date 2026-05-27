'use client'

import { Card } from '@/components/ui/card'
import { AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react'

interface AnalysisData {
  contentId: string
  toxicityScore: number
  toxicityDetails: string
  misinformationScore: number
  misinformationDetails: string
  manipulationScore: number
  manipulationDetails: string
  valuesAlignmentScore: number
  valuesAlignmentDetails: string
  overallRiskScore: number
  riskLevel: string
}

interface AnalysisResultsProps {
  analysis: AnalysisData
}

function RiskGauge({ score }: { score: number }) {
  let color = 'bg-green-600'
  let label = 'Low'

  if (score >= 75) {
    color = 'bg-red-600'
    label = 'Critical'
  } else if (score >= 50) {
    color = 'bg-orange-600'
    label = 'High'
  } else if (score >= 25) {
    color = 'bg-yellow-600'
    label = 'Medium'
  }

  return (
    <div className="flex items-center gap-3">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="rgb(51, 65, 85)"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray={`${(score / 100) * 251.2} 251.2`}
            className={color}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{score}</div>
            <div className="text-xs text-slate-400">/ 100</div>
          </div>
        </div>
      </div>
      <div>
        <div className="text-sm font-semibold text-slate-300">Risk Level</div>
        <div className={`text-lg font-bold ${
          color === 'bg-green-600' ? 'text-green-400' :
          color === 'bg-yellow-600' ? 'text-yellow-400' :
          color === 'bg-orange-600' ? 'text-orange-400' :
          'text-red-400'
        }`}>
          {label}
        </div>
      </div>
    </div>
  )
}

function ScoreCard({
  title,
  score,
  details,
  icon,
}: {
  title: string
  score: number
  details: string
  icon: React.ReactNode
}) {
  const getColor = (score: number) => {
    if (score >= 75) return 'border-red-600'
    if (score >= 50) return 'border-orange-600'
    if (score >= 25) return 'border-yellow-600'
    return 'border-green-600'
  }

  const getTextColor = (score: number) => {
    if (score >= 75) return 'text-red-400'
    if (score >= 50) return 'text-orange-400'
    if (score >= 25) return 'text-yellow-400'
    return 'text-green-400'
  }

  return (
    <Card className={`bg-slate-800 border-slate-700 p-4 border-l-4 ${getColor(score)}`}>
      <div className="flex items-start gap-3">
        <div className="text-slate-400 mt-1">{icon}</div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-white">{title}</h3>
            <span className={`text-lg font-bold ${getTextColor(score)}`}>
              {score}%
            </span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2 mb-2">
            <div
              className={`h-full rounded-full transition-all ${
                score >= 75
                  ? 'bg-red-600'
                  : score >= 50
                  ? 'bg-orange-600'
                  : score >= 25
                  ? 'bg-yellow-600'
                  : 'bg-green-600'
              }`}
              style={{ width: `${score}%` }}
            />
          </div>
          <p className="text-sm text-slate-400">{details}</p>
        </div>
      </div>
    </Card>
  )
}

export default function AnalysisResults({ analysis }: AnalysisResultsProps) {
  return (
    <div className="space-y-6">
      {/* Overall Risk Score */}
      <Card className="bg-gradient-to-br from-slate-800 to-slate-750 border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-6">
          Overall Influence Risk Assessment
        </h2>
        <RiskGauge score={analysis.overallRiskScore} />
        <div className="mt-6 p-4 bg-slate-700 rounded-lg">
          <p className="text-sm text-slate-300">
            This content presents a <span className="font-semibold">{analysis.riskLevel}</span> level of influence risk based on detected patterns of toxicity, misinformation, manipulation, and values alignment.
          </p>
        </div>
      </Card>

      {/* Individual Scores */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">
          Cognitive Defense Layer Analysis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ScoreCard
            title="Toxicity Detection"
            score={analysis.toxicityScore}
            details={analysis.toxicityDetails}
            icon={<AlertTriangle className="w-5 h-5" />}
          />
          <ScoreCard
            title="Misinformation Detection"
            score={analysis.misinformationScore}
            details={analysis.misinformationDetails}
            icon={<AlertCircle className="w-5 h-5" />}
          />
          <ScoreCard
            title="Manipulation Patterns"
            score={analysis.manipulationScore}
            details={analysis.manipulationDetails}
            icon={<AlertTriangle className="w-5 h-5" />}
          />
          <ScoreCard
            title="Values Alignment"
            score={analysis.valuesAlignmentScore}
            details={analysis.valuesAlignmentDetails}
            icon={<CheckCircle className="w-5 h-5" />}
          />
        </div>
      </div>

      {/* Interpretation Guide */}
      <Card className="bg-slate-800 border-slate-700 p-6">
        <h3 className="font-semibold text-white mb-3">How to Interpret</h3>
        <div className="space-y-2 text-sm text-slate-300">
          <div className="flex gap-3">
            <span className="text-red-400 font-semibold">0-25%:</span>
            <span>Low risk - Content appears safe and aligned with values</span>
          </div>
          <div className="flex gap-3">
            <span className="text-yellow-400 font-semibold">25-50%:</span>
            <span>Moderate risk - Some concerning patterns detected</span>
          </div>
          <div className="flex gap-3">
            <span className="text-orange-400 font-semibold">50-75%:</span>
            <span>High risk - Significant manipulation or misinformation</span>
          </div>
          <div className="flex gap-3">
            <span className="text-red-600 font-semibold">75-100%:</span>
            <span>Critical risk - Severe toxicity or extreme manipulation detected</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
