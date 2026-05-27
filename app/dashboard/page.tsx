import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardClient from '@/components/dashboard-client'

export const metadata = {
  title: 'Influence Firewall - Dashboard',
  description: 'Analyze digital content for influence and manipulation',
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: analysisHistory } = await supabase
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <DashboardClient initialHistory={analysisHistory || []} />
    </div>
  )
}
