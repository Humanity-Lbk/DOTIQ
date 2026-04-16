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

  // Fetch verifications, profile, and report in parallel
  const [{ data: verifications }, { data: profile }, { data: report }] = await Promise.all([
    supabase
      .from('verification_requests')
      .select('*')
      .eq('assessment_id', id)
      .order('created_at', { ascending: true }),
    supabase.from('profiles').select('full_name').eq('id', user.id).single(),
    supabase.from('reports').select('*').eq('assessment_id', id).single(),
  ])
  
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
