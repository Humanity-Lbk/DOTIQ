import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { FullReport } from './full-report'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ReportPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect('/auth/login')
  }
  
  // Get assessment
  const { data: assessment, error: assessmentError } = await supabase
    .from('assessments')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()
  
  if (assessmentError || !assessment) {
    notFound()
  }
  
  // Note: We no longer redirect non-purchased assessments - the FullReport component
  // will show preview data with an option to purchase
  
  // Get verification requests
  const { data: verifications } = await supabase
    .from('verification_requests')
    .select('*')
    .eq('assessment_id', id)
    .order('created_at', { ascending: true })
  
  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()
  
  // Get existing report (if any)
  const { data: report } = await supabase
    .from('reports')
    .select('*')
    .eq('assessment_id', id)
    .single()
  
  return (
    <FullReport 
      assessment={assessment}
      verifications={verifications || []}
      userName={profile?.full_name || 'Athlete'}
      aiReport={report?.content || null}
      shareToken={report?.share_token || null}
      isPurchased={!!assessment.purchased_at}
      userEmail={user.email}
    />
  )
}
