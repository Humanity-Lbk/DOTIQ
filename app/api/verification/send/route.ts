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
    const { assessmentId, evaluators } = body
    
    if (!assessmentId || !evaluators) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    // Validate evaluators
    const evaluatorTypes = ['coach', 'peer', 'mentor'] as const
    for (const type of evaluatorTypes) {
      if (!evaluators[type]?.name || !evaluators[type]?.phone) {
        return NextResponse.json({ error: `Missing ${type} information` }, { status: 400 })
      }
    }
    
    // Get user profile for personalized message
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()
    
    const userName = profile?.full_name || 'An athlete'
    
    // Create verification requests for each evaluator
    const verificationRequests = []
    
    for (const type of evaluatorTypes) {
      const token = nanoid(32)
      const evaluator = evaluators[type]
      
      // Format phone number
      const formattedPhone = evaluator.phone.startsWith('+') 
        ? evaluator.phone 
        : `+1${evaluator.phone.replace(/\D/g, '')}`
      
      // Insert verification request
      const { data, error } = await supabase
        .from('verification_requests')
        .insert({
          assessment_id: assessmentId,
          user_id: user.id,
          evaluator_type: type,
          evaluator_name: evaluator.name,
          evaluator_phone: formattedPhone,
          token,
          status: 'sent',
          sent_at: new Date().toISOString(),
        })
        .select()
        .single()
      
      if (error) {
        console.error('Error creating verification request:', error)
        continue
      }
      
      // Build the evaluation URL
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://dotiq.vercel.app'
      const evaluationUrl = `${baseUrl}/evaluate/${token}`
      
      // Send SMS
      const message = `${userName} has asked you to evaluate their athletic mindset as their ${type}. Complete a quick assessment here: ${evaluationUrl}`
      
      try {
        await sendSMS(formattedPhone, message)
        verificationRequests.push(data)
      } catch (smsError) {
        console.error('Error sending SMS:', smsError)
        // Update status to pending if SMS failed
        await supabase
          .from('verification_requests')
          .update({ status: 'pending' })
          .eq('id', data.id)
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Verification requests sent',
      count: verificationRequests.length,
    })
    
  } catch (error) {
    console.error('Error in verification send:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
