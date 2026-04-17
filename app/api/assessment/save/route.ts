import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { answers, scores, overall_score } = body

    if (!answers || !scores || overall_score === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Use admin client to bypass RLS — auth is already verified above
    const admin = createAdminClient()

    const { data: assessment, error: insertError } = await admin
      .from('assessments')
      .insert({
        user_id: user.id,
        answers,
        scores,
        overall_score,
        is_complete: true,
      })
      .select()
      .single()

    if (insertError) {
      // If unique constraint on user_id blocks the insert (migration not yet run),
      // fall back to the most recent existing assessment so the UI still works.
      if (insertError.code === '23505') {
        const { data: existing } = await admin
          .from('assessments')
          .select('id')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (existing) {
          return NextResponse.json({ success: true, assessment_id: existing.id, fallback: true })
        }
      }
      console.error('[assessment/save] Insert error:', insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, assessment_id: assessment.id })

  } catch (error) {
    console.error('[assessment/save] Unexpected error:', error)
    return NextResponse.json({ error: 'Failed to save assessment' }, { status: 500 })
  }
}
