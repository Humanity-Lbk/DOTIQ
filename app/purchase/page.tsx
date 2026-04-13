'use client'

import { useState, useCallback } from 'react'
import { CheckCircle2, Target, Users, Shield, Brain, ArrowLeft } from 'lucide-react'
import Header from '@/components/header'
import Checkout from '@/components/checkout'
import { PRODUCTS } from '@/lib/products'
import { Button } from '@/components/ui/button'

const features = [
  { icon: Target, label: 'Discipline', description: '12 questions on focus and commitment' },
  { icon: Users, label: 'Ownership', description: '13 questions on accountability and leadership' },
  { icon: Shield, label: 'Toughness', description: '12 questions on mental resilience' },
  { icon: Brain, label: 'Sports IQ', description: '13 questions on game awareness' },
]

export default function PurchasePage() {
  const [showCheckout, setShowCheckout] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const product = PRODUCTS[0]

  const handlePaymentComplete = useCallback(async () => {
    setIsProcessing(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const { useRouter } = await import('next/navigation')
    const router = useRouter()
    router.push('/assessment')
  }, [])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 pt-16">
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
          {!showCheckout ? (
            <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-start">
              {/* Left: Info */}
              <div>
                <p className="text-primary font-medium mb-4 tracking-wide uppercase text-sm">
                  Assessment
                </p>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight mb-6 leading-[1.1]">
                  Unlock Your DOTIQ Score
                </h1>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  Get your complete athletic mindset assessment and discover your strengths across all four pillars.
                </p>

                <div className="space-y-4 mb-10">
                  {features.map((feature) => (
                    <div key={feature.label} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <feature.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{feature.label}</p>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-8">
                  <h3 className="font-semibold text-foreground mb-4">What&apos;s Included</h3>
                  <ul className="space-y-3">
                    {[
                      '50-question comprehensive assessment',
                      'Individual scores for each DOTIQ pillar',
                      'Overall DOTIQ composite score',
                      'Performance level ratings',
                      '30-day access to your results',
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-3 text-muted-foreground text-sm">
                        <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right: Pricing Card */}
              <div className="bg-card border border-border rounded-lg p-8 sticky top-24">
                <div className="text-center mb-8">
                  <h2 className="text-xl font-bold text-foreground mb-4">{product.name}</h2>
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-5xl font-bold text-foreground">
                      ${(product.priceInCents / 100).toFixed(0)}
                    </span>
                    <span className="text-muted-foreground">.{String(product.priceInCents % 100).padStart(2, '0')}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">One-time payment</p>
                </div>

                <Button
                  onClick={() => setShowCheckout(true)}
                  className="w-full h-12 text-base"
                >
                  Purchase Assessment
                </Button>

                <p className="text-center text-xs text-muted-foreground mt-4">
                  Secure checkout powered by Stripe
                </p>

                <div className="mt-8 pt-6 border-t border-border">
                  <p className="text-sm text-muted-foreground text-center">
                    Takes approximately 10 minutes to complete
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-lg mx-auto">
              <button
                onClick={() => setShowCheckout(false)}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to details
              </button>
              
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-foreground">Complete Your Purchase</h1>
                <p className="text-muted-foreground mt-2">Secure checkout powered by Stripe</p>
              </div>

              {isProcessing ? (
                <div className="text-center py-16">
                  <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-foreground font-medium">Processing your payment...</p>
                  <p className="text-muted-foreground text-sm mt-1">Redirecting to assessment...</p>
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
    </div>
  )
}
