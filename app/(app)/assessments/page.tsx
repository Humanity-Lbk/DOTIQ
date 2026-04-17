import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AssessmentsContent } from '@/app/assessments/assessments-content'

export default async function AssessmentsPage() {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  const { data: assessments } = await supabase
    .from('assessments')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const assessmentIds = assessments?.map((a) => a.id) || []
  const { data: verifications } = await supabase
    .from('verification_requests')
    .select('*')
    .in('assessment_id', assessmentIds.length > 0 ? assessmentIds : ['none'])

  const { data: reports } = await supabase
    .from('reports')
    .select('*')
    .in('assessment_id', assessmentIds.length > 0 ? assessmentIds : ['none'])

  return (
    <AssessmentsContent
      user={user}
      profile={profile}
      assessments={assessments || []}
      verifications={verifications || []}
      reports={reports || []}
    />
  )
}

