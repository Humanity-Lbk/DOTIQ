'use server'

import { stripe } from '@/lib/stripe'
import { PRODUCTS } from '@/lib/products'
import { createClient } from '@/lib/supabase/server'

interface StartReportCheckoutParams {
  productId: string
  assessmentId: string
  email: string
}

export async function startReportCheckoutSession({ productId, assessmentId, email }: StartReportCheckoutParams) {
  try {
    // Verify Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('Stripe is not configured. Please contact support.')
    }

    const product = PRODUCTS.find((p) => p.id === productId)
    if (!product) {
      throw new Error(`Product not found`)
    }

    const supabase = await createClient()
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('Please sign in to purchase a report')
    }

    // Verify assessment belongs to user
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .select('id, user_id')
      .eq('id', assessmentId)
      .single()
    
    if (assessmentError || !assessment) {
      throw new Error('Assessment not found')
    }
    
    if (assessment.user_id !== user.id) {
      throw new Error('You do not have permission to purchase this report')
    }

    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      redirect_on_completion: 'never',
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: product.name,
              description: product.description,
            },
            unit_amount: product.priceInCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      metadata: {
        assessmentId,
        userId: user.id,
        email,
      },
    })

    // Create purchase record
    const { error: purchaseError } = await supabase
      .from('purchases')
      .insert({
        user_id: user.id,
        assessment_id: assessmentId,
        stripe_session_id: session.id,
        amount_cents: product.priceInCents,
        status: 'pending',
      })

    if (purchaseError) {
      console.error('Failed to create purchase record:', purchaseError)
      // Don't throw - we still have a valid checkout session
    }

    return session.client_secret
  } catch (error) {
    // Re-throw with a user-friendly message
    if (error instanceof Error) {
      throw new Error(error.message)
    }
    throw new Error('Failed to start checkout. Please try again.')
  }
}

export async function completeReportPurchase(sessionId: string) {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    
    if (session.payment_status === 'paid') {
      const assessmentId = session.metadata?.assessmentId
      const email = session.metadata?.email
      
      if (!assessmentId) {
        throw new Error('Assessment ID not found in session')
      }

      // Update purchase record
      await supabase
        .from('purchases')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          stripe_payment_intent: session.payment_intent as string,
        })
        .eq('stripe_session_id', sessionId)

      // Update assessment purchased_at
      await supabase
        .from('assessments')
        .update({
          purchased_at: new Date().toISOString(),
        })
        .eq('id', assessmentId)

      // Trigger report generation and email in the background
      // This is done via a fetch call so it doesn't block the purchase completion
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://dotiq.com'
      
      // First generate the report
      fetch(`${baseUrl}/api/report/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assessmentId }),
      }).then(async (res) => {
        if (res.ok) {
          // Then send the email with PDF
          await fetch(`${baseUrl}/api/report/send-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ assessmentId, email }),
          })
        }
      }).catch(err => {
        console.error('Error triggering report generation:', err)
      })

      return { 
        success: true, 
        assessmentId,
        email,
      }
    }
    
    return { success: false, error: 'Payment not completed' }
  } catch (error) {
    console.error('Error completing purchase:', error)
    return { success: false, error: 'Failed to verify payment' }
  }
}

// Legacy function for backwards compatibility
export async function startCheckoutSession(productId: string) {
  const product = PRODUCTS.find((p) => p.id === productId)
  if (!product) {
    throw new Error(`Product with id "${productId}" not found`)
  }

  const session = await stripe.checkout.sessions.create({
    ui_mode: 'embedded',
    redirect_on_completion: 'never',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.name,
            description: product.description,
          },
          unit_amount: product.priceInCents,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
  })

  return session.client_secret
}
