'use server'

import { cookies } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { PRODUCTS } from '@/lib/products'

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

export async function verifyPaymentAndGrantAccess(sessionId: string) {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    
    if (session.payment_status === 'paid') {
      // Set a cookie to grant access to the assessment
      const cookieStore = await cookies()
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 30) // 30 days access
      
      cookieStore.set('dotiq_access', 'granted', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: expiresAt,
      })
      
      return { success: true }
    }
    
    return { success: false, error: 'Payment not completed' }
  } catch (error) {
    return { success: false, error: 'Failed to verify payment' }
  }
}

export async function checkAssessmentAccess() {
  const cookieStore = await cookies()
  const access = cookieStore.get('dotiq_access')
  return access?.value === 'granted'
}
