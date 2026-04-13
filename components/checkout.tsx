'use client'

import { useCallback } from 'react'
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'

import { startCheckoutSession } from '@/app/actions/stripe'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function Checkout({ 
  productId,
  onComplete 
}: { 
  productId: string
  onComplete?: () => void 
}) {
  const startCheckoutSessionForProduct = useCallback(
    () => startCheckoutSession(productId),
    [productId],
  )

  return (
    <div id="checkout" className="w-full max-w-lg mx-auto">
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={{ 
          clientSecret: startCheckoutSessionForProduct,
          onComplete: onComplete
        }}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  )
}
