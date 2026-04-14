'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '@/components/header'
import Checkout from '@/components/checkout'
import { PRODUCTS } from '@/lib/products'

const features = [
  { 
    title: 'Detailed Pillar Analysis', 
    desc: 'Deep dive into each of your four DOTIQ pillars with specific insights.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  { 
    title: 'Personalized Action Plan', 
    desc: 'Custom weekly focus areas, reset scripts, and growth targets.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  { 
    title: 'Development Resources', 
    desc: 'Access to guides, exercises, and materials for your journey.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  { 
    title: '30-Day Access', 
    desc: 'Full access to your results and resources for 30 days.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
]

export default function PurchasePage() {
  const router = useRouter()
  const [showCheckout, setShowCheckout] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const product = PRODUCTS[0]

  const handlePaymentComplete = useCallback(async () => {
    setIsProcessing(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    router.push('/dashboard')
  }, [router])

  if (showCheckout) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16 px-6 py-12">
          <div className="max-w-lg mx-auto">
            <button
              onClick={() => setShowCheckout(false)}
              className="text-muted-foreground hover:text-foreground transition-colors mb-8 text-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to details
            </button>
            
            <div className="text-center mb-8 space-y-2">
              <h1 className="text-3xl font-black">Complete Your Purchase</h1>
              <p className="text-muted-foreground text-sm">Secure checkout powered by Stripe</p>
            </div>

            {isProcessing ? (
              <div className="text-center py-16">
                <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-foreground font-medium">Processing payment...</p>
                <p className="text-muted-foreground text-sm mt-1">Unlocking your full report...</p>
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
      
      <main className="flex-1 pt-16">
        {/* Hero with Gradient */}
        <section className="relative py-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-fuchsia-800/20 to-cyan-700/10" />
          <div className="absolute top-0 right-0 w-[50%] h-[80%] bg-gradient-to-bl from-primary/20 via-purple-500/10 to-transparent blur-3xl" />
          
          <div className="relative z-10 max-w-4xl mx-auto px-6 text-center space-y-6">
            <p className="text-primary font-semibold text-sm tracking-wide">Unlock Full Report</p>
            <h1 className="text-5xl md:text-6xl font-black text-balance">
              Get Your Complete DOTIQ Analysis
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Unlock detailed insights, personalized action plans, and development resources based on your assessment.
            </p>
          </div>
        </section>

        {/* Main Content */}
        <section className="max-w-5xl mx-auto px-6 py-16">
          <div className="grid lg:grid-cols-5 gap-12 items-start">
            {/* Features */}
            <div className="lg:col-span-3 space-y-8">
              <h2 className="text-2xl font-black">What&apos;s Included</h2>
              
              <div className="grid sm:grid-cols-2 gap-6">
                {features.map((feature) => (
                  <div
                    key={feature.title}
                    className="bg-card border border-border rounded-2xl p-6 space-y-3 hover:border-primary/30 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      {feature.icon}
                    </div>
                    <h3 className="font-bold text-lg">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
                  </div>
                ))}
              </div>

              {/* Quote */}
              <blockquote className="border-l-4 border-primary pl-6 py-4">
                <p className="text-lg italic text-muted-foreground">
                  &quot;Most training focuses on what an athlete can DO. We develop who an athlete IS.&quot;
                </p>
              </blockquote>
            </div>

            {/* Pricing Card */}
            <div className="lg:col-span-2">
              <div className="sticky top-24 bg-card border border-border rounded-2xl p-8 space-y-6">
                <div className="space-y-2">
                  <h2 className="text-xl font-bold">{product.name}</h2>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black">
                      ${(product.priceInCents / 100).toFixed(0)}
                    </span>
                    <span className="text-muted-foreground">.{String(product.priceInCents % 100).padStart(2, '0')}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">One-time payment</p>
                </div>

                <button
                  onClick={() => setShowCheckout(true)}
                  className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-full hover:scale-[1.02] transition-transform shadow-lg shadow-primary/25"
                >
                  Unlock Full Report
                </button>

                <div className="space-y-3 pt-4 border-t border-border">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Instant access after payment</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Secure checkout via Stripe</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>30-day access to full report</span>
                  </div>
                </div>

                <p className="text-xs text-center text-muted-foreground">
                  Haven&apos;t taken the assessment yet?{' '}
                  <Link href="/assessment" className="text-primary hover:underline">
                    Start free
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6 bg-card/30">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-black text-sm">D</span>
            </div>
            <span className="font-bold">DOTIQ</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Discipline · Ownership · Toughness · IQ
          </p>
        </div>
      </footer>
    </div>
  )
}
