'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import ContentInput from './content-input'
import AnalysisResults from './analysis-results'
import AnalysisHistory from './analysis-history'
import { LogOut, Settings } from 'lucide-react'
import Link from 'next/link'

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

export default function DashboardClient({
  initialHistory,
}: {
  initialHistory: HistoryItem[]
}) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisData | null>(
    null
  )
  const [history, setHistory] = useState<HistoryItem[]>(initialHistory)
  const [activeTab, setActiveTab] = useState<'analyze' | 'history'>(
    'analyze'
  )

  const handleAnalyze = async (content: string, contentType: string, sourceUrl?: string) => {
    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          contentType,
          sourceUrl,
        }),
      })

      if (!response.ok) {
        throw new Error('Analysis failed')
      }

      const data: AnalysisData = await response.json()
      setCurrentAnalysis(data)
      setActiveTab('analyze')

      // Refresh history
      const supabase = createClient()
      const { data: newHistory } = await supabase
        .from('analysis_results')
        .select(
          `
          id,
          content_id,
          toxicity_score,
          misinformation_score,
          manipulation_score,
          values_alignment_score,
          overall_risk_score,
          risk_level,
          created_at,
          analyzed_content:content_id (
            content_text,
            content_type,
            source_url
          )
        `
        )
        .order('created_at', { ascending: false })
        .limit(10)

      if (newHistory) {
        setHistory(newHistory)
      }
    } catch (error) {
      console.error('[v0] Analysis error:', error)
      alert('Failed to analyze content. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/auth/login'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Influence Firewall
          </h1>
          <p className="text-slate-400">
            Analyze digital content for manipulation, toxicity, and values alignment
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            asChild
            variant="ghost"
            className="text-slate-400 hover:text-white"
          >
            <Link href="/dashboard/settings">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Link>
          </Button>
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="text-slate-400 hover:text-white"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Analysis Input */}
        <div className="lg:col-span-2">
          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('analyze')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'analyze'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Analyze Content
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'history'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              History
            </button>
          </div>

          {/* Analysis Tab */}
          {activeTab === 'analyze' && (
            <div className="space-y-6">
              <ContentInput
                onAnalyze={handleAnalyze}
                isAnalyzing={isAnalyzing}
              />
              {currentAnalysis && (
                <AnalysisResults analysis={currentAnalysis} />
              )}
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && <AnalysisHistory items={history} />}
        </div>

        {/* Right Column - Quick Stats */}
        <div className="space-y-4">
          <Card className="bg-slate-800 border-slate-700 p-6">
            <h3 className="text-sm font-semibold text-slate-400 mb-4">
              RECENT ANALYSES
            </h3>
            <div className="text-3xl font-bold text-white mb-2">
              {history.length}
            </div>
            <p className="text-sm text-slate-400">
              content items analyzed
            </p>
          </Card>

          {history.length > 0 && (
            <>
              <Card className="bg-slate-800 border-slate-700 p-6">
                <h3 className="text-sm font-semibold text-slate-400 mb-4">
                  RISK DISTRIBUTION
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-red-400">Critical</span>
                    <span className="font-bold text-white">
                      {
                        history.filter((h) => h.risk_level === 'Critical')
                          .length
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-orange-400">High</span>
                    <span className="font-bold text-white">
                      {history.filter((h) => h.risk_level === 'High').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-yellow-400">Medium</span>
                    <span className="font-bold text-white">
                      {
                        history.filter((h) => h.risk_level === 'Medium')
                          .length
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-400">Low</span>
                    <span className="font-bold text-white">
                      {history.filter((h) => h.risk_level === 'Low').length}
                    </span>
                  </div>
                </div>
              </Card>
            </>
          )}

          <Card className="bg-slate-800 border-slate-700 p-6">
            <h3 className="text-sm font-semibold text-slate-400 mb-3">
              DEFENSE LAYERS
            </h3>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                Toxicity Detection
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-orange-500 rounded-full mr-2" />
                Misinformation Detection
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2" />
                Manipulation Patterns
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                Values Alignment
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}
