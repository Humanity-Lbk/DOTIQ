import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get user's profile to check role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    const { searchParams } = new URL(request.url)
    const assessmentId = searchParams.get('id')
    
    if (!assessmentId) {
      return NextResponse.json({ error: 'Assessment ID required' }, { status: 400 })
    }
    
    // Get the assessment to check ownership
    const { data: assessment, error: fetchError } = await supabase
      .from('assessments')
      .select('user_id')
      .eq('id', assessmentId)
      .single()
    
    if (fetchError || !assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
    }
    
    // Only allow deletion if user owns the assessment OR is a super_admin
    const isOwner = assessment.user_id === user.id
    const isSuperAdmin = profile?.role === 'super_admin'
    
    if (!isOwner && !isSuperAdmin) {
      return NextResponse.json({ error: 'Not authorized to delete this assessment' }, { status: 403 })
    }
    
    // Delete related records first (verification_requests, reports, assessment_shares, purchases)
    await supabase.from('verification_requests').delete().eq('assessment_id', assessmentId)
    await supabase.from('reports').delete().eq('assessment_id', assessmentId)
    await supabase.from('assessment_shares').delete().eq('assessment_id', assessmentId)
    await supabase.from('purchases').delete().eq('assessment_id', assessmentId)
    
    // Delete the assessment
    const { error: deleteError } = await supabase
      .from('assessments')
      .delete()
      .eq('id', assessmentId)
    
    if (deleteError) {
      console.error('Error deleting assessment:', deleteError)
      return NextResponse.json({ error: 'Failed to delete assessment' }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Error in delete assessment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
