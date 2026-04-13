'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import Header from '@/components/header'
import Checkout from '@/components/checkout'
import { PRODUCTS } from '@/lib/products'

const features = [
  { num: '01', label: 'INTAKE', title: '50 Questions', desc: 'Answer on a 1-10 scale. Your baseline.' },
  { num: '02', label: 'INTELLIGENCE', title: 'Instant Scoring', desc: 'All four pillars with insights and narratives.' },
  { num: '03', label: 'EXECUTION', title: 'Action Plan', desc: 'Personalized scripts, weekly focus, targets.' },
  { num: '04', label: 'RESOURCES', title: 'Development', desc: 'Tools and materials for your journey.' },
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

  if (showCheckout) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16 px-4 py-12">
          <div className="max-w-lg mx-auto">
            <button
              onClick={() => setShowCheckout(false)}
              className="text-muted-foreground hover:text-foreground transition-colors mb-8 text-sm"
            >
              {'← Back to details'}
            </button>
            
            <div className="text-center mb-8 space-y-2">
              <h1 className="text-3xl font-black text-foreground">Complete Your Purchase</h1>
              <p className="text-muted-foreground text-sm font-mono">SECURE CHECKOUT · STRIPE</p>
            </div>

            {isProcessing ? (
              <div className="text-center py-16">
                <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-foreground font-medium">Processing payment...</p>
                <p className="text-muted-foreground text-sm mt-1">Redirecting to assessment...</p>
              </div>
            ) : (
              <Checkout 
                productId={product.id} 
                onComplete={handlePaymentComplete}
              />
            )}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 pt-16 px-4 py-12 md:py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <p className="text-sm font-mono text-muted-foreground uppercase tracking-widest">
              {'>> PRODUCT: DOTIQ_ASSESSMENT'}
            </p>
            <h1 className="text-5xl md:text-6xl font-black">
              Unlock Your Score
            </h1>
            <p className="text-lg text-muted-foreground">
              Get your complete athletic mindset assessment and discover your strengths across all four pillars.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-4 gap-4 py-8">
            {features.map((feature) => (
              <div
                key={feature.num}
                className="border border-border rounded-lg p-4 space-y-2"
              >
                <p className="text-primary font-mono text-sm font-bold">
                  {feature.num} {`// ${feature.label}`}
                </p>
                <h3 className="font-bold text-sm">{feature.title}</h3>
                <p className="text-xs text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* Pricing Card */}
          <div className="border border-border rounded-lg p-8 space-y-6 max-w-md">
            <div className="space-y-2">
              <h2 className="text-xl font-bold">{product.name}</h2>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-black">
                  ${(product.priceInCents / 100).toFixed(0)}
                </span>
                <span className="text-muted-foreground text-sm">.{String(product.priceInCents % 100).padStart(2, '0')}</span>
              </div>
              <p className="text-sm text-muted-foreground">One-time payment</p>
            </div>

            <button
              onClick={() => setShowCheckout(true)}
              className="w-full py-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-all"
            >
              Continue to Checkout
            </button>

            <div className="space-y-2 border-t border-border pt-6">
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                {'>> WHAT\'S INCLUDED'}
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">·</span>
                  <span>50-question assessment</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">·</span>
                  <span>Instant scoring & insights</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">·</span>
                  <span>Personalized action plan</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">·</span>
                  <span>30-day access to results</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Quote */}
          <div className="border-l-4 border-primary pl-6 py-4 italic text-muted-foreground">
            &quot;Most training focuses on what an athlete can DO. We develop who an athlete IS.&quot;
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 text-center">
        <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
          {'>> DOTIQ · DOT IN · BE IQ'}
        </p>
      </footer>
    </div>
  )
}
