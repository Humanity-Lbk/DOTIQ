import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardContent } from '@/app/dashboard/dashboard-content'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/auth/login')
  }

  const [{ data: profile }, { data: latestAssessmentArr }, { data: submittedEvaluations }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase
      .from('assessments')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_complete', true)
      .order('created_at', { ascending: false })
      .limit(1),
    supabase
      .from('verification_requests')
      .select('*')
      .eq('evaluator_id', user.id)
      .order('completed_at', { ascending: false }),
  ])

  const latestAssessment = latestAssessmentArr?.[0] ?? null
  const { data: verifications } = latestAssessment
    ? await supabase
        .from('verification_requests')
        .select('*')
        .eq('assessment_id', latestAssessment.id)
    : { data: [] }

  return (
    <DashboardContent
      user={user}
      profile={profile}
      latestAssessment={latestAssessment}
      verifications={verifications || []}
      submittedEvaluations={submittedEvaluations || []}
    />
  )
}

