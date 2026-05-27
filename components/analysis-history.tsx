'use client'

import { Card } from '@/components/ui/card'
import { formatDistanceToNow } from 'date-fns'

interface HistoryItem {
  id: string
  content_id: string
  toxicity_score: number
  misinformation_score: number
  manipulation_score: number
  values_alignment_score: number
  overall_risk_score: number
  risk_level: string
  created_at: string
  analyzed_content: {
    content_text: string
    content_type: string
    source_url: string | null
  }
}

interface AnalysisHistoryProps {
  items: HistoryItem[]
}

function getRiskColor(level: string) {
  switch (level) {
    case 'Critical':
      return 'bg-red-900 text-red-200'
    case 'High':
      return 'bg-orange-900 text-orange-200'
    case 'Medium':
      return 'bg-yellow-900 text-yellow-200'
    case 'Low':
      return 'bg-green-900 text-green-200'
    default:
      return 'bg-slate-700 text-slate-200'
  }
}

function getContentPreview(text: string) {
  return text.length > 100 ? `${text.substring(0, 100)}...` : text
}

export default function AnalysisHistory({ items }: AnalysisHistoryProps) {
  if (items.length === 0) {
    return (
      <Card className="bg-slate-800 border-slate-700 p-8 text-center">
        <p className="text-slate-400">No analyses yet. Start by analyzing some content!</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <Card
          key={item.id}
          className="bg-slate-800 border-slate-700 p-4 hover:border-slate-600 transition-colors"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Content Preview */}
            <div className="md:col-span-2">
              <div className="flex items-start gap-2 mb-2">
                <span className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-300">
                  {item.analyzed_content.content_type.toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-slate-300">
                {getContentPreview(item.analyzed_content.content_text)}
              </p>
              {item.analyzed_content.source_url && (
                <p className="text-xs text-slate-500 mt-1">
                  {item.analyzed_content.source_url}
                </p>
              )}
              <p className="text-xs text-slate-500 mt-2">
                {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
              </p>
            </div>

            {/* Risk Level */}
            <div>
              <div className="text-xs text-slate-400 mb-1 font-semibold">RISK LEVEL</div>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getRiskColor(
                  item.risk_level
                )}`}
              >
                {item.risk_level}
              </span>
              <div className="text-xs text-slate-400 mt-2">
                Score: {item.overall_risk_score}
              </div>
            </div>

            {/* Quick Metrics */}
            <div>
              <div className="text-xs text-slate-400 mb-3 font-semibold">METRICS</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500">Toxicity:</span>
                  <br />
                  <span className="font-bold text-white">{item.toxicity_score}%</span>
                </div>
                <div>
                  <span className="text-slate-500">Misinformation:</span>
                  <br />
                  <span className="font-bold text-white">{item.misinformation_score}%</span>
                </div>
                <div>
                  <span className="text-slate-500">Manipulation:</span>
                  <br />
                  <span className="font-bold text-white">{item.manipulation_score}%</span>
                </div>
                <div>
                  <span className="text-slate-500">Values:</span>
                  <br />
                  <span className="font-bold text-white">{item.values_alignment_score}%</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
