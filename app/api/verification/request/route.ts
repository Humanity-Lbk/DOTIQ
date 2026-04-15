import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { nanoid } from 'nanoid'

// This would be replaced with Twilio or another SMS provider in production
async function sendSMS(phone: string, message: string) {
  // For now, just log the message
  console.log(`[SMS] To: ${phone}, Message: ${message}`)
  
  // In production, integrate with Twilio:
  // const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  // await twilio.messages.create({
  //   body: message,
  //   from: process.env.TWILIO_PHONE_NUMBER,
  //   to: phone,
  // })
  
  return true
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    const { assessmentId, evaluatorType, evaluatorName, evaluatorPhone, athleteName } = body
    
    if (!assessmentId || !evaluatorType || !evaluatorName || !evaluatorPhone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    // Validate evaluator type
    const validTypes = ['coach', 'parent', 'peer', 'mentor']
    if (!validTypes.includes(evaluatorType)) {
      return NextResponse.json({ error: 'Invalid evaluator type' }, { status: 400 })
    }
    
    // Check if there's already a pending/sent request for this type and assessment
    const { data: existing } = await supabase
      .from('verification_requests')
      .select('id, status')
      .eq('assessment_id', assessmentId)
      .eq('evaluator_type', evaluatorType)
      .in('status', ['pending', 'sent'])
      .single()
    
    if (existing) {
      return NextResponse.json({ 
        error: `A ${evaluatorType} verification request is already pending` 
      }, { status: 400 })
    }
    
    const token = nanoid(32)
    
    // Format phone number
    const formattedPhone = evaluatorPhone.startsWith('+') 
      ? evaluatorPhone 
      : `+1${evaluatorPhone.replace(/\D/g, '')}`
    
    // Insert verification request
    const { data, error } = await supabase
      .from('verification_requests')
      .insert({
        assessment_id: assessmentId,
        user_id: user.id,
        evaluator_type: evaluatorType,
        evaluator_name: evaluatorName,
        evaluator_phone: formattedPhone,
        athlete_name: athleteName,
        token,
        status: 'sent',
        sent_at: new Date().toISOString(),
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error creating verification request:', error)
      return NextResponse.json({ error: 'Failed to create verification request' }, { status: 500 })
    }
    
    // Build the evaluation URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://dotiq.vercel.app'
    const evaluationUrl = `${baseUrl}/evaluate/${token}`
    
    // Send SMS
    const message = `${athleteName} has asked you to evaluate their athletic mindset as their ${evaluatorType}. Complete the assessment here: ${evaluationUrl}`
    
    try {
      await sendSMS(formattedPhone, message)
    } catch (smsError) {
      console.error('Error sending SMS:', smsError)
      // Update status to pending if SMS failed
      await supabase
        .from('verification_requests')
        .update({ status: 'pending' })
        .eq('id', data.id)
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Verification request sent',
      evaluationUrl, // For development/testing
    })
    
  } catch (error) {
    console.error('Error in verification request:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
