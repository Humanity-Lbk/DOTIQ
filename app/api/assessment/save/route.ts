import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    console.log('[v0] Assessment save API called')
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    console.log('[v0] Auth check - user:', user?.id, 'error:', authError?.message)
    
    if (authError || !user) {
      console.log('[v0] Unauthorized - no user found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    const { answers, scores, overall_score } = body
    
    console.log('[v0] Received data - answers:', Object.keys(answers || {}).length, 'score:', overall_score)
    
    if (!answers || !scores || overall_score === undefined) {
      console.log('[v0] Missing required fields')
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    // Check if user already has an incomplete assessment to update
    const { data: existingAssessment } = await supabase
      .from('assessments')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_complete', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    
    let assessment
    
    if (existingAssessment) {
      console.log('[v0] Updating existing incomplete assessment:', existingAssessment.id)
      // Update existing assessment
      const { data, error } = await supabase
        .from('assessments')
        .update({
          answers,
          scores,
          overall_score,
          is_complete: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingAssessment.id)
        .select()
        .single()
      
      if (error) {
        console.error('[v0] Update error:', error)
        throw error
      }
      assessment = data
      console.log('[v0] Updated assessment:', assessment.id)
    } else {
      console.log('[v0] Creating new assessment for user:', user.id)
      // Create new assessment
      const { data, error } = await supabase
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
      
      if (error) {
        console.error('[v0] Insert error:', error)
        throw error
      }
      assessment = data
      console.log('[v0] Created assessment:', assessment.id)
    }
    
    return NextResponse.json({ 
      success: true, 
      assessment_id: assessment.id 
    })
    
  } catch (error) {
    console.error('Error saving assessment:', error)
    return NextResponse.json(
      { error: 'Failed to save assessment' }, 
      { status: 500 }
    )
  }
}
