import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    const body = await request.json()
    const { 
      token, 
      answers, 
      scores, 
      overallScore,
      // Evaluator account info
      evaluatorEmail,
      evaluatorFullName,
      evaluatorRelation,
      createAccount
    } = body
    
    if (!token || !answers || !scores || overallScore === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    // Get verification request by token
    const { data: verificationRequest, error: fetchError } = await supabase
      .from('verification_requests')
      .select('id, assessment_id, user_id, status, evaluator_name, evaluator_phone, athlete_name')
      .eq('token', token)
      .single()
    
    if (fetchError || !verificationRequest) {
      return NextResponse.json({ error: 'Verification request not found' }, { status: 404 })
    }
    
    if (verificationRequest.status === 'completed') {
      return NextResponse.json({ error: 'Evaluation already completed' }, { status: 400 })
    }
    
    let evaluatorId: string | null = null
    
    // Handle evaluator account creation if requested
    if (createAccount && evaluatorEmail) {
      try {
        // Create admin client for user creation
        const adminSupabase = createAdminClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        )
        
        // Check if user already exists by email
        const { data: existingUsers } = await adminSupabase
          .from('profiles')
          .select('id')
          .eq('email', evaluatorEmail)
          .limit(1)
        
        if (existingUsers && existingUsers.length > 0) {
          // User exists, link to their profile
          evaluatorId = existingUsers[0].id
        } else {
          // Create new user with magic link capability
          // For now, create a profile entry that can be claimed later
          const { data: newUser, error: createError } = await adminSupabase.auth.admin.createUser({
            email: evaluatorEmail,
            email_confirm: true,
            user_metadata: {
              full_name: evaluatorFullName || verificationRequest.evaluator_name,
            }
          })
          
          if (createError) {
            console.error('Error creating user:', createError)
            // Don't fail the whole request, just log
          } else if (newUser.user) {
            evaluatorId = newUser.user.id
            
            // Create profile for new user
            await adminSupabase
              .from('profiles')
              .insert({
                id: newUser.user.id,
                full_name: evaluatorFullName || verificationRequest.evaluator_name,
                email: evaluatorEmail,
                phone: verificationRequest.evaluator_phone,
                role: 'user',
              })
          }
        }
      } catch (accountError) {
        console.error('Error handling evaluator account:', accountError)
        // Don't fail the evaluation submission
      }
    }
    
    // Update verification request with evaluation data and evaluator account link
    const updateData: Record<string, unknown> = {
      answers,
      scores,
      overall_score: overallScore,
      status: 'completed',
      completed_at: new Date().toISOString(),
      evaluator_type: evaluatorRelation || undefined,
    }
    
    if (evaluatorId) {
      updateData.evaluator_id = evaluatorId
    }
    if (evaluatorEmail) {
      updateData.evaluator_email = evaluatorEmail
    }
    if (evaluatorFullName) {
      updateData.evaluator_name = evaluatorFullName
    }
    
    const { error: updateError } = await supabase
      .from('verification_requests')
      .update(updateData)
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
      evaluatorAccountCreated: !!evaluatorId,
    })
    
  } catch (error) {
    console.error('Error in verification complete:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
