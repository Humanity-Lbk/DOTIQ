import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    const body = await request.json()
    const { token, answers, scores, overallScore } = body
    
    if (!token || !answers || !scores || overallScore === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    // Get verification request by token
    const { data: verificationRequest, error: fetchError } = await supabase
      .from('verification_requests')
      .select('id, assessment_id, user_id, status')
      .eq('token', token)
      .single()
    
    if (fetchError || !verificationRequest) {
      return NextResponse.json({ error: 'Verification request not found' }, { status: 404 })
    }
    
    if (verificationRequest.status === 'completed') {
      return NextResponse.json({ error: 'Evaluation already completed' }, { status: 400 })
    }
    
    // Update verification request with evaluation data
    const { error: updateError } = await supabase
      .from('verification_requests')
      .update({
        answers,
        scores,
        overall_score: overallScore,
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', verificationRequest.id)
    
    if (updateError) {
      console.error('Error updating verification request:', updateError)
      return NextResponse.json({ error: 'Failed to save evaluation' }, { status: 500 })
    }
    
    // Check if all 3 evaluations are complete for this assessment
    const { data: allRequests } = await supabase
      .from('verification_requests')
      .select('status, overall_score')
      .eq('assessment_id', verificationRequest.assessment_id)
    
    const completedEvaluations = allRequests?.filter(r => r.status === 'completed') || []
    
    // If all 3 are complete, calculate verified score and update assessment
    if (completedEvaluations.length >= 3) {
      // Get the original assessment score
      const { data: assessment } = await supabase
        .from('assessments')
        .select('overall_score')
        .eq('id', verificationRequest.assessment_id)
        .single()
      
      // Calculate average of all scores (self + 3 evaluators)
      const selfScore = assessment?.overall_score || 0
      const evaluatorScores = completedEvaluations.map(e => e.overall_score || 0)
      const allScores = [selfScore, ...evaluatorScores]
      const verifiedScore = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
      
      // Update assessment as verified
      await supabase
        .from('assessments')
        .update({
          is_verified: true,
          verified_score: verifiedScore,
          updated_at: new Date().toISOString(),
        })
        .eq('id', verificationRequest.assessment_id)
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Evaluation submitted successfully',
      completedCount: completedEvaluations.length,
    })
    
  } catch (error) {
    console.error('Error in verification complete:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
