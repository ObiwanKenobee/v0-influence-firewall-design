import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Download, Share2 } from 'lucide-react'
import Link from 'next/link'
import { AnalysisDetailsClient } from '@/components/analysis-details-client'

export const metadata = {
  title: 'Analysis Details - Influence Firewall',
  description: 'View detailed analysis results',
}

export default async function AnalysisDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/auth/login')
  }

  // Fetch analysis results
  const { data: analysis, error: analysisError } = await supabase
    .from('analysis_results')
    .select(
      `
      *,
      analyzed_content: content_id (
        id,
        content_text,
        content_type,
        source_url,
        created_at
      )
    `
    )
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (analysisError || !analysis) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            asChild
            variant="outline"
            className="mb-4 border-slate-600 text-slate-300 hover:bg-slate-800"
          >
            <Link href="/dashboard" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Analysis Details
              </h1>
              <p className="text-slate-400">
                Analyzed on{' '}
                {new Date(
                  analysis.analyzed_content?.created_at || analysis.created_at
                ).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>

        {/* Content Overview */}
        <Card className="bg-slate-800 border-slate-700 mb-8 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Content Analyzed
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-slate-500 mb-1">Type</p>
              <p className="text-white capitalize">
                {analysis.analyzed_content?.content_type.replace(/_/g, ' ')}
              </p>
            </div>
            {analysis.analyzed_content?.source_url && (
              <div>
                <p className="text-sm text-slate-500 mb-1">Source</p>
                <a
                  href={analysis.analyzed_content.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 break-all"
                >
                  {analysis.analyzed_content.source_url}
                </a>
              </div>
            )}
            <div>
              <p className="text-sm text-slate-500 mb-2">Preview</p>
              <div className="bg-slate-900 rounded p-3 max-h-32 overflow-y-auto">
                <p className="text-slate-300 text-sm leading-relaxed">
                  {analysis.analyzed_content?.content_text.substring(0, 300)}
                  {(analysis.analyzed_content?.content_text.length || 0) > 300
                    ? '...'
                    : ''}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Detailed Analysis Results */}
        <AnalysisDetailsClient analysis={analysis} />

        {/* Export Options */}
        <Card className="bg-slate-800 border-slate-700 mt-8 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Export</h2>
          <div className="flex gap-3">
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => {
                const data = JSON.stringify(analysis, null, 2)
                const blob = new Blob([data], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `analysis-${id}.json`
                a.click()
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              Export as JSON
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
