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
  
  // Run profile and assessments queries in parallel
  const [profileResult, assessmentsResult, submittedResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('*, role')
      .eq('id', user.id)
      .single(),
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
      .order('completed_at', { ascending: false })
  ])
  
  const profile = profileResult.data
  const assessments = assessmentsResult.data
  const submittedEvaluations = submittedResult.data
  
  // Get verification requests for assessments (depends on assessments result)
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
