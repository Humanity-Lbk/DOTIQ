import { createClient } from '@/lib/supabase/server'
import { AssessmentContent } from './assessment-content'

export default async function AssessmentPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  
  // Allow guest access - we'll prompt them to sign up after completion
  const isGuest = !user

  // If user is logged in, check assessment restrictions
  let canTake = true
  let nextEligibleDate: string | null = null
  let daysTilEligible: number | null = null

  if (user) {
    // Fetch user profile to check role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    // Admins, super_admins, and trey@gethumanity.ai can take unlimited assessments
    const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin' || user.email === 'trey@gethumanity.ai'

    // Fetch the most recent completed assessment
    const { data: latestAssessment } = await supabase
      .from('assessments')
      .select('id, created_at, overall_score')
      .eq('user_id', user.id)
      .eq('is_complete', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    const THREE_MONTHS_MS = 1000 * 60 * 60 * 24 * 90

    // Only enforce 3-month restriction for non-admin users
    if (latestAssessment && !isAdmin) {
      const lastTaken = new Date(latestAssessment.created_at).getTime()
      const now = Date.now()
      const elapsed = now - lastTaken

      if (elapsed < THREE_MONTHS_MS) {
        canTake = false
        const eligibleAt = new Date(lastTaken + THREE_MONTHS_MS)
        nextEligibleDate = eligibleAt.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })
        daysTilEligible = Math.ceil((eligibleAt.getTime() - now) / (1000 * 60 * 60 * 24))
      }
    }
  }

  // Check super admin for quick fill testing feature
  let isSuperAdmin = false
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    isSuperAdmin = profile?.role === 'super_admin'
  }

  return (
    <AssessmentContent
      canTake={canTake}
      nextEligibleDate={nextEligibleDate}
      daysTilEligible={daysTilEligible}
      isGuest={isGuest}
      userEmail={user?.email}
      isSuperAdmin={isSuperAdmin}
    />
  )
}
