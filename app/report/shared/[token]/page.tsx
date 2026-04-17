import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SharedReportView from './shared-report-view'

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }) {
  return {
    title: 'DOTIQ Assessment Report - Shared',
    description: 'View a shared DOTIQ athletic performance assessment report.',
  }
}

export default async function SharedReportPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const supabase = await createClient()

  try {
    // Fetch the assessment using the share token
    const { data: shareRecord, error: shareError } = await supabase
      .from('assessment_shares')
      .select(`
        id,
        assessment_id,
        shared_at,
        assessments (
          id,
          user_id,
          name,
          is_complete,
          scores,
          created_at,
          profiles (
            full_name,
            role
          )
        )
      `)
      .eq('share_token', token)
      .single()

    if (shareError || !shareRecord) {
      console.error('[v0] Share token not found:', shareError)
      notFound()
    }

    const rawAssessment = (shareRecord as any).assessments
    const assessment = Array.isArray(rawAssessment) ? rawAssessment[0] : rawAssessment
    if (!assessment) {
      notFound()
    }

    return (
      <div className="min-h-screen bg-background">
        <SharedReportView 
          assessment={{
            ...assessment,
            profiles: Array.isArray((assessment as any).profiles)
              ? (assessment as any).profiles[0]
              : (assessment as any).profiles,
          }}
          shareRecord={shareRecord}
        />
      </div>
    )
  } catch (error) {
    console.error('[v0] Error loading shared report:', error)
    notFound()
  }
}
