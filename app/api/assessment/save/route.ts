import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    const { answers, scores, overall_score } = body
    
    if (!answers || !scores || overall_score === undefined) {
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
      
      if (error) throw error
      assessment = data
    } else {
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
      
      if (error) throw error
      assessment = data
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
