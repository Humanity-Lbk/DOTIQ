'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Brain, Target, Shield, Flame } from 'lucide-react'
import Header from '@/components/header'
import Checkout from '@/components/checkout'
import { PRODUCTS } from '@/lib/products'
import { verifyPaymentAndGrantAccess } from '@/app/actions/stripe'

const features = [
  { icon: Brain, label: 'Discipline Assessment', description: '12 questions measuring focus and commitment' },
  { icon: Target, label: 'Ownership Evaluation', description: '13 questions measuring accountability' },
  { icon: Shield, label: 'Toughness Analysis', description: '12 questions measuring resilience' },
  { icon: Flame, label: 'Sports IQ Score', description: '13 questions measuring game awareness' },
]

export default function PurchasePage() {
  const router = useRouter()
  const [showCheckout, setShowCheckout] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const product = PRODUCTS[0]

  const handlePaymentComplete = async () => {
    setIsProcessing(true)
    // Small delay to ensure Stripe has processed
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Get session ID from URL if available, otherwise just grant access
    const urlParams = new URLSearchParams(window.location.search)
    const sessionId = urlParams.get('session_id')
    
    if (sessionId) {
      await verifyPaymentAndGrantAccess(sessionId)
    }
    
    // Redirect to assessment
    router.push('/assessment')
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-12">
        {!showCheckout ? (
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
                Unlock Your DOT IQ
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Get your complete athletic mindset assessment and discover your strengths across all four pillars.
              </p>
            </div>

            {/* Pricing Card */}
            <div className="bg-card border border-border rounded-xl p-8 max-w-md mx-auto">
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold text-foreground">{product.name}</h2>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-bold text-primary">
                    ${(product.priceInCents / 100).toFixed(2)}
                  </span>
                  <span className="text-muted-foreground">one-time</span>
                </div>
                <p className="text-muted-foreground">{product.description}</p>
              </div>

              <div className="mt-8 space-y-4">
                {features.map((feature) => (
                  <div key={feature.label} className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <feature.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{feature.label}</p>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowCheckout(true)}
                className="w-full mt-8 py-4 px-6 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
              >
                Purchase Assessment
              </button>

              <p className="text-center text-sm text-muted-foreground mt-4">
                30-day access to your results
              </p>
            </div>

            {/* What you get */}
            <div className="bg-card/50 border border-border rounded-xl p-8 max-w-2xl mx-auto">
              <h3 className="text-xl font-semibold text-foreground mb-4 text-center">
                What&apos;s Included
              </h3>
              <ul className="space-y-3">
                {[
                  '50-question comprehensive assessment',
                  'Individual scores for each DOT IQ pillar',
                  'Overall DOT IQ composite score',
                  'Performance level ratings (Elite, Strong, Developing, Emerging)',
                  '30-day access to review your results',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-muted-foreground">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <button
              onClick={() => setShowCheckout(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              &larr; Back to details
            </button>
            
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-foreground">Complete Your Purchase</h1>
              <p className="text-muted-foreground mt-2">Secure checkout powered by Stripe</p>
            </div>

            {isProcessing ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-foreground font-medium">Processing your payment...</p>
                <p className="text-muted-foreground text-sm">Redirecting to assessment...</p>
              </div>
            ) : (
              <Checkout 
                productId={product.id} 
                onComplete={handlePaymentComplete}
              />
            )}
          </div>
        )}
      </div>
    </main>
  )
}
