import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardContent } from './dashboard-content'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect('/auth/login')
  }
  
  // Fetch profile, assessments, and submitted evaluations in parallel
  const [{ data: profile }, { data: assessments }, { data: submittedEvaluations }] = await Promise.all([
    supabase.from('profiles').select('*, role').eq('id', user.id).single(),
    supabase
      .from('assessments')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_complete', true)
      .order('created_at', { ascending: false }),
    supabase
      .from('verification_requests')
      .select('*')
      .eq('evaluator_id', user.id)
      .order('completed_at', { ascending: false }),
  ])

  // Get verification requests for user's assessments (needs assessmentIds from above)
  const assessmentIds = assessments?.map(a => a.id) || []
  const { data: verifications } = await supabase
    .from('verification_requests')
    .select('*')
    .in('assessment_id', assessmentIds.length > 0 ? assessmentIds : ['none'])
  
  return (
    <DashboardContent 
      user={user}
      profile={profile}
      assessments={assessments || []}
      verifications={verifications || []}
      submittedEvaluations={submittedEvaluations || []}
    />
  )
}
