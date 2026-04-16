import 'server-only'

import Stripe from 'stripe'

// Initialize Stripe only if key is available
// The key check is also done in the action to provide user-friendly errors
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_placeholder', {
  apiVersion: '2025-05-28.basil',
})
